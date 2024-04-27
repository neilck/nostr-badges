/***
 * Handles state during user applicaton for group / badge
 * Id written to sessionStorage to persist over refreshes
 *
 * state.session corresponds to session record stored in database
 * (all other fields used by client UI)
 * database session is updated 3rd party badge apply pages, requiring reload when iframe dialog closed
 *
 */
"use client";

import debug from "debug";
import { useEffect, useContext, useReducer, createContext } from "react";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Session, ItemState } from "@/data/sessionLib";
import {
  getSession,
  createSession,
  changeSessionPubkey,
  CreateSessionParams,
  CreateSessionResult,
} from "@/data/serverActions";
import { Badge, loadBadge as fsLoadBadge } from "@/data/badgeLib";
import { loadGroup as fsLoadGroup } from "@/data/groupLib";
import { sessionCreateBadgeAwards } from "@/data/serverActions";
import { NostrEvent } from "@nostr-dev-kit/ndk";
import { Event, toNostrEvent, loadBadgeEvent } from "@/data/eventLib";

const contextDebug = debug("aka:sessionContext");
const getURL = process.env.NEXT_PUBLIC_AKA_GET;

export enum SessionState {
  Initial = "Initial",
  InProgress = "InProgress",
  ReadyToAward = "ReadyToAward",
  BadgeAwardsCreated = "BadgeAwardsCreated",
}

export type Display = {
  title: string;
  description: string;
  image: string;
};

// <---------- REDUCER ---------->
type Action =
  | { type: "setSessionId"; sessionId: string | null }
  | { type: "setSession"; session: Session | null }
  | { type: "setDisplay"; display: Display | null }
  | { type: "setBadges"; badges: Record<string, Badge> | null }
  | { type: "setSessionState"; sessionState: SessionState }
  | { type: "setIsUpdating"; isUpdating: boolean };

type Dispatch = (action: Action) => void;

type State = {
  sessionId: string | null;
  session: Session | null;
  sessionState: SessionState;
  display: Display | null;
  badges: Record<string, Badge> | null;
  isUpdating: boolean;
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
      resumeSession: () => Promise<boolean>;
      redirectToLogin: (naddr: string) => void;
      changePubkey: (pubkey: string) => Promise<boolean>;
      createBadgeAwards: (uid: string, publickey: string) => Promise<boolean>;
      getSignedEvents: () => Promise<NostrEvent[]>;
      loadBadge: (badgeId: string) => Promise<Badge | undefined>;
      reload: () => void;
      shouldAutoOpen: () => boolean;
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
    case "setIsUpdating": {
      return { ...state, isUpdating: action.isUpdating };
    }
  }
}

