import { NostrEvent as Event } from "@nostr-dev-kit/ndk";

export const parseEventTags = (e: Event) => {
  const record: Record<string, string[]> = {};
  e.tags.forEach((tag) => {
    if (tag.length > 1) {
      record[tag[0]] = [] as string[];
      for (let i = 1; i < tag.length; i++) {
        record[tag[0]].push(tag[i]);
      }
    }
  });

  return record;
};

// returns { id: string; event: object; applyURL?: string }
export async function getBadgeByAddressPointer(addressPointer: string) {
  const authorization = `Bearer ${process.env.AKA_API_TOKEN}`;
  const url = `https://geteventbyaddresspointer-k5ca2jsy4q-uc.a.run.app/aka-profiles/us-central1/getEventByAddressPointer?addressPointer=${addressPointer}`;
  const res = await fetch(url, {
    headers: { authorization },
    next: { tags: [addressPointer] },
    cache: "no-store",
  });

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    throw new Error("Failed to fetch data");
  }

  return res.json();
}
