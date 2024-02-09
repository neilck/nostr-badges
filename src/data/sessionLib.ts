import { FieldValue } from "firebase/firestore/lite";

// <---------- SESSION ---------->
export type SessionState = {
  awardtoken: string;
  isAwarded: boolean;
  awardData?: object;
};

export type SessionBadge = {
  badgeId: string;
  state: SessionState;
};

export type SessionGroup = {
  groupId: string;
  state: SessionState;
};

export type Session = {
  type: "BADGE" | "GROUP" | "OFFER";
  targetId: string;
  state: SessionState;
  stateToken: string;
  uid: string;
  clientToken: string;
  requiredGroups?: SessionGroup[];
  requiredBadges?: SessionBadge[];
  lastUpdated: FieldValue;
};
