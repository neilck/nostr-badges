"use client";

import { useState, useEffect } from "react";
import { useSessionContext } from "@/context/SessionContext";
import { useAccountContext } from "@/context/AccountContext";

import { SessionState } from "@/context/SessionHelper";
import { Profile } from "@/data/profileLib";
import { PubkeySourceType } from "@/data/sessionLib";
import { getDefaultRelays } from "@/data/relays";
import { getRelays } from "@/data/serverActions";

import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

import { SignIn } from "../SignIn";
import { Session } from "inspector";

export const ContextSwitch = () => {
  const sessionContext = useSessionContext();
  const type = sessionContext.state.session?.type ?? "";
  const pubkey = sessionContext.state.session?.pubkey ?? "";
  const pubkeySource: PubkeySourceType =
    sessionContext.state.session?.pubkeySource ?? "DIRECT";
  const sessionState = sessionContext.state.sessionState;

  const accountContext = useAccountContext();
  const uid = accountContext.state.account?.uid ?? "";

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
    switch (sessionState) {
      case SessionState.identified:
        sessionContext.createBadgeAwardEvents(uid, pubkey);
        break;
      case SessionState.awarded:
        sessionContext.publishEvents();
        break;
    }
  }, [sessionContext.state.sessionState]);

  const onSignIn = (profile: Profile, source: PubkeySourceType) => {
    const pubkey = profile.publickey;
    sessionContext.changePubkey(pubkey, source);
  };

  return (
    <>
      {(sessionState == SessionState.start ||
        sessionState == SessionState.loading) && <>loading</>}
      {sessionState == SessionState.filled && (
        <>
          <Box pt={2} pb={3} width="100%">
            <SignIn
              isVisible={sessionState == SessionState.filled}
              pubkey={pubkey}
              source={pubkeySource}
              save={true}
              onSignIn={onSignIn}
            />
          </Box>
        </>
      )}
      {(sessionState == SessionState.identifying ||
        sessionState == SessionState.awarding ||
        sessionState == SessionState.awarded ||
        sessionState == SessionState.publishing) && (
        <Box
          sx={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box pt={3}>
            <CircularProgress />
          </Box>
          <Box pt={1}>
            <Typography variant="body1">{sessionState}</Typography>
          </Box>
        </Box>
      )}
    </>
  );
};
