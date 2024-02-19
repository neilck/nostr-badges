"use server";

import { NostrEvent } from "@/data/ndk-lite";
import { Badge } from "./badgeLib";
import { Event } from "./eventLib";
import { Session } from "./sessionLib";

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

export async function sessionCreateBadgeAwards(
  sessionId: string,
  pubkey: string
) {
  const authorization = `Bearer ${process.env.AKA_API_TOKEN}`;

  const url = `https://getsessionbadgeawards-k5ca2jsy4q-uc.a.run.app/aka-profiles/us-central1/getSessionBadgeAwards?session=${sessionId}&publickey=${pubkey}`;

  const postData = {
    session: sessionId,
    publickey: pubkey,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { authorization },
    body: JSON.stringify(postData),
    cache: "no-cache",
  });

  if (!response.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }

  return true;
}