function SessionProvider(props: SessionProviderProps) {
  const { children } = props;

  const [state, dispatch] = useReducer(reducer, {
    sessionId: null,
    session: null,
    sessionState: SessionState.Initial,
    display: null,
    badges: null,
    isUpdating: false,
  });

  const router = useRouter();

  // setup listener for database change
  useEffect(() => {
    // Set up a listener for database changes
    if (state.sessionId != null && state.sessionId != "") {
      const db = getFirestore();
      const unsub = onSnapshot(doc(db, "sessions", state.sessionId), (doc) => {
        reload();
      });

      // Clean up listener when component unmounts
      return () => {
        unsub();
      };
    }
  }, [state.sessionId]);

  // returns true is all required badges are awarded.
  const readyToAward = (session: Session) => {
    if (!session) {
      return false;
    }

    if (!(session.itemState.isAwarded || session.itemState.prevAward)) {
      return false;
    }

    if (session.requiredBadges) {
      session.requiredBadges.forEach((badge) => {
        if (!(badge.itemState.isAwarded || badge.itemState.prevAward)) {
          return false;
        }
      });
    }

    if (session.requiredGroups) {
      session.requiredGroups.forEach((group) => {
        if (!(group.itemState.isAwarded || group.itemState.prevAward)) {
          return false;
        }
      });
    }

    return true;
  };

  // set SessionState based on loaded session
  const updateSessionState = (session: Session | undefined) => {
    if (!session) {
      dispatch({ type: "setSessionState", sessionState: SessionState.Initial });
      return;
    }

    let testItemState: ItemState | undefined = undefined;
    if (session.type == "BADGE" || session.type == "GROUP") {
      testItemState = session.itemState;
    } else {
      if (session.requiredGroups && session.requiredGroups.length > 0) {
        testItemState = session.requiredGroups[0].itemState;
      } else if (session.requiredBadges && session.requiredBadges.length > 0) {
        testItemState = session.requiredBadges[0].itemState;
      }
    }

    contextDebug(`updateSessionState testItemState: ${testItemState}`);

    if (!testItemState) {
      dispatch({ type: "setSessionState", sessionState: SessionState.Initial });
      return;
    }

    if (testItemState.event && testItemState.event != "") {
      dispatch({
        type: "setSessionState",
        sessionState: SessionState.BadgeAwardsCreated,
      });
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

    // else set in progress
    dispatch({
      type: "setSessionState",
      sessionState: SessionState.InProgress,
    });
    return;
  };

  const getSessionState = () => {
    return state.sessionState;
  };

  const startSession = async (params: CreateSessionParams) => {
    contextDebug(`startSession called ${JSON.stringify(params)}`);
    // createSession creates session in DB
    const result = await createSession(params);
    contextDebug(`createSession result ${JSON.stringify(result)}`);
    if (result) {
      // update context with new session
      dispatch({ type: "setSessionId", sessionId: result.sessionId });
      dispatch({ type: "setSession", session: result.session });
      updateFromSession(result.sessionId, result.session);

      // save session Id to sessionStorage
      sessionStorage.setItem("session", result.sessionId);
    }
    return result;
  };

  const resumeSession = async () => {
    const sessionId = sessionStorage.getItem("session");
    contextDebug(`resumeSession called, sessionId ${sessionId}`);

    if (sessionId) {
      const session = await getSession(sessionId);
      if (session) {
        dispatch({ type: "setSessionId", sessionId: sessionId });
        dispatch({ type: "setSession", session: session });
        updateFromSession(sessionId, session);
        return true;
      }
    }

    return false;
  };

  /***
   * update client session properies when loaded from database
   */
  const updateFromSession = async (sessionId: string, session: Session) => {
    dispatch({ type: "setIsUpdating", isUpdating: true });

    // load badge or group for display
    const display: Display = { title: "", description: "", image: "" };
    if (session.type == "BADGE") {
      const badge = await loadBadge(session.targetId);
      if (badge) {
        display.title = badge.name;
        display.description = badge.description;
        display.image = badge.thumbnail != "" ? badge.thumbnail : badge.image;
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

    updateSessionState(session);
    dispatch({ type: "setIsUpdating", isUpdating: false });
  };

  const redirectToLogin = (naddr: string) => {
    if (state.sessionId) {
      const searchParams = new URLSearchParams();
      searchParams.set("session", state.sessionId);
      const updatedURL = `${getURL}/e/${naddr}/accept?${searchParams.toString()}`;
      router.push(updatedURL);
    }
  };

  const changePubkey = async (pubkey: string) => {
    if (state.sessionId) {
      const result = await changeSessionPubkey(state.sessionId, pubkey);
      return reload();
    }
    return false;
  };

  const createBadgeAwards = async (uid: string, publickey: string) => {
    if (state.sessionId) {
      if (state.session) state.session.pubkey = publickey;
      await sessionCreateBadgeAwards(state.sessionId, uid, publickey);
      return reload();
    }
    return false;
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

  const getSignedEvents = async () => {
    const items: ItemState[] = [];
    const awardIds: string[] = [];

    const session = state.session;
    if (!session) return [];

    if (session.type == "BADGE" || session.type == "GROUP")
      items.push(session.itemState);

    if (session.requiredBadges)
      session.requiredBadges.forEach((badge) => {
        items.push(badge.itemState);
      });

    if (session.requiredGroups)
      session.requiredGroups.forEach((group) => {
        items.push(group.itemState);
      });

    for (let i = 0; i < items.length; i++) {
      const itemState = items[i];
      if (itemState.event && itemState.event != "")
        awardIds.push(itemState.event);
    }

    const events: NostrEvent[] = [];
    for (let i = 0; i < awardIds.length; i++) {
      const event = await loadBadgeEvent(awardIds[i]);
      if (event) events.push(toNostrEvent(event));
    }

    return events;
  };

  // reload sesison from db
  // call when isAwarded changed via server call
  const reload = async () => {
    const sessionId = state.sessionId;
    if (sessionId) {
      const session = await getSession(sessionId);
      if (session) {
        dispatch({ type: "setSessionId", sessionId: sessionId });
        dispatch({ type: "setSession", session: session });
        await updateFromSession(sessionId, session);
        return true;
      }
    }
    return false;
  };

  // When single badge
  const shouldAutoOpen = (): boolean => {
    if (state.session == null) return false;
    const session = state.session;
    // only auto open if single required badge, not awarded,  and nothing else to display
    const autoOpen =
      session.type == "BADGE" &&
      !session.itemState.isAwarded &&
      !session.itemState.prevAward;
    return autoOpen;
  };

  const contextValue = {
    state,
    dispatch,
    getSessionState: getSessionState,
    startSession: startSession,
    resumeSession: resumeSession,
    redirectToLogin: redirectToLogin,
    changePubkey: changePubkey,
    createBadgeAwards: createBadgeAwards,
    getSignedEvents: getSignedEvents,
    reload: reload,
    loadBadge: loadBadge,
    shouldAutoOpen: shouldAutoOpen,
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
