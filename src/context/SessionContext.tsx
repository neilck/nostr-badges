"use client";

import debug from "debug";
import { useContext, useReducer, createContext } from "react";
import { useRouter } from "next/navigation";
import {
  Session,
  createSession,
  CreateSessionParams,
  CreateSessionResult,
} from "@/data/sessionLib";
import { getSession } from "@/data/serverActions";
import { Badge, loadBadge as fsLoadBadge } from "@/data/badgeLib";
import { loadGroup as fsLoadGroup } from "@/data/groupLib";

const contextDebug = debug("aka:sessionContext");

export enum SessionState {
  Initial = "Initial",
  InProgress = "InProgress",
  DialogOpen = "DialogOpen",
  ReadyToAward = "ReadyToAward",
}

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
  | { type: "setNAddr"; naddr: string | null }
  | { type: "setClientToken"; clientToken: string | null }
  | { type: "setCurrentId"; currentId: string | null }
  | { type: "setCurrent"; current: Current | null }
  | { type: "setDisplay"; display: Display | null }
  | { type: "setBadges"; badges: Record<string, Badge> | null }
  | { type: "setSessionState"; sessionState: SessionState };

type Dispatch = (action: Action) => void;

type State = {
  sessionId: string | null;
  naddr: string | null;
  session: Session | null;
  sessionState: SessionState;
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
      getSessionState: () => SessionState;
      startSession: (
        params: CreateSessionParams
      ) => Promise<CreateSessionResult>;
      loadSession: (sessionId: string, clientToken: string) => void;
      setCurrentBadge: (badgeId: string) => void;
      redirectToLogin: () => void;
      loadBadge: (badgeId: string) => Promise<Badge | undefined>;
      reload: () => void;
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
    case "setNAddr": {
      return { ...state, naddr: action.naddr };
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
    case "setSessionState": {
      contextDebug(
        `SessionState change ${state.sessionState} => ${action.sessionState}`
      );
      return { ...state, sessionState: action.sessionState };
    }
  }
}

function SessionProvider(props: SessionProviderProps) {
  const { children } = props;

  const [state, dispatch] = useReducer(reducer, {
    sessionId: null,
    session: null,
    naddr: null,
    sessionState: SessionState.Initial,
    clientToken: null,
    currentId: null,
    current: null,
    display: null,
    badges: null,
  });

  const router = useRouter();

  // returns true is all required badges are awarded.
  const readyToAward = (session: Session) => {
    if (!session) {
      return false;
    }

    if (!session.itemState.isAwarded) {
      return false;
    }

    if (session.requiredBadges) {
      session.requiredBadges.forEach((badge) => {
        if (!badge.itemState.isAwarded) {
          return false;
        }
      });
    }

    if (session.requiredGroups) {
      session.requiredGroups.forEach((group) => {
        if (!group.itemState.isAwarded) {
          return false;
        }
      });
    }

    return true;
  };

  // set SessionState based on loaded session
  const updateSessionState = (
    session: Session | undefined,
    currentId: string | null
  ) => {
    if (!session) {
      dispatch({ type: "setSessionState", sessionState: SessionState.Initial });
      return;
    }

    // if ready for award
    if (readyToAward(session)) {
      dispatch({
        type: "setSessionState",
        sessionState: SessionState.ReadyToAward,
      });
      return;
    }

    // if in progress
    if (currentId && currentId != "") {
      dispatch({
        type: "setSessionState",
        sessionState: SessionState.DialogOpen,
      });
      return;
    } else {
      dispatch({
        type: "setSessionState",
        sessionState: SessionState.InProgress,
      });
      return;
    }
  };

  const getSessionState = () => {
    return state.sessionState;
  };

  const startSession = async (params: CreateSessionParams) => {
    contextDebug(`startSession called ${JSON.stringify(params)}`);
    dispatch({ type: "setNAddr", naddr: params.naddr });
    const result = await createSession(params);
    if (result)
      loadSession(result.sessionId, result.session.clientToken, result.session);
    return result;
  };

  const loadSession = async (
    sessionId: string,
    clientToken: string,
    session?: Session
  ) => {
    contextDebug(
      `loadSession called sessionId: ${sessionId} clientToken: ${clientToken}`
    );

    if (sessionId && clientToken) {
      if (!session) {
        session = await getSession(sessionId, clientToken);
      }

      contextDebug(
        `loadingSession: ${sessionId} => ${JSON.stringify(session)}`
      );
      if (session) {
        dispatch({ type: "setSessionId", sessionId: sessionId });
        dispatch({ type: "setClientToken", clientToken: clientToken });
        dispatch({ type: "setSession", session: session });

        const currentId = getAutoOpenBadge(session);
        if (currentId) {
          await setCurrentBadge(currentId);
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

        updateSessionState(session, currentId);

        return session;
      }
    }

    contextDebug(`loadingSession(${sessionId} => no action`);
    return undefined;
  };

  const setCurrentBadge = async (badgeId: string) => {
    if (!state.session) {
      return;
    }

    dispatch({ type: "setCurrentId", currentId: badgeId });

    // update current
    if (badgeId == null || badgeId == "") {
      dispatch({ type: "setCurrent", current: null });
      dispatch({
        type: "setSessionState",
        sessionState: SessionState.InProgress,
      });
    } else {
      const badge = await loadBadge(badgeId);
      let awardtoken = "";

      // single badge
      if (state.session.type == "BADGE" && state.session.targetId == badgeId) {
        awardtoken = state.session.itemState.awardtoken;
      } else {
        // from required badges
        if (state.session.requiredBadges) {
          for (let i = 0; i < state.session.requiredBadges.length; i++) {
            if (state.session.requiredBadges[i].badgeId == badgeId) {
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
        dispatch({
          type: "setSessionState",
          sessionState: SessionState.DialogOpen,
        });
      }
    }
  };

  const redirectToLogin = () => {
    // save sessionId and clientToken to sessionStorage before redirect
    if (!state.sessionId) return;

    sessionStorage.setItem(
      "pendingAward",
      JSON.stringify({
        sessionId: state.sessionId,
        clientToken: state.clientToken,
      })
    );

    const searchParams = new URLSearchParams();
    searchParams.set("session", state.sessionId);
    const updatedURL = `/e/${state.naddr}/login?${searchParams.toString()}`;
    router.push(updatedURL);
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
  // call when isAwarded changed via server call
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

  const contextValue = {
    state,
    dispatch,
    getSessionState: getSessionState,
    startSession: startSession,
    loadSession: loadSession,
    setCurrentBadge: setCurrentBadge,
    redirectToLogin: redirectToLogin,
    reload: reload,
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
