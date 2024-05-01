"use client";

import debug from "debug";
import {
  useState,
  useEffect,
  useContext,
  useReducer,
  createContext,
  ReactNode,
} from "react";
import { User } from "firebase/auth";
import { auth } from "../firebase-config";
import { Account, CURRENT_VERSION, loadAccount } from "@/data/accountLib";
import {
  Profile,
  loadProfiles,
  getEmptyProfile,
  updateProfile,
  saveProfile as fsSaveProfile,
} from "@/data/profileLib";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useRouter, usePathname } from "next/navigation";

import { useNostrContext } from "./NostrContext";
import { getDefaultRelays } from "@/data/relays";
import { updateDoc } from "firebase/firestore";

const defaultRelays = getDefaultRelays();

// <---------- REDUCER ---------->
type Action =
  | { type: "setLoading"; loading: boolean }
  | { type: "setAccount"; account: Account | null }
  | { type: "setProfiles"; profiles: Record<string, Profile> | null };

type Dispatch = (action: Action) => void;

type State = {
  loading: boolean;
  account: Account | null;
  profiles: Record<string, Profile> | null;
};

type AccountProviderProps = { children: ReactNode };

const AccountContext = createContext<
  | {
      state: State;
      currentProfile: Profile;
      dispatch: Dispatch;
      setCurrentProfile: (profile: Profile) => void;
      saveProfile: (profile: Profile) => Promise<{
        success: boolean;
        profile?: Profile;
        error?: string;
      }>;
      signOut: (redirect?: boolean) => {};
      getRelays: () => string[];
      reloadProfiles: (currentPubkey?: string) => void;
      updateProfileFromRelays: (
        profile: Profile
      ) => Promise<{ updated: boolean; profile: Profile }>;
    }
  | undefined
>(undefined);

function reducer(state: State, action: Action) {
  debug(`reducer: ${JSON.stringify(action)}`);
  switch (action.type) {
    case "setLoading": {
      return { ...state, loading: action.loading };
    }
    case "setAccount": {
      return { ...state, account: action.account };
    }
    case "setProfiles": {
      return { ...state, profiles: action.profiles };
    }
  }
}

