"use client";

import debug from "debug";

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { NostrEvent } from "@/data/ndk-lite";
import { GenericButton } from "@/app/components/items/GenericButton";

const loginDebug = debug("aka:Login");

export const ExtensionButton = (props: { onClick: () => void }) => {
  const clickHandler = async () => {
    // create a NIP-98 like event so we can verify
    // signing ability as an auth test

    let event: NostrEvent = {
      kind: 27235, // NIP-98,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        ["u", "https://app.akaprofiles.com"],
        ["method", "get"],
      ],
      content: "NIP-98 HTTP Auth",
      pubkey: "",
    };

    // @ts-ignore Error in NDK global interface declaration
    const signedEvent: any = await window.nostr
      ?.signEvent(event)
      .catch((error) => {
        // happens if user cancels
        return;
      });

    const pubkey = signedEvent?.pubkey;

    if (pubkey && pubkey != "") {
      onVerified(pubkey);
    } else {
      onVerified("");
    }
  };

  return (
    <GenericButton
      buttonLabel="Nostr Extension"
      color="secondary"
      onClick={clickHandler}
    />
  );
};
