"use server";

import { NostrEvent } from "@/data/ndk-lite";
import { Badge } from "./badgeLib";
import { Event } from "./eventLib";
import { Session } from "./sessionLib";

export type CreateSessionParams = {
  type: "BADGE" | "GROUP" | "OFFER";
  docId: string;
  state?: string;
  pubkey?: string;
};

export type CreateSessionResult =
  | {
      sessionId: string;
      session: Session;
    }
  | undefined;

// returns docId as id, Event as event
export const getEvent = async (
  naddr: string
): Promise<{ id: string; event: Event }> => {
  const authorization = `Bearer ${process.env.AKA_API_TOKEN}`;

  const url = `https://getevent-k5ca2jsy4q-uc.a.run.app/aka-profiles/us-central1/getEvent?id=${naddr}`;
  const res = await fetch(url, {
    headers: { authorization },
    next: { tags: [naddr] },
    cache: "no-store",
  });

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data: " + naddr);
  }
  return res.json();
};

// returns docId as id, Event as event
export const getEventByAddress = async (
  address: string
): Promise<{ id: string; event: Event }> => {
  const authorization = `Bearer ${process.env.AKA_API_TOKEN}`;
  const url = `https://geteventbyaddresspointer-k5ca2jsy4q-uc.a.run.app/aka-profiles/us-central1/getEventByAddressPointer?addressPointer=${address}`;
  const res = await fetch(url, {
    headers: { authorization },
    next: { tags: [address] },
    cache: "no-store",
  });

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data " + address);
  }

  return res.json();
};

export async function getSession(id: string): Promise<Session> {
  const authorization = `Bearer ${process.env.AKA_API_TOKEN}`;

  const url = `https://getsession-k5ca2jsy4q-uc.a.run.app/aka-profiles/us-central1/getSession?id=${id}`;
  const res = await fetch(url, {
    headers: { authorization },
    cache: "no-store",
  });

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }
  return res.json();
}

export async function getBadge(id: string): Promise<Badge> {
  const authorization = `Bearer ${process.env.AKA_API_TOKEN}`;

  const url = `https://getbadge-k5ca2jsy4q-uc.a.run.app/aka-profiles/us-central1/getBadge?id=${id}`;
  const res = await fetch(url, {
    headers: { authorization },
    cache: "no-store",
  });

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }
  return res.json();
}

export async function getBadgeDefEvent(
  type: "BADGE" | "GROUP",
  badgeId: string
): Promise<Event> {
  const authorization = `Bearer ${process.env.AKA_API_TOKEN}`;

  const url = `https://getbadgedefevent-k5ca2jsy4q-uc.a.run.app/aka-profiles/us-central1/getbadgedefevent?type=${type}&badgeid=${badgeId}`;
  const res = await fetch(url, {
    headers: { authorization },
    cache: "no-store",
  });

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }
  return res.json();
}

// return header with AKA_API_KEY authorization
const getAkaApiPostHeader = () => {
  const authorization = `Bearer ${process.env.AKA_API_TOKEN}`;

  return {
    "Content-Type": "application/json",
    "Authorization": authorization,
  };
};

export async function createBadgeSession(
  badgeId: string,
  state: string,
  pubkey: string
): Promise<CreateSessionResult> {
  const postData = {
    badgeId: badgeId,
    state: state,
    pubkey: pubkey,
  };

  const url = `https://createbadgesession-k5ca2jsy4q-uc.a.run.app/aka-profiles/us-central1/createBadgeSession`;

  const response = await fetch(url, {
    method: "POST",
    headers: getAkaApiPostHeader(),
    body: JSON.stringify(postData),
    cache: "no-cache",
  });

  if (!response.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }
  return response.json();
}

export async function createGroupSession(
  groupId: string,
  state: string,
  pubkey: string
): Promise<CreateSessionResult> {
  const postData = {
    groupId: groupId,
    state: state,
    pubkey: pubkey,
  };

  const url = `https://creategroupsession-k5ca2jsy4q-uc.a.run.app/aka-profiles/us-central1/createGroupSession`;

  const response = await fetch(url, {
    method: "POST",
    headers: getAkaApiPostHeader(),
    body: JSON.stringify(postData),
    cache: "no-cache",
  });

  if (!response.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }
  return response.json();
}

export async function createSession(params: CreateSessionParams) {
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
}

export async function changeSessionPubkey(
  session: string,
  pubkey: string
): Promise<{ success: boolean; message: string }> {
  const postData = {
    session: session,
    pubkey: pubkey,
  };

  const url = `https://changesessionpubkey-k5ca2jsy4q-uc.a.run.app/aka-profiles/us-central1/changeSessionPubkey`;

  const response = await fetch(url, {
    method: "POST",
    headers: getAkaApiPostHeader(),
    body: JSON.stringify(postData),
    cache: "no-cache",
  });

  if (!response.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }
  return response.json();
}

export async function sessionCreateBadgeAwards(
  sessionId: string,
  awardedToUid: string,
  pubkey: string
) {
  const url = `https://sessioncreatebadgeawards-k5ca2jsy4q-uc.a.run.app/aka-profiles/us-central1/sessionCreateBadgeAwards`;

  const postData = {
    session: sessionId,
    awardedToUid: awardedToUid,
    publickey: pubkey,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: getAkaApiPostHeader(),
    body: JSON.stringify(postData),
    cache: "no-cache",
  });

  if (!response.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }

  return true;
}

export async function getRelays(
  uid: string
): Promise<{ relays: string[]; defaultRelays: boolean }> {
  const authorization = `Bearer ${process.env.AKA_API_TOKEN}`;

  const url = `https://getrelays-k5ca2jsy4q-uc.a.run.app/aka-profiles/us-central1/getRelays?uid=${uid}`;
  const res = await fetch(url, {
    headers: { authorization },
    cache: "no-store",
  });

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }
  return res.json();
}
