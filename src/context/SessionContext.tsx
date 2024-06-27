/***
 * Handles state during user applicaton for group / badge
 *
 * state.session corresponds to session record stored in database
 * (all other fields used by client UI)
 * database session is updated 3rd party badge apply pages, requiring reload
 *
 */
"use client";

import debug from "debug";
import { useContext, useReducer, createContext } from "react";
import { useRouter } from "next/navigation";
import { Session, ItemState } from "@/data/sessionLib";
import {
  SessionState,
  getSessionEventIds,
  getSessionState as getSessionStateHelper,
} from "./SessionHelper";
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
import {
  IsEventPublishedItem,
  PublishedItem,
  useNostrContext,
} from "@/context/NostrContext";
import { getRelays } from "@/data/serverActions";
import { getDefaultRelays } from "@/data/relays";
import { NostrEvent } from "@nostr-dev-kit/ndk";
import { toNostrEvent, loadBadgeEvent } from "@/data/eventLib";

const contextDebug = debug("aka:sessionContext");
const getURL = process.env.NEXT_PUBLIC_AKA_GET;

export type Display = {
  title: string;
  description: string;
  image: string;
};

// <---------- REDUCER ---------->
type Action =
  | { type: "setSessionId"; sessionId: string | null }
  | { type: "setSession"; session: Session | null }
  | { type: "setSessionState"; sessionState: SessionState }
  | { type: "setDisplay"; display: Display | null }
  | { type: "setBadges"; badges: Record<string, Badge> | null }
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
        naddr: string,
        params: CreateSessionParams
      ) => Promise<CreateSessionResult>;
      resumeSession: (naddr: string) => Promise<boolean>;
      changePubkey: (pubkey: string, pubkeySource: string) => Promise<boolean>;
      createBadgeAwardEvents: (uid: string, publickey: string) => Promise<void>;
      publishEvents: () => Promise<IsEventPublishedItem[]>;
      getSignedEvents: () => Promise<NostrEvent[]>;
      loadBadge: (badgeId: string) => Promise<Badge | undefined>;
      reload: () => Promise<Session | null>;
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
    case "setSessionState": {
      return { ...state, sessionState: action.sessionState };
    }
    case "setDisplay": {
      return { ...state, display: action.display };
    }
    case "setBadges": {
      return { ...state, badges: action.badges };
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
    sessionState: SessionState.start,
    display: null,
    badges: null,
    isUpdating: false,
  });

  const router = useRouter();
  const nostrContext = useNostrContext();

  const getSessionState = () => {
    return getSessionStateHelper(state.session);
  };

  const updateSessionState = (
    sessionState: SessionState,
    functionName: string
  ) => {
    contextDebug(
      `SessionState: ${state.sessionState} => ${sessionState} by ${functionName}`
    );
    dispatch({ type: "setSessionState", sessionState: sessionState });
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

    contextDebug("getSignedEvents");
    contextDebug(state.session);

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

    contextDebug(items);

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
        contextDebug(`state after reloaded ${getSessionState()}`);
        return session;
      }
    }
    return null;
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

  /***
   * update client session properies when loaded from database
   */
  const updateFromSession = async (sessionId: string, session: Session) => {
    if (state.display == null || state.display.title == "") {
      dispatch({ type: "setIsUpdating", isUpdating: true });
    }

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
    dispatch({ type: "setIsUpdating", isUpdating: false });
  };

  const startSession = async (naddr: string, params: CreateSessionParams) => {
    if (state.sessionState != SessionState.start) {
      throw Error("startSession called when not SessionState.start");
    }
    updateSessionState(SessionState.loading, "startSession");

    contextDebug(`startSession called ${JSON.stringify(params)}`);
    // createSession creates session in DB
    const result = await createSession(params);
    contextDebug(`createSession result ${JSON.stringify(result)}`);

    if (result) {
      const state = getSessionStateHelper(result.session);
      if (state != SessionState.loaded) {
        throw Error("startSession result not SessionState.loaded");
      }
      // update context with new session
      dispatch({ type: "setSessionId", sessionId: result.sessionId });
      dispatch({ type: "setSession", session: result.session });
      updateFromSession(result.sessionId, result.session);
      updateSessionState(SessionState.loaded, "startSession");
      return result;
    }
    return undefined;
  };

  const resumeSession = async (sessionId: string) => {
    if (state.sessionState != SessionState.start) {
      throw Error("resumeSession called when not SessionState.start");
    }
    updateSessionState(SessionState.loading, "resumeSession");

    contextDebug(`resumeSession called for sessionId ${sessionId}`);

    const session = await getSession(sessionId);
    if (session) {
      dispatch({ type: "setSessionId", sessionId: sessionId });
      dispatch({ type: "setSession", session: session });
      updateFromSession(sessionId, session);
      const newState = getSessionStateHelper(session);
      updateSessionState(newState, "resumeSession");

      return true;
    }

    return false;
  };

  const changePubkey = async (pubkey: string, pubkeySource: string) => {
    const validStates = [
      SessionState.loaded,
      SessionState.filled,
      SessionState.identified,
    ];
    if (!validStates.includes(state.sessionState)) {
      throw Error(
        `changePubkey called when session in invalid state ${state.sessionState}`
      );
    } else {
      updateSessionState(SessionState.identifying, "changePubkey");
    }

    if (state.sessionId) {
      contextDebug(`changePubkey ${pubkey} ${pubkeySource}`);
      const result = await changeSessionPubkey(
        state.sessionId,
        pubkey,
        pubkeySource
      );
      const session = await reload();
      const newState = getSessionStateHelper(session);
      const expectedStates = [
        SessionState.loaded,
        SessionState.filled,
        SessionState.identified,
        SessionState.awarded, // if previously awarded to pubkey
      ];
      if (!expectedStates.includes(newState)) {
        throw Error(
          `changePubkey result not in expected states. Expected: ${JSON.stringify(
            expectedStates
          )}, Current: ${newState}, session: ${JSON.stringify(session)}`
        );
      } else {
        updateSessionState(newState, "changePubkey");
      }
    }
    return false;
  };

  const createBadgeAwardEvents = async (uid: string, publickey: string) => {
    const validStates = [SessionState.identified];
    contextDebug(
      `createBadgeAwardEvents called ${JSON.stringify({ uid, publickey })}`
    );

    if (!validStates.includes(state.sessionState)) {
      throw Error(
        `createBadgeAwardEvents called when session in invalid state ${state.sessionState}`
      );
    } else {
      updateSessionState(SessionState.awarding, "createBadgeAwardEvents");
    }

    if (state.sessionId) {
      if (state.session) state.session.pubkey = publickey;
      await sessionCreateBadgeAwards(state.sessionId, uid, publickey);

      // reload to get signed events
      contextDebug("createBadgeAwards about to reload.");
      const session = await reload();
      const newState = getSessionStateHelper(session);
      const expectedStates = [SessionState.awarded];
      if (!expectedStates.includes(newState)) {
        throw Error(
          `createBadgeAwardEvents result not in expected states. Expected: ${JSON.stringify(
            expectedStates
          )}, Current: ${newState}, session: ${JSON.stringify(session)}`
        );
      } else {
        updateSessionState(newState, "createBadgeAwardEvents");
      }
    }
  };

  const verifyEventsPublished = async (session: Session, relays: string[]) => {
    const ids = await getSessionEventIds(session);
    const areEventsPublished = await nostrContext.areEventsPublished(
      ids,
      relays
    );

    return areEventsPublished;
  };

  // publishes badge award events
  // returns after attempted send to relays
  const publishEvents = async () => {
    const validStates = [SessionState.awarded];
    if (!validStates.includes(state.sessionState)) {
      throw Error(
        `publishEvents called when session in invalid state ${state.sessionState}`
      );
    } else {
      updateSessionState(SessionState.publishing, "publishEvents");
    }

    if (!state.session) {
      throw Error("publisheEvent called with null session");
    }

    let relays = [] as string[];

    // get relays associated with badge / group owner
    if (state.session?.itemState.owner) {
      const result = await getRelays(state.session?.itemState.owner);
      relays = result.relays;
      if (result.defaultRelays) {
        relays = relays.concat(getDefaultRelays());
      }
    }

    // commented out as events will never be found as they are new
    // plus, enabling user to re-apply and update created date a "feature"
    /*
    isEventPublishedItems = await verifyEventsPublished(state.session, relays);
    contextDebug(
      `verifyEventsPublished result ${JSON.stringify(isEventPublishedItems)}`
    );

    let allPublished = true;
    for (let item of isEventPublishedItems) {
      if (!item.published) {
        allPublished = false;
        break;
      }
    }
    if (allPublished) {
      updateSessionState(SessionState.published, "publishEvents");
      return isEventPublishedItems;
    }
    */

    const ids = getSessionEventIds(state.session);
    const isEventPublishedItems: IsEventPublishedItem[] = [];
    for (let id in ids) {
      isEventPublishedItems.push({ eventId: id, published: false });
    }

    // publish events
    const events = await getSignedEvents();
    contextDebug(`createBadgeAwards getting events ${events}`);

    // publish only unpublished events
    const promises: Promise<PublishedItem>[] = [];
    for (let event of events) {
      for (let item of isEventPublishedItems) {
        if (item.eventId == event.id && !item.published) {
          promises.push(nostrContext.publishAsync(event, relays));
          item.published = true;
        }
      }
    }

    // wait for all publish events to return
    const values = await Promise.all(promises);
    updateSessionState(SessionState.published, "publishEvents");
    return isEventPublishedItems;
  };

  const contextValue = {
    state,
    dispatch,
    getSessionState: getSessionState,
    startSession: startSession,
    resumeSession: resumeSession,
    changePubkey: changePubkey,
    createBadgeAwardEvents: createBadgeAwardEvents,
    publishEvents: publishEvents,
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
