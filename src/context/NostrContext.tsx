"use client";

import debug from "debug";
import { createContext, useContext } from "react";
import NDK, {
  NDKUserProfile,
  NDKEvent,
  NostrEvent,
  NDKRelaySet,
  NDKRelay,
  NDKPrivateKeySigner,
} from "@nostr-dev-kit/ndk";
import { getDefaultRelays } from "@/data/relays";

const defaultRelays = getDefaultRelays();

// global ndk instances
const _signer = NDKPrivateKeySigner.generate();
const _ndk = new NDK({
  autoConnectUserRelays: false,
  enableOutboxModel: false,
  explicitRelayUrls: defaultRelays,
});

_ndk.connect(5000);
export const _publishNdk = new NDK({
  autoConnectUserRelays: false,
  enableOutboxModel: false,
  signer: _signer,
});

type NostrProviderProps = { children: React.ReactNode };

const NostrContext = createContext<
  | {
      fetchProfile: (pubkey: string) => Promise<NDKUserProfile | null>;
      publish: (
        event: NostrEvent,
        relays: string[]
      ) => Promise<Set<NDKRelay> | undefined>;
    }
  | undefined
>(undefined);

function NostrProvider({ children }: NostrProviderProps) {
  const contextDebug = debug("aka:nostrContext");

  const fetchProfile = async (pubkey: string) => {
    contextDebug(`fetch profile called for ${pubkey}`);
    contextDebug(`_ndk connect status ${JSON.stringify(_ndk.pool.stats())}`);
    const user = _ndk.getUser({ pubkey: pubkey });
    const profile = await user.fetchProfile();
    contextDebug(`profile found: ${JSON.stringify(profile)}`);
    return profile;
  };

  const publish = async (event: NostrEvent, relays: string[]) => {
    contextDebug(
      `publish event called: ${JSON.stringify(event)} ${JSON.stringify(relays)}`
    );
    const relaySet = NDKRelaySet.fromRelayUrls(relays, _publishNdk);

    const ndkEvent = new NDKEvent(_publishNdk, event);
    const result = await relaySet.publish(ndkEvent, 10000);
    contextDebug(`publish sent to ${result.size} relays`);
    return result;
  };

  const value = { fetchProfile, publish };
  return (
    <NostrContext.Provider value={value}>{children}</NostrContext.Provider>
  );
}

// use Context methods
const useNostrContext = () => {
  const context = useContext(NostrContext);
  if (context === undefined) {
    throw new Error("useNostrContext must be used within a NostrProvider");
  }
  return context;
};

export { useNostrContext };
export default NostrProvider;
