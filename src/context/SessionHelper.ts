import { Session } from "@/data/sessionLib";

/*
 * Initial: session undefined
 * InProgress: not ready to award
 * ReadyToAward: all requirements met, but not yet awarded
 * Awarded: all badges / groups awarded
 */

export enum SessionState {
  Initial = "Initial",
  InProgress = "InProgress",
  ReadyToAward = "ReadyToAward",
  Awarded = "Awarded",
}

const awarded = (session: Session) => {
  return session.itemState.prevAward;
};

// returns true is all required badges are awarded.
const readyToAward = (session: Session) => {
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
    return SessionState.Initial;
  }

  // check for completeness in reverse order
  if (awarded(session)) return SessionState.Awarded;

  if (readyToAward(session)) {
    return SessionState.ReadyToAward;
  }

  return SessionState.InProgress;
};
