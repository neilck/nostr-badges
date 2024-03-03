import { FieldValue } from "firebase/firestore/lite";

// <---------- SESSION ---------->
export type ItemState = {
  owner: string;
  awardtoken: string;
  isAwarded: boolean;
  prevAward: boolean;
  event?: string;
  awardData?: { [key: string]: string } | undefined;
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
  requiredGroups?: SessionGroup[];
  requiredBadges?: SessionBadge[];
  lastUpdated?: FieldValue;
  redirectUrl: string;
};

export const getEmptySession = (): Session => {
  return {
    type: "BADGE",
    targetId: "",
    itemState: {
      awardtoken: "",
      owner: "",
      isAwarded: false,
      prevAward: false,
      awardData: undefined,
    },
    state: "",
    pubkey: "",
    redirectUrl: "",
  };
};
