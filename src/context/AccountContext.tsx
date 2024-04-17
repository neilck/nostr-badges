"use client";

import debug from "debug";
import {
  useEffect,
  useContext,
  useReducer,
  createContext,
  ReactNode,
} from "react";
import { User } from "firebase/auth";
import { auth } from "../firebase-config";
import { Account, CURRENT_VERSION, loadAccount } from "@/data/accountLib";
import { Profile, loadProfiles, updateProfile } from "@/data/profileLib";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useRouter, usePathname } from "next/navigation";

import { useNostrContext } from "./NostrContext";
import { getDefaultRelays } from "@/data/relays";

const defaultRelays = getDefaultRelays();

// <---------- REDUCER ---------->
type Action =
  | { type: "setLoading"; loading: boolean }
  | { type: "setAccount"; account: Account | null }
  | { type: "setCurrentProfile"; currentProfile: Profile | null };

type Dispatch = (action: Action) => void;

type State = {
  loading: boolean;
  account: Account | null;
  profiles: Profile[];
  currentProfile: Profile | null;
};

type AccountProviderProps = { children: ReactNode };

const AccountContext = createContext<
  | {
      state: State;
      dispatch: Dispatch;
      signOut: (redirect?: boolean) => {};
      getRelays: () => string[];
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
    case "setCurrentProfile": {
      return { ...state, currentProfile: action.currentProfile };
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
    profiles: [],
    currentProfile: null,
  });

  const signOut = async (redirect = true) => {
    dispatch({ type: "setAccount", account: null });
    setCurrentProfileFromAccount(null);
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

  const setCurrentProfileFromAccount = async (account: Account | null) => {
    contextDebug("loading current profile for " + account?.uid);
    let current = null;
    if (account == null) {
      dispatch({ type: "setCurrentProfile", currentProfile: null });
      return null;
    }

    const profiles = await loadProfiles(account?.uid).catch((error) => {
      contextDebug(`error loadProfiles(${account?.uid})`);
    });

    if (!profiles || Object.keys(profiles).length == 0) {
      contextDebug(`no profile found for (${account?.uid})`);
      return null;
    }

    const key = Object.keys(profiles)[0];
    current = profiles[key];

    // check for profile updates
    contextDebug(`checking relays for profile ${current.publickey}`);
    const profile = await nostrContext.fetchProfile(current.publickey);
    contextDebug(`got profile ${profile}`);
    if (profile) {
      const result = updateProfile(current, profile);
      if (result.updated) {
        contextDebug("Updated profile based on Nostr events");
        current = result.profile;
      }
    }

    contextDebug("settting profile " + JSON.stringify(current));
    dispatch({ type: "setCurrentProfile", currentProfile: current });
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
    let resultAccount: unknown = undefined;

    if (!account || account.version < CURRENT_VERSION) {
      contextDebug("account not found, checking for publickey on token");
      const token = await user.getIdTokenResult();
      const publickey = token.claims["publickey"];

      const createAccount = httpsCallable(functions, "createAccount");
      let result: any = undefined;
      contextDebug(`publickey: ${publickey}`);
      if (publickey) {
        contextDebug(`calling createdAccount({publickey: ${publickey})`);
        resultAccount = await createAccount({ publickey: publickey });
      } else {
        contextDebug("calling createdAccount()");
        resultAccount = await createAccount();
      }
      account = resultAccount as Account;
      contextDebug("createAccount(...) result: " + JSON.stringify(account));
    }

    dispatch({ type: "setAccount", account: account });

    contextDebug(`setCurrentProfileFromAccount ${JSON.stringify(account)}`);
    setCurrentProfileFromAccount(account);
    contextDebug("/user on onAuthStateChanged user not null");

    // go to home page
    if (user != null && pathname == "/") {
      router.push("/creator");
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(handleUserChange);

    return () => unsubscribe(); // unsubscribe on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

  const value = { state, dispatch, signOut, getRelays };

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
