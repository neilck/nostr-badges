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
      selectCurrentProfile: (pubkey: string) => Profile | undefined;
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

  useEffect(() => {
    nostrContext.init(currentProfile);
  }, [currentProfile]);

  /********** internal functions **********/

  const addProfileInternal = (profile: Profile) => {
    let updatedProfiles: Record<string, Profile> = {};
    if (state.profiles) {
      updatedProfiles = { ...state.profiles };
    }

    updatedProfiles[profile.publickey] = profile;
    dispatch({ type: "setProfiles", profiles: updatedProfiles });
  };

  // load profiles from db and update state
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

  // called to load from db, usually after server-side
  // isNew triggers update from relays
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

    if (currentPubkey == "") {
      // if no pubkey sepecified, try load from session
      const sessionPubkey = localStorage.getItem("currentPubkey");
      if (sessionPubkey) {
        currentPubkey = sessionPubkey;
      }
    }

    // dicard pubkey if not in profiles
    const pubkeys = Object.keys(profiles);
    if (!pubkeys.includes(currentPubkey)) {
      currentPubkey = "";
    }

    // fallback to first profile
    if (currentPubkey == "" && Object.keys(profiles).length > 0) {
      currentPubkey = Object.keys(profiles)[0];
    }

    // remember pubkey
    if (currentPubkey != "") {
      localStorage.setItem("currentPubkey", currentPubkey);
      const currentProfile = profiles[currentPubkey];
      setCurrentProfileInternal(currentProfile);

      // check for profile updates
      if (isNew) {
        const result = await updateProfileFromRelays(currentProfile);
        if (result && result.updated) {
          fsSaveProfile(result.profile);
          setCurrentProfile(result.profile);
        }
      }
    }
  };

  /********** context functions **********/
  const selectCurrentProfile = (pubkey: string) => {
    const profiles = state.profiles;
    if (profiles && profiles.hasOwnProperty(pubkey)) {
      localStorage.setItem("currentPubkey", pubkey);
      setCurrentProfileInternal(profiles[pubkey]);
      return profiles[pubkey];
    }

    return undefined;
  };

  const setCurrentProfile = async (profile: Profile) => {
    localStorage.setItem("currentPubkey", profile.publickey);
    addProfileInternal(profile);
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

  // returns profile updated from relays
  const updateProfileFromRelays = async (profile: Profile) => {
    const publickey = profile.publickey;
    contextDebug(`checking relays for profile ${publickey}`);
    const ndkProfile = await nostrContext.fetchProfile(publickey);
    contextDebug(`got profile ${ndkProfile?.name}`);

    if (ndkProfile) {
      return updateProfile(profile, ndkProfile);
    } else {
      return { updated: false, profile: profile };
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
    selectCurrentProfile,
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
