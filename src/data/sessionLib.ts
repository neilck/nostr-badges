import { FieldValue } from "firebase/firestore/lite";

// <---------- SESSION ---------->
export type ItemState = {
  awardtoken: string;
  isAwarded: boolean;
  awardData?: object;
};

export type SessionBadge = {
  badgeId: string;
  itemState: ItemState;
};

export type SessionGroup = {
  groupId: string;
  itemState: ItemState;
};

export type Session = {
  type: "BADGE" | "GROUP" | "OFFER";
  targetId: string;
  itemState: ItemState;
  state: string;
  pubkey: string;
  uid: string;
  clientToken: string;
  requiredGroups?: SessionGroup[];
  requiredBadges?: SessionBadge[];
  lastUpdated: FieldValue;
};
