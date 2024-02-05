"use client";

import debug from "debug";
import { useContext, useReducer, createContext, useRef } from "react";
import { Session, SessionBadge } from "@/data/sessionLib";
import { getSession } from "./getSessionAction";

const contextDebug = debug("aka:sessionContext");

// <---------- REDUCER ---------->
type Action =
  | { type: "setSessionId"; sessionId: string | null }
  | { type: "setSession"; session: Session | null }
  | { type: "setCurrentBadge"; badge: SessionBadge | null }
  | { type: "setClientToken"; clientToken: string | null };

type Dispatch = (action: Action) => void;
type State = {
  sessionId: string | null;
  session: Session | null;
  currentBadge: SessionBadge | null;
  clientToken: string | null;
};

type SessionProviderProps = {
  children: React.ReactNode;
};

const SessionContext = createContext<
  | {
      state: State;
      dispatch: Dispatch;
      updateCurrentBadgeById: (badgeId: string) => void;
      loadSession: (sessionId: string, clientToken: string) => void;
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
    case "setCurrentBadge": {
      return { ...state, currentBadge: action.badge };
    }
    case "setClientToken": {
      return { ...state, clientToken: action.clientToken };
    }
  }
}

function SessionProvider(props: SessionProviderProps) {
  const { children } = props;

  const [state, dispatch] = useReducer(reducer, {
    sessionId: null,
    session: null,
    currentBadge: null,
    clientToken: null,
  });

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

        const badge = getAutoOpenBadge(session);
        if (!hasLoaded.current) {
          dispatch({ type: "setCurrentBadge", badge: badge });
        }
        hasLoaded.current = true;
        return session;
      }
    }

    contextDebug(`loadingSession(${sessionId} => no action`);
    return undefined;
  };

  // reload sesison from db
  const reload = async () => {
    if (state.sessionId && state.clientToken) {
      return loadSession(state.sessionId, state.clientToken);
    }
  };

  // Checks for cases when dialog should automatically open
  const getAutoOpenBadge = (session: Session | null): SessionBadge | null => {
    if (session == null) return null;

    // only auto open if single required badge, not awarded,  and nothing else to display
    if (!session || session.group || session.badge) return null;
    if (!session.requiredBadges || session.requiredBadges.length != 1)
      return null;
    const firstBadge = session.requiredBadges[0];
    if (!firstBadge.isAwarded) {
      return firstBadge;
    }

    return null;
  };

  // returns true is all required badges are awarded.
  const allBadgesAwarded = () => {
    const session = state.session;
    if (!session) {
      return false;
    }
    let finished = true;

    if (session.requiredBadges) {
      session.requiredBadges.forEach((badge) => {
        if (!badge.isAwarded) {
          finished = false;
        }
      });
    }
    return finished;
  };

  // set to "" on dialog close
  const updateCurrentBadgeById = (badgeId: string) => {
    contextDebug(`about to call updateCurrentBadgeById(${badgeId})`);
    let currentBadge: SessionBadge | null = null;
    const session = state.session;

    if (session && session.requiredBadges && badgeId != "") {
      for (let i = 0; i < session.requiredBadges.length; i++) {
        if (session.requiredBadges[i].id == badgeId) {
          currentBadge = session.requiredBadges[i];
          break;
        }
      }
    }

    dispatch({ type: "setCurrentBadge", badge: currentBadge });
  };

  const contextValue = {
    state,
    dispatch,
    loadSession: loadSession,
    reload: reload,
    allBadgesAwarded: allBadgesAwarded,
    updateCurrentBadgeById: updateCurrentBadgeById,
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
