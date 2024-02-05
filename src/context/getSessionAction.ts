"use server";

import { Session } from "@/data/sessionLib";

export async function getSession(
  id: string,
  clientToken: string
): Promise<Session> {
  const authorization = `Bearer ${process.env.AKA_API_TOKEN}`;

  const url = `https://getsession-k5ca2jsy4q-uc.a.run.app/aka-profiles/us-central1/getSession?id=${id}&token=${clientToken}`;
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
