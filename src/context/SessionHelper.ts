import { Session } from "@/data/sessionLib";
import * as nip19 from "@/nostr-tools/nip19";

/*
 * start: not loaded
 * loaded: loaded, still gathering criteria
 * filled: all criteria met, no pubkey
 * identified: all criteria met and pubkey selected
 * awarded: isAwarded changed to prevAwarded, events available
 * published: all event published to at least one relay
 */

export enum SessionState {
  start = "start",
  loading = "loading...",
  loaded = "loaded",
  filling = "filling...",
  filled = "filled",
  identifying = "identifying...",
  identified = "identified",
  awarding = "awarding...",
  awarded = "awarded",
  publishing = "publishing...",
  published = "published",
}

// returns all event Doc ids (note1...) if all required badges awarded and events creatd
// undefined otherwise
const getAllEventDocIds = (session: Session) => {
  const ids = [] as string[];
  const requiresMain = session.type == "BADGE" || session.type == "GROUP";

  let hasAll = true;
  if (requiresMain) {
    hasAll =
      session.itemState.isAwarded && session.itemState.event != undefined;
    if (session.itemState.event) {
      ids.push(session.itemState.event!);
    }
  }

  if (hasAll && session.requiredBadges) {
    for (let i = 0; i < session.requiredBadges.length; i++) {
      const badge = session.requiredBadges[i];
      if (badge.itemState.isAwarded && badge.itemState.event == undefined) {
        hasAll = false;
        break;
      }
      if (badge.itemState.event) {
        ids.push(badge.itemState.event);
      }
    }
  }

  if (hasAll && session.requiredGroups) {
    for (let i = 0; i < session.requiredGroups.length; i++) {
      const group = session.requiredGroups[i];
      if (group.itemState.isAwarded && group.itemState.event == undefined) {
        hasAll = false;
        break;
      }
      if (group.itemState.event) {
        ids.push(group.itemState.event);
      }
    }
  }

  if (hasAll) return ids;
  else return undefined;
};

export const getSessionEventIds = async (session: Session) => {
  const docIds = getAllEventDocIds(session);
  if (docIds == undefined) {
    throw Error("getSessionEventIds expects all awarded events to exist");
  }

  // convert (note1...) to event ids
  const ids = [] as string[];
  for (let i = 0; i < docIds.length; i++) {
    const decoded = nip19.decode(docIds[i]);
    if (decoded.type != "note") {
      throw Error(`${docIds[i]} not encoded as note`);
    }
    ids.push(decoded.data);
  }

  return ids;
};

const awarded = (session: Session) => {
  if (!session.itemState.prevAward) return;

  const eventIds = getAllEventDocIds(session);
  if (eventIds == undefined || eventIds.length == 0) {
    return false;
  }
  return true;
};

const pubkeyVerified = (session: Session) => {
  if (!filled(session)) return false;

  if (
    session.pubkey != "" &&
    (session.pubkeySource == "AKA" || session.pubkeySource == "EXTENSION")
  ) {
    return true;
  }
  return false;
};

// returns true is all required badges are awarded.
const filled = (session: Session) => {
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
export const getSessionState = (session: Session | null) => {
  if (!session) {
    return SessionState.start;
  }

  // TODO: return published if events found on all relays

  // check for completeness in reverse order

  // awarded
  if (awarded(session)) {
    return SessionState.awarded;
  }

  // awarded and pubkey specified
  if (pubkeyVerified(session)) return SessionState.identified;

  // criteria met, but not yet awarded
  if (filled(session)) return SessionState.filled;

  return SessionState.loaded;
};
