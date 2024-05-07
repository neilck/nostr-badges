"use client";

import debug from "debug";
import { createContext, useContext, useState } from "react";

import NDK, {
  NDKUserProfile,
  NDKEvent,
  NostrEvent,
  NDKRelaySet,
  NDKRelay,
  NDKPrivateKeySigner,
  NDKNip07Signer,
  NDKSigner,
} from "@nostr-dev-kit/ndk";
import { getProfileRelays } from "@/data/relays";
import { Profile } from "@/data/profileLib";
import { getPrivateKey } from "@/data/keyPairLib";

const profileRelays = getProfileRelays();

export const _ndk = new NDK({
  autoConnectUserRelays: false,
  enableOutboxModel: false,
  explicitRelayUrls: profileRelays,
});

_ndk.connect(5000);

type NostrProviderProps = { children: React.ReactNode };

const NostrContext = createContext<
  | {
      init: (profile: Profile) => Promise<void>;
      fetchProfile: (pubkey: string) => Promise<NDKUserProfile | undefined>;
      updateProfile: ({
        publickey,
        name,
        displayName,
        image,
        about,
      }: {
        publickey: string;
        name: string;
        displayName: string;
        image: string;
        about: string;
      }) => Promise<void>;
      publish: (
        event: NostrEvent,
        relays: string[]
      ) => Promise<Set<NDKRelay> | undefined>;
    }
  | undefined
>(undefined);

function NostrProvider({ children }: NostrProviderProps) {
  const contextDebug = debug("aka:nostrContext");

  const init = async (profile: Profile) => {
    if (profile.hasPrivateKey) {
      const privatekey = await getPrivateKey(profile.publickey);
      if (privatekey != "") {
        _ndk.signer = new NDKPrivateKeySigner(privatekey);
      }
    } else {
      _ndk.signer = new NDKNip07Signer();
    }

    console.log(`_ndk.activeUser: ${JSON.stringify(_ndk.activeUser)}`);
  };

  const fetchProfile = async (pubkey: string) => {
    const user = _ndk.getUser({ pubkey });
    const profile = await user.fetchProfile();
    console.log(
      `fetchProfile ${JSON.stringify(user)} ${JSON.stringify(profile)}`
    );
    console.log(`relays: ${JSON.stringify(_ndk.explicitRelayUrls)}`);
    return profile ? profile : undefined;
  };

  const updateProfile = async ({
    publickey,
    name,
    displayName,
    image,
    about,
  }: {
    publickey: string;
    name: string;
    displayName: string;
    image: string;
    about: string;
  }) => {
    const user = _ndk.getUser({ pubkey: publickey });
    const profile = await user.fetchProfile();

    if (profile == null) return;

    profile.name = name;
    profile.displayName = displayName;
    profile.image = image;
    profile.about = about;

    return user.publish();
  };

  const publish = async (event: NostrEvent, relays: string[]) => {
    contextDebug(
      `publish event called: ${JSON.stringify(event)} ${JSON.stringify(relays)}`
    );
    const relaySet = NDKRelaySet.fromRelayUrls(relays, _ndk);

    const ndkEvent = new NDKEvent(_ndk, event);
    const result = await relaySet.publish(ndkEvent, 10000);
    contextDebug(`publish sent to ${result.size} relays`);
    return result;
  };

  const value = { init, fetchProfile, updateProfile, publish };
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
