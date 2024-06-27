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
  NDKFilter,
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

export type IsEventPublishedItem = { eventId: string; published: boolean };

export type PublishedItem = {
  publishedCount: number;
  relayCount: number;
  error?: string;
};

export type PublishCallback = (publishedItem: PublishedItem) => void;

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
      areEventsPublished: (
        ids: string[],
        relays: string[]
      ) => Promise<IsEventPublishedItem[]>;
      publishWithCallback: (
        event: NostrEvent,
        relays: string[],
        callback: PublishCallback
      ) => void;
      publishAsync: (
        event: NostrEvent,
        replays: string[]
      ) => Promise<PublishedItem>;
      setPublishCallback: (
        callback: ((publishedItem: PublishedItem) => void) | null
      ) => void;
    }
  | undefined
>(undefined);

function NostrProvider({ children }: NostrProviderProps) {
  const callbackRef = useRef<((publishedItem: PublishedItem) => void) | null>(
    null
  );

  const setPublishCallback = useCallback(
    (callback: ((publishedItem: PublishedItem) => void) | null) => {
      callbackRef.current = callback;
    },
    []
  );

  const [signerType, setSignerType] = useState<SignerType>("UNSET");

  const init = async (profile: Profile) => {
    setSignerType("LOADING");
    if (profile.publickey == "") {
      contextDebug("setSignerType(UNSET)");
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
    contextDebug(
      `fetchProfile ${JSON.stringify(user)} ${JSON.stringify(profile)}`
    );
    contextDebug(`relays: ${JSON.stringify(_ndk.explicitRelayUrls)}`);
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
    await user.fetchProfile();

    if (!user.profile) {
      contextDebug(`no profile found for contextDebug`);
      return;
    }

    if (user.profile) {
      user.profile.name = name;
      user.profile.displayName = displayName;
      user.profile.image = image;
      user.profile.about = about;
      contextDebug(`publishing profile for ${publickey}`);
      return user.publish();
    }
  };

  const areEventsPublished = async (
    ids: string[],
    relays: string[]
  ): Promise<IsEventPublishedItem[]> => {
    contextDebug(
      `areEventsPublished called with ${JSON.stringify({ ids, relays })}`
    );
    const result = [] as IsEventPublishedItem[];
    for (let id in ids) {
      result.push({ eventId: id, published: false });
    }
    // for each event, check if published
    const filter: NDKFilter = {
      ids: ids,
    };

    const relaySet = NDKRelaySet.fromRelayUrls(relays, _ndk);
    const events = await _ndk.fetchEvents(filter, undefined, relaySet);
    contextDebug(`_ndk.fetchEvents returned ${JSON.stringify(events)}`);

    for (let event of events) {
      let found = false;
      for (let isEventPublishedItem of result) {
        if (isEventPublishedItem.eventId == event.id) {
          found = true;
          isEventPublishedItem.published = true;
          break;
        }
      }

      if (!found)
        throw Error(
          `areEventsPublished subscription returned unexpected event: ${JSON.stringify(
            event
          )}`
        );
    }

    contextDebug(`areEventsPublished returning ${JSON.stringify(result)}`);
    return result;
  };

  const publishLogic = async (
    event: NostrEvent,
    relays: string[]
  ): Promise<PublishedItem> => {
    const relayCount = relays.length;
    let publishedCount = 0;
    let error = "";

    if (!event.sig) {
      return { publishedCount, relayCount, error: "event not signed" };
    }

    if (!event.kind || event.kind == -1) {
      return { publishedCount, relayCount, error: "event kind not set" };
    }

    const relaySet = NDKRelaySet.fromRelayUrls(relays, _ndk);
    const ndkEvent = new NDKEvent(_ndk, event);

    if (signerType == "UNSET") {
      return { publishedCount, relayCount, error: "no signer set" };
    }

    if (signerType == "LOADING") {
      const endTime = Date.now() + 5000;
      while (Date.now() < endTime && signerType === "LOADING") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    if (["PRIVATE", "NIP07"].includes(signerType)) {
      try {
        const result = await relaySet.publish(ndkEvent, 10000);
        publishedCount = result.size;
        contextDebug(
          `publish eventId ${ndkEvent.id} result: ${JSON.stringify(result)}`
        );
      } catch (error) {
        contextDebug(error);
        const errorStr =
          typeof error == "string" ? error : JSON.stringify(error);
        contextDebug(`error on publish: ${errorStr}`);
        return { publishedCount, relayCount, error: errorStr };
      }
    } else {
      return {
        publishedCount,
        relayCount,
        error: "error occurred during publishing",
      };
    }

    return { publishedCount, relayCount, error: "" };
  };

  const publishWithCallback = (
    event: NostrEvent,
    relays: string[],
    callback: PublishCallback
  ) => {
    contextDebug(
      `publish event called: ${JSON.stringify(event)} ${JSON.stringify(relays)}`
    );
    const relayCount = relays.length;

    const handleResult = (publishedItem: PublishedItem) => {
      if (callback) {
        callback(publishedItem);
      }
      if (callbackRef.current) {
        callbackRef.current(publishedItem);
      }
    };

    publishLogic(event, relays)
      .then(handleResult)
      .catch((error) =>
        handleResult({
          publishedCount: 0,
          relayCount: relays.length,
          error: error.toString(),
        })
      );
  };

  const publishAsync = async (event: NostrEvent, relays: string[]) => {
    contextDebug(
      `publish event called: ${JSON.stringify(event)} ${JSON.stringify(relays)}`
    );
    return await publishLogic(event, relays);
  };

  const value = {
    init,
    setPublishCallback,
    fetchProfile,
    updateProfile,
    areEventsPublished,
    publishWithCallback,
    publishAsync,
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
