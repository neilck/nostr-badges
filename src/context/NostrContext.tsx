"use client";

import debug from "debug";
import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
} from "react";

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

export type SignerType = "UNSET" | "LOADING" | "PRIVATE" | "NIP07";
export type PublishCallback = (
  publishedCount: number,
  relayCount: number,
  error?: string
) => void;

const contextDebug = debug("aka:nostrContext");
const profileRelays = getProfileRelays();

export const _ndk = new NDK({
  autoConnectUserRelays: false,
  enableOutboxModel: false,
  explicitRelayUrls: profileRelays,
});

const printConnectedRelays = (ndk: NDK) => {
  const connected = ndk.pool.connectedRelays();
  const urls = connected.map((ndkRelay) => ndkRelay.url);
  contextDebug(`ndk connected relays ${urls.join(", ")}`);
};

_ndk.connect(5000).then((result) => {
  printConnectedRelays(_ndk);
});

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
        relays: string[],
        callback?: PublishCallback
      ) => void;
      setPublishCallback: (
        callback:
          | ((
              publishedCount: number,
              relayCount: number,
              error?: string
            ) => void)
          | null
      ) => void;
    }
  | undefined
>(undefined);

function NostrProvider({ children }: NostrProviderProps) {
  const callbackRef = useRef<
    | ((publishedCount: number, relayCount: number, error?: string) => void)
    | null
  >(null);

  const setPublishCallback = useCallback(
    (
      callback:
        | ((publishedCount: number, relayCount: number, error?: string) => void)
        | null
    ) => {
      callbackRef.current = callback;
    },
    []
  );

  const [signerType, setSignerType] = useState<SignerType>("UNSET");

  const init = async (profile: Profile) => {
    console.log(`init ${JSON.stringify(profile)}`);
    setSignerType("LOADING");
    if (profile.publickey == "") {
      console.log("setSignerType(UNSET)");
      setSignerType("UNSET");
      return;
    }

    if (profile.hasPrivateKey) {
      const privatekey = await getPrivateKey(profile.publickey);
      if (privatekey != "") {
        _ndk.signer = new NDKPrivateKeySigner(privatekey);

        setSignerType("PRIVATE");
        contextDebug("setSignerType(PRIVATE)");
        printConnectedRelays(_ndk);
        return;
      }
    } else {
      _ndk.signer = new NDKNip07Signer();
      setSignerType("NIP07");
      contextDebug("setSignerType(NIP07)");
      printConnectedRelays(_ndk);
      return;
    }

    contextDebug("setSignerType(UNSET)");
    setSignerType("UNSET");
    printConnectedRelays(_ndk);
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

  const publish = (
    event: NostrEvent,
    relays: string[],
    callback?: PublishCallback
  ) => {
    contextDebug(
      `publish event called: ${JSON.stringify(event)} ${JSON.stringify(relays)}`
    );

    const relayCount = relays.length;
    let publishedCount = 0;
    let error = "";

    const waitPublish = async (
      event: NostrEvent,
      relays: string[],
      callback?: PublishCallback
    ) => {
      console.log(`waitPublish typeof callback ${typeof callback}`);
      const relaySet = NDKRelaySet.fromRelayUrls(relays, _ndk);

      const ndkEvent = new NDKEvent(_ndk, event);
      console.log(`signerType ${signerType}`);
      if (signerType == "UNSET") {
        if (callback) {
          error = "no signer set";
          callback(publishedCount, relayCount, error);
        }
        if (callbackRef.current) {
          callbackRef.current(publishedCount, relayCount, error);
        }
        return;
      }

      if (signerType == "LOADING") {
        const endTime = Date.now() + 5000;
        while (Date.now() < endTime) {
          if (signerType != "LOADING") {
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      if (signerType == "PRIVATE" || signerType == "NIP07") {
        try {
          const result = await relaySet.publish(ndkEvent, 10000);
          publishedCount = result.size;
        } catch (error) {
          const errorStr =
            typeof error == "string" ? error : JSON.stringify(error);
          contextDebug(`error on publish: ${errorStr}`);
          if (callback) {
            callback(publishedCount, relayCount, errorStr);
          }
          if (callbackRef.current) {
            callbackRef.current(publishedCount, relayCount, errorStr);
          }
          return;
        }

        const mesg = `published to ${publishedCount}/${relayCount} relays`;
        contextDebug(`callbackRef.current(${mesg})`);

        if (callback) {
          callback(publishedCount, relayCount);
        }

        if (callbackRef.current) {
          callbackRef.current(publishedCount, relayCount);
        }
        return;
      } else {
        if (callback) {
          callback(
            publishedCount,
            relayCount,
            "error occured during publishing"
          );
        }
        if (callbackRef.current) {
          callbackRef.current(
            publishedCount,
            relayCount,
            "error occured during publishing"
          );
        }
      }
    };

    waitPublish(event, relays, callback);
  };

  const value = {
    init,
    setPublishCallback,
    fetchProfile,
    updateProfile,
    publish,
  };
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
