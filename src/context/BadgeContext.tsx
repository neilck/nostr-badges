"use client";

import {
  useContext,
  useReducer,
  createContext,
  useCallback,
  useEffect,
} from "react";
import { useAccountContext } from "./AccountContext";
import {
  Badge,
  loadBadge as fsLoadBadge,
  saveBadge as fsSaveBadge,
} from "@/data/badgeLib";
import { BadgeConfig, loadBadgeConfig } from "@/data/badgeConfigLib";
import { createBadgeEvent, toNostrEvent } from "@/data/eventLib";
import { publishEvent } from "@/data/publishEvent";

// <---------- REDUCER ---------->
type Action =
  | { type: "setBadgeId"; badgeId: string | null }
  | { type: "setBadge"; badge: Badge | null }
  | { type: "setConfig"; config: BadgeConfig | null }
  | { type: "setUid"; uid: string | undefined };

type Dispatch = (action: Action) => void;
type State = {
  uid: string | undefined;
  badgeId: string | null;
  badge: Badge | null;
  config: BadgeConfig | null;
};

type BadgeProviderProps = {
  children: React.ReactNode;
};

const BadgeContext = createContext<
  | {
      state: State;
      dispatch: Dispatch;
      loadBadge: (badgeId: string, reload?: boolean) => Promise<Badge | null>;
      saveBadge: (
        badgeId: string,
        badge: Badge
      ) => Promise<{
        success: boolean;
        badge?: Badge;
        error?: string;
      }>;
      loadConfig: (uid: string, badgeId: string) => Promise<BadgeConfig | null>;
      getBadge: () => Badge | null;
      setBadge: (badgeId: string, badge: Badge) => void;
      setConfig: (badgeId: string, config: BadgeConfig) => void;
    }
  | undefined
>(undefined);

function reducer(state: State, action: Action) {
  switch (action.type) {
    case "setUid": {
      return { ...state, uid: action.uid };
    }
    case "setBadgeId": {
      return { ...state, badgeId: action.badgeId };
    }
    case "setBadge": {
      return { ...state, badge: action.badge };
    }
    case "setConfig": {
      return { ...state, config: action.config };
    }
  }
}

function BadgeProvider(props: BadgeProviderProps) {
  const { children } = props;
  const accountContext = useAccountContext();

  const [state, dispatch] = useReducer(reducer, {
    uid: undefined,
    badgeId: null,
    badge: null,
    config: null,
  });

  // update uid once account is availabile
  useEffect(() => {
    dispatch({ type: "setUid", uid: accountContext.state.account?.uid });
  }, [accountContext.state.account]);

  // load config when badgeId and uid are available
  useEffect(() => {
    if (state.badgeId && state.uid) {
      loadConfig(state.uid, state.badgeId);
    }
  }, [state.badgeId, state.uid]);

  const loadBadge = async (badgeId: string, reload?: boolean) => {
    if (state.badgeId == badgeId && !reload) {
      return state.badge;
    }

    const badge = await fsLoadBadge(badgeId);
    if (badge) {
      dispatch({ type: "setBadgeId", badgeId: badgeId });
      dispatch({ type: "setBadge", badge: badge });
      return badge;
    } else {
      dispatch({ type: "setBadgeId", badgeId: null });
      dispatch({ type: "setBadge", badge: null });
      return null;
    }
  };

  const saveBadge = async (
    badgeId: string,
    badge: Badge
  ): Promise<{ success: boolean; badge?: Badge; error?: string }> => {
    // save badge to database
    const saveResult = await fsSaveBadge(badgeId, badge, "badges");
    if (saveResult.success) {
      const savedBadge = (saveResult as { success: boolean; badge: Badge })
        .badge;
      setBadge(badgeId, savedBadge);

      // call server-side event creation with callback
      const createEvent = async (badgeId: string, badge: Badge) => {
        const event = await createBadgeEvent(badgeId);
        if (event) {
          const nostrEvent = toNostrEvent(event);
          const account = accountContext.state.account;
          if (account) {
            const relays = accountContext.getRelays();
            // publish event
            publishEvent(nostrEvent, relays);
          }
        }
      };

      // async call with callback to return event for publishing
      await createEvent(badgeId, savedBadge);
    }

    return saveResult;
  };

  // load session from DB
  const loadConfig = async (uid: string, badgeId: string) => {
    const config = await loadBadgeConfig(uid, badgeId);
    if (config) {
      dispatch({ type: "setConfig", config: config });
      return config;
    } else {
      dispatch({ type: "setConfig", config: null });
      return null;
    }
  };

  const getBadge = useCallback(() => {
    return state.badge;
  }, [state]);

  const setBadge = (badgeId: string, badge: Badge) => {
    if (badgeId == state.badgeId) {
      dispatch({ type: "setBadge", badge: badge });
    }
  };

  const setConfig = (badgeId: string, config: BadgeConfig) => {
    if (badgeId == state.badgeId) {
      dispatch({ type: "setConfig", config: config });
    }
  };

  const contextValue = {
    state,
    dispatch,
    loadBadge: loadBadge,
    saveBadge: saveBadge,
    loadConfig: loadConfig,
    getBadge: getBadge,
    setBadge: setBadge,
    setConfig: setConfig,
  };

  return (
    <BadgeContext.Provider value={contextValue}>
      {children}
    </BadgeContext.Provider>
  );
}

// use Context methods
const useBadgeContext = () => {
  const context = useContext(BadgeContext);
  if (context === undefined) {
    throw new Error("useBadgeContext must be used within a BadgeProvider");
  }
  return context;
};

export { useBadgeContext };
export default BadgeProvider;
