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
