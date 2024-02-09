"use client";

import debug from "debug";
import {
  useContext,
  useReducer,
  createContext,
  useRef,
  useState,
  useEffect,
} from "react";
import { Session } from "@/data/sessionLib";
import { getSession } from "@/data/serverActions";
import { Badge, loadBadge as fsLoadBadge } from "@/data/badgeLib";
import { loadGroup as fsLoadGroup } from "@/data/groupLib";

const contextDebug = debug("aka:sessionContext");

export type Display = {
  title: string;
  description: string;
  image: string;
};

export type Current = {
  identifier: string;
  title: string;
  description: string;
  image: string;
  applyURL: string;
  sessionId: string;
  awardtoken: string;
};

// <---------- REDUCER ---------->
type Action =
  | { type: "setSessionId"; sessionId: string | null }
  | { type: "setSession"; session: Session | null }
  | { type: "setClientToken"; clientToken: string | null }
  | { type: "setCurrentId"; currentId: string | null }
  | { type: "setCurrent"; current: Current | null }
  | { type: "setDisplay"; display: Display | null }
  | { type: "setBadges"; badges: Record<string, Badge> | null };

type Dispatch = (action: Action) => void;

type State = {
  sessionId: string | null;
  session: Session | null;
  clientToken: string | null;
  currentId: string | null;
  current: Current | null;
  display: Display | null;
  badges: Record<string, Badge> | null;
};

type SessionProviderProps = {
  children: React.ReactNode;
};

const SessionContext = createContext<
  | {
      state: State;
      dispatch: Dispatch;
      loadSession: (sessionId: string, clientToken: string) => void;
      loadBadge: (badgeId: string) => Promise<Badge | undefined>;
      reload: () => void;
      allBadgesAwarded: () => boolean;
    }
  | undefined
>(undefined);

function reducer(state: State, action: Action) {
  switch (action.type) {
    case "setSessionId": {
      return { ...state, sessionId: action.sessionId };
    }
    case "setSession": {
      return { ...state, session: action.session };
    }
    case "setClientToken": {
      return { ...state, clientToken: action.clientToken };
    }
    case "setCurrentId": {
      return { ...state, currentId: action.currentId };
    }
    case "setCurrent": {
      return { ...state, current: action.current };
    }
    case "setDisplay": {
      return { ...state, display: action.display };
    }
    case "setBadges": {
      return { ...state, badges: action.badges };
    }
  }
}

function SessionProvider(props: SessionProviderProps) {
  const { children } = props;

  const [state, dispatch] = useReducer(reducer, {
    sessionId: null,
    session: null,
    clientToken: null,
    currentId: null,
    current: null,
    display: null,
    badges: null,
  });

  useEffect(() => {
    const updateCurrent = async (id: string | null) => {
      if (id == null || id == "" || !state.session) {
        dispatch({ type: "setCurrent", current: null });
        return;
      }

      const badge = await loadBadge(id);
      let awardtoken = "";
      // single badge
      if (state.session.type == "BADGE" && state.session.targetId == id) {
        awardtoken = state.session.itemState.awardtoken;
      } else {
        // from required badges
        if (state.session.requiredBadges) {
          for (let i = 0; i < state.session.requiredBadges.length; i++) {
            if (state.session.requiredBadges[i].badgeId == id) {
              awardtoken = state.session.requiredBadges[i].itemState.awardtoken;
              break;
            }
          }
        }
      }

      if (badge) {
        const current: Current = {
          identifier: badge.identifier,
          title: badge.name,
          description: badge.description,
          image: badge.thumbnail != "" ? badge.thumbnail : badge.image,
          applyURL: badge.applyURL,
          sessionId: state.sessionId ? state.sessionId : "",
          awardtoken: awardtoken,
        };
        dispatch({ type: "setCurrent", current: current });
      }
    };

    updateCurrent(state.currentId);
  }, [state.currentId, state.session]);

  // load session from DB
  const hasLoaded = useRef(false);
  const loadSession = async (sessionId: string, clientToken: string) => {
    contextDebug(
      `loadSession called sessionId: ${sessionId} clientToken: ${clientToken}`
    );
    if (sessionId && clientToken) {
      const session = await getSession(sessionId, clientToken);

      contextDebug(
        `loadingSession: ${sessionId} => ${JSON.stringify(session)}`
      );
      if (session) {
        dispatch({ type: "setSessionId", sessionId: sessionId });
        dispatch({ type: "setClientToken", clientToken: clientToken });
        dispatch({ type: "setSession", session: session });

        const badgeId = getAutoOpenBadge(session);
        if (badgeId && !hasLoaded.current) {
          dispatch({ type: "setCurrentId", currentId: badgeId });
        }

        // load badge or group for display
        const display: Display = { title: "", description: "", image: "" };
        if (session.type == "BADGE") {
          const badge = await loadBadge(session.targetId);
          if (badge) {
            display.title = badge.name;
            display.description = badge.description;
            display.image =
              badge.thumbnail != "" ? badge.thumbnail : badge.image;
          }
        }
        if (session.type == "GROUP") {
          const group = await fsLoadGroup(session.targetId, "groups");
          if (group) {
            display.title = group.name;
            display.description = group.description;
            display.image = group.image;
          }
        }

        dispatch({ type: "setDisplay", display: display });
        hasLoaded.current = true;
        return session;
      }
    }

    contextDebug(`loadingSession(${sessionId} => no action`);
    return undefined;
  };

  const loadBadge = async (badgeId: string) => {
    if (!state.badges) {
      state.badges = {};
    }

    let badge = undefined;
    state.badges[badgeId];
    if (badge) return badge;

    badge = await fsLoadBadge(badgeId, "badges");
    if (badge) {
      state.badges[badgeId] = badge;
      return badge;
    }

    return undefined;
  };

  // reload sesison from db
  const reload = async () => {
    if (state.sessionId && state.clientToken) {
      return loadSession(state.sessionId, state.clientToken);
    }
  };

  // Checks for cases when dialog should automatically open
  const getAutoOpenBadge = (session: Session | null): string | null => {
    if (session == null) return null;

    // only auto open if single required badge, not awarded,  and nothing else to display
    if (session.type == "BADGE" && !session.itemState.isAwarded)
      return session.targetId;
    else return null;
  };

  // returns true is all required badges are awarded.
  const allBadgesAwarded = () => {
    console.log(
      `allBadgesAwarded ${JSON.stringify(state.session?.requiredBadges)}`
    );
    const session = state.session;
    if (!session) {
      return false;
    }
    let finished = true;

    if (session.type == "BADGE" && !session.itemState.isAwarded) {
      return false;
    }

    if (session.requiredBadges) {
      session.requiredBadges.forEach((badge) => {
        if (!badge.itemState.isAwarded) {
          finished = false;
        }
      });
    }
    return finished;
  };

  const contextValue = {
    state,
    dispatch,
    loadSession: loadSession,
    reload: reload,
    allBadgesAwarded: allBadgesAwarded,
    loadBadge: loadBadge,
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}

// use Context methods
const useSessionContext = () => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("usSessionContext must be used within a SessionProvider");
  }
  return context;
};

export { useSessionContext };
export default SessionProvider;