export const AccountProvider = (props: AccountProviderProps) => {
  const contextDebug = debug("aka:accountContext");
  const router = useRouter();
  const pathname = usePathname();
  const nostrContext = useNostrContext();

  const [state, dispatch] = useReducer(reducer, {
    loading: true,
    account: null,
    profiles: null,
  });

  const [currentProfile, setCurrentProfileInternal] = useState(
    getEmptyProfile()
  );

  const loadProfilesInternal = async (uid: string) => {
    let profiles: Record<string, Profile> = {};
    const loaded = await loadProfiles(uid).catch((error) => {
      contextDebug(`error loadProfiles(${uid})`);
    });

    if (!loaded || Object.keys(loaded).length == 0) {
      contextDebug(`no profile found for (${uid})`);
      return profiles;
    } else {
      profiles = loaded;
    }

    dispatch({ type: "setProfiles", profiles: profiles });
    return profiles;
  };

  const setCurrentProfile = async (profile: Profile) => {
    loadProfilesInternal(profile.uid);
    setCurrentProfileInternal(profile);
  };

  const saveProfile = async (
    profile: Profile
  ): Promise<{ success: boolean; profile?: Profile; error?: string }> => {
    // save profile to database
    const saveResult = await fsSaveProfile(profile);
    if (saveResult.success) {
      const savedProfile = (
        saveResult as { success: boolean; profile: Profile }
      ).profile;
      setCurrentProfile(profile);
    }

    return saveResult;
  };

  const signOut = async (redirect = true) => {
    dispatch({ type: "setAccount", account: null });
    initProfilesFromAccount(null);
    await auth.signOut();
    contextDebug("signed out");
    if (redirect) router.push("/");
  };

  const getRelays = () => {
    let relays: string[] = [];
    const account = state.account;
    if (account) {
      if (account.defaultRelays) {
        relays = relays.concat(defaultRelays);
      }
      if (account.relays) {
        relays = relays.concat(account.relays);
      }
    }
    return relays;
  };

  const reloadProfiles = (currentPubkey?: string) => {
    initProfilesFromAccount(state.account, false, currentPubkey);
  };

  const updateProfileFromRelays = async (profile: Profile) => {
    const publickey = profile.publickey;
    contextDebug(`checking relays for profile ${publickey}`);
    const ndkProfile = await nostrContext.fetchProfile(publickey);
    contextDebug(`got profile ${ndkProfile?.name}`);
    if (ndkProfile) {
      const result = updateProfile(profile, ndkProfile);
      if (result.updated) {
        const updatedProfile = result.profile;
        // update currrent profile
        if (currentProfile.publickey == updatedProfile.publickey) {
          setCurrentProfile(updatedProfile);
        }

        // update item in list of profiles
        let numProfiles = 0;
        if (state.profiles) {
          const profiles = { ...state.profiles };
          // update context
          numProfiles = Object.keys(profiles).length;
          for (let i = 0; i < numProfiles; i++) {
            const key = Object.keys(profiles)[i];
            const profile = profiles[key];
            if (profile.publickey == updatedProfile.publickey) {
              profiles[key] = updatedProfile;
              break;
            }
          }
          dispatch({ type: "setProfiles", profiles: profiles });
        }
      }
      return result;
    } else {
      return { updated: false, profile: profile };
    }
  };

  const initProfilesFromAccount = async (
    account: Account | null,
    isNew: boolean = false,
    currentPubkey: string = ""
  ) => {
    contextDebug(
      `initProfilesFromAccount called with account: ${JSON.stringify(
        account
      )}, isNew: ${isNew}}`
    );
    contextDebug("loading profiles for " + account?.uid);

    if (account == null) {
      setCurrentProfile(getEmptyProfile());
      dispatch({ type: "setProfiles", profiles: {} });
      return null;
    }

    let profiles: Record<string, Profile> = {};
    if (account && account.uid) {
      profiles = await loadProfilesInternal(account.uid);
    }

    let current: Profile | undefined = undefined;
    const pubkeys = Object.keys(profiles);
    if (currentPubkey != "" && pubkeys.includes(currentPubkey)) {
      current = profiles[currentPubkey];
      setCurrentProfileInternal(current);
    } else {
      // set default profile
      if (Object.keys(profiles).length > 0) {
        const key = Object.keys(profiles)[0];
        current = profiles[key];
        contextDebug("settting profile " + JSON.stringify(current));
        setCurrentProfileInternal(current);
      }
    }

    // check for profile updates
    if (isNew && current) {
      const result = await updateProfileFromRelays(current);
      if (result && result.updated) {
        contextDebug("Updated profile based on Nostr events");
        setCurrentProfile(result.profile);
      }
    }
  };

  // called on onAuthStateChanged
  // could be first login without account, login of existing account, or logout
  const handleUserChange = async (user: User | null) => {
    // return to login page
    if (user == null) {
      const publicPath =
        pathname == "/" ||
        pathname.startsWith("/njump/") ||
        pathname.startsWith("/e/");
      if (!publicPath) router.push("/");
    }

    dispatch({ type: "setLoading", loading: false });

    // log out
    if (user == null) {
      return;
    }

    // anonymous user
    if (user?.isAnonymous) {
      return;
    }

    contextDebug("handleUserChange called for: " + user.uid);

    // attempt load account
    const functions = getFunctions();
    let account = await loadAccount(user.uid).catch((error) => {
      contextDebug("error loading account: " + JSON.stringify(error));
      return;
    });
    contextDebug(
      "handleUserChange loadAccount result: " + JSON.stringify(account)
    );
    let resultAccount: any = undefined;

    let isNew = false;
    if (!account || account.version < CURRENT_VERSION) {
      contextDebug("account not found, checking for publickey on token");
      const token = await user.getIdTokenResult();
      const publickey = token.claims["publickey"];

      const createAccount = httpsCallable(functions, "createAccount");
      let result: any = undefined;
      contextDebug(`publickey: ${publickey}`);
      if (publickey) {
        isNew = true;
        contextDebug(`calling createdAccount({publickey: ${publickey})`);
        resultAccount = await createAccount({ publickey: publickey });
      } else {
        contextDebug("calling createdAccount()");
        resultAccount = await createAccount();
      }
      account = resultAccount.data as Account;
      contextDebug("createAccount(...) result: " + JSON.stringify(account));
    }

    dispatch({ type: "setAccount", account: account });
    initProfilesFromAccount(account, isNew);

    // go to home page
    if (user != null && pathname == "/") {
      router.push("/profile");
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(handleUserChange);

    return () => unsubscribe(); // unsubscribe on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  const value = {
    state,
    dispatch,
    currentProfile,
    setCurrentProfile,
    saveProfile,
    signOut,
    getRelays,
    reloadProfiles,
    updateProfileFromRelays,
  };

  return (
    <AccountContext.Provider value={value}>
      {props.children}
    </AccountContext.Provider>
  );
};

// use Context methods
const useAccountContext = () => {
  const context = useContext(AccountContext);
  if (context === undefined) {
    throw new Error("useAccountContext must be used within a AccountProvider");
  }
  return context;
};

export { useAccountContext };

export default AccountProvider;
