import { getFunctions, httpsCallable } from "firebase/functions";
import { FieldValue } from "firebase/firestore/lite";

// <---------- SESSION ---------->
export type ItemState = {
  awardtoken: string;
  isAwarded: boolean;
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
  uid: string;
  requiredGroups?: SessionGroup[];
  requiredBadges?: SessionBadge[];
  lastUpdated?: FieldValue;
};

export type CreateSessionParams = {
  type: "BADGE" | "GROUP" | "OFFER";
  docId: string;
  state?: string;
  pubkey?: string;
};

export const getEmptySession = (): Session => {
  return {
    type: "BADGE",
    targetId: "",
    itemState: { awardtoken: "", isAwarded: false, awardData: undefined },
    state: "",
    pubkey: "",
    uid: "",
  };
};

export type CreateSessionResult =
  | {
      sessionId: string;
      session: Session;
    }
  | undefined;

const createBadgeSession = async (
  badgeId: string,
  state: string,
  pubkey: string
): Promise<CreateSessionResult> => {
  const functions = getFunctions();
  const createBadgeSession = httpsCallable(functions, "createBadgeSession");
  const result = await createBadgeSession({
    badgeId: badgeId,
    state: state,
    pubkey: pubkey,
  });
  if (result) return result.data as CreateSessionResult;
  else return undefined;
};

const createGroupSession = async (
  groupId: string,
  state: string,
  pubkey: string
) => {
  const functions = getFunctions();
  const createGroupSession = httpsCallable(functions, "createGroupSession");
  const result = await createGroupSession({
    groupId: groupId,
    state: state,
    pubkey: pubkey,
  });
  if (result) return result.data as CreateSessionResult;
  else return undefined;
};

export const createSession = async (params: CreateSessionParams) => {
  const { type, docId, state, pubkey } = params;
  const safeState = state ? state : "";
  const safePubkey = pubkey ? pubkey : "";

  switch (type) {
    case "BADGE":
      return createBadgeSession(docId, safeState, safePubkey);
    case "GROUP":
      return createGroupSession(docId, safeState, safePubkey);
    default:
      return undefined;
  }
};
