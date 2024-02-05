import NDK, { NDKEvent, NostrEvent } from "@nostr-dev-kit/ndk";
import debug from "debug";

const contextDebug = debug("aka:publish");

export const publishEvent = async (event: NostrEvent, relays: string[]) => {
  contextDebug(
    `publishEvent(event: ${JSON.stringify(event)}, relays: ${relays})`
  );

  const ndk = new NDK({ explicitRelayUrls: relays });
  await ndk.connect(5000);
  const nostrEvent: NostrEvent = {
    created_at: event.created_at,
    kind: event.kind,
    content: event.content,
    pubkey: event.pubkey,
    id: event.id,
    sig: event.sig,
    tags: event.tags,
  };

  const e = new NDKEvent(ndk, event);
  const result = await e.publish();

  return result;
};
