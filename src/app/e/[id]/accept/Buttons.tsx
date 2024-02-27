"use client";

import { useState } from "react";
import { NostrEvent } from "@/data/ndk-lite";

import Box from "@mui/material/Box";
import { GenericButton } from "@/app/components/items/GenericButton";
import { PrivateKeyButton } from "./PrivateKeyButton";
import { useEffect } from "react";

export const Buttons = (props: { onVerified: (publickey: string) => void }) => {
  const onVerified = props.onVerified;
  const [state, setState] = useState("");
  const [pubkey, setPubkey] = useState("");

  const handleNostrStart = async () => {
    setState("EXT");
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

    if (signedEvent && signedEvent.pubkey) {
      setPubkey(signedEvent?.pubkey);
      onVerified(signedEvent?.pubkey);
    }

    setState("");
  };

  const handleNsecStart = () => {
    setState("NSEC");
  };

  const handleNsecEnd = () => {
    setState("");
  };

  const handleNsecPubkey = (pubkey: string) => {
    setPubkey(pubkey);
    onVerified(pubkey);
    setState("");
  };

  return (
    <>
      <GenericButton
        buttonLabel="Nostr Extension"
        color="secondary"
        disabled={state != ""}
        onClick={handleNostrStart}
      />

      <Box pt={1} pb={2}>
        <PrivateKeyButton
          key="nsec"
          disabled={state == "EXT"}
          onStart={handleNsecStart}
          onEnd={handleNsecEnd}
          onPubkey={handleNsecPubkey}
        />
      </Box>
    </>
  );
};
