"use client";

import { useState, useEffect } from "react";
import { useSessionContext } from "@/context/SessionContext";
import { useAccountContext } from "@/context/AccountContext";
import { useNostrContext } from "@/context/NostrContext";

import { SessionState } from "@/context/SessionHelper";
import { Profile } from "@/data/profileLib";
import { PubkeySourceType } from "@/data/sessionLib";
import { getDefaultRelays } from "@/data/relays";
import { getRelays } from "@/data/serverActions";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

import { SignIn } from "../SignIn";

export type StageType = "LOADING" | "VERIFYING" | "ACCEPTING" | "DONE";

export const ContextSwitch = () => {
  const [stage, setStage] = useState<StageType>("LOADING");

  const nostrContext = useNostrContext();
  const sessionContext = useSessionContext();
  const type = sessionContext.state.session?.type ?? "";
  const pubkey = sessionContext.state.session?.pubkey ?? "";
  const pubkeySource: PubkeySourceType =
    sessionContext.state.session?.pubkeySource ?? "DIRECT";
  const sessionState = sessionContext.getSessionState();

  const accountContext = useAccountContext();
  const uid = accountContext.state.account?.uid ?? "";
  const profiles = accountContext.state.profiles;

  let pubkeyVerified = false;
  if (pubkey != "" && (pubkeySource == "AKA" || pubkeySource == "EXTENSION")) {
    pubkeyVerified = true;
  }

  const getHeader = (type: string) => {
    switch (type) {
      case "BADGE":
        return "Badge issued!";
      case "GROUP":
        return "Membership approved!";
      default:
        return "Approved!";
    }
  };

  const getInstructions = (type: string, useRecommended: boolean) => {
    if (!useRecommended) {
      switch (type) {
        case "BADGE":
          return "Select an account to assign this badge.";
        case "GROUP":
          return "Select an account to assign this group membership.";
        default:
          return "Select an account";
      }
    } else {
      switch (type) {
        case "BADGE":
          return "Login with this account to accept this badge.";
        case "GROUP":
          return "Login with this account to accept group membership.";
        default:
          return "Login";
      }
    }
  };

  const header = getHeader(type);
  const instructions = getInstructions(type, pubkey != "");

  useEffect(() => {
    if (pubkeyVerified) setStage("ACCEPTING");
    else setStage("VERIFYING");
  }, [pubkeyVerified]);

  useEffect(() => {
    switch (stage) {
      case "ACCEPTING": {
        createAndPublishEvents();
      }
    }
  }, [stage]);

  console.log(`pubkeyverified: ${pubkeyVerified.toString()} Stage: ${stage}`);

  const onSignIn = (profile: Profile, source: PubkeySourceType) => {
    const pubkey = profile.publickey;
    sessionContext.changePubkey(pubkey, pubkeySource);
    pubkeyVerified = true;
  };

  const createAndPublishEvents = async () => {
    const session = sessionContext.state.session;
    if (!session || sessionState != SessionState.ReadyToAward) return;

    await sessionContext.createBadgeAwards(uid, pubkey);
    const events = await sessionContext.getSignedEvents();
    // get relays associated with badge / group owner
    const result = await getRelays(session.itemState.owner);
    let relays = result.relays;

    if (result.defaultRelays) {
      relays = relays.concat(getDefaultRelays());
    }

    const promises: Promise<any>[] = [];
    for (let i = 0; i < events.length; i++) {
      promises.push(nostrContext.publish(events[i], relays));
    }

    await Promise.all(promises);
    setStage("DONE");
  };

  if (sessionState != SessionState.ReadyToAward) {
    return <>Not ready to save</>;
  }

  return (
    <>
      {stage == "LOADING" && <>loading</>}
      {stage == "VERIFYING" && (
        <>
          <Box pt={2} pb={3} width="100%">
            <SignIn
              isVisible={stage == "VERIFYING"}
              pubkey={pubkey}
              source={pubkeySource}
              save={true}
              onSignIn={onSignIn}
            />
          </Box>
        </>
      )}
      {stage == "ACCEPTING" && (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress />
          <Typography variant="body1" textAlign="center">
            saving...
          </Typography>
        </Box>
      )}
      {stage == "DONE" && <>done...</>}
    </>
  );
};

/*
  <>
      {stage == "LOADING" && <>loading</>}
      {stage == "VERIFYING" && (
        <>
          <Box pt={2} pb={3} width="100%">
            <Sign
              header={header}
              instructions={instructions}
              reqPubkey={pubkey}
            />
          </Box>
        </>
      )}
      {stage == "ACCEPTING" && <>saving...</>}
      {stage == "DONE" && <>done...</>}
    </>
    */
