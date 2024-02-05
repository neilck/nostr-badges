"use client";

import debug from "debug";
import theme from "@/app/components/ThemeRegistry/theme";
import { useEffect } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "@/firebase-config";
import {
  signInWithCustomToken,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { CapIcon } from "./items/CapIcon";
import { GoogleButton } from "./items/GoogleButton";
import { useAccountContext } from "@/context/AccountContext";

const loginDebug = debug("aka:Login");
const provider = new GoogleAuthProvider();

const onGoogleClick = async () => {
  provider.setCustomParameters({
    prompt: "select_account",
  });
  signInWithPopup(auth, provider).catch((error) => {
    loginDebug("signInWithPopup error: %o", error);
  });
};

const onNostrClick = async () => {
  // create a NIP-98 like event so we can verify
  // signing ability as an auth test

  type RawEvent = {
    kind: number;
    created_at: number;
    tags: string[][];
    content: string;
    pubkey?: string;
    id?: string;
    sig?: string;
  };

  let event: RawEvent = {
    kind: 27235, // NIP-98,
    created_at: Math.floor(Date.now() / 1000),
    tags: [
      ["u", "https://app.akaprofiles.com"],
      ["method", "get"],
    ],
    content: "NIP-98 HTTP Auth",
  };

  // @ts-ignore Error in NDK global interface declaration
  const signedEvent = await window.nostr?.signEvent(event).catch((error) => {
    loginDebug("Sign event error: %o", error);
    return;
  });

  loginDebug("signedEvent: %o", signedEvent);

  const functions = getFunctions();
  const createCustomAuthToken = httpsCallable(
    functions,
    "createCustomAuthToken"
  );
  const result = await createCustomAuthToken({ event: signedEvent });

  // @ts-ignore
  if (!result.data.success) {
    loginDebug("createCustomAuthToken failed: %o", result);
    return;
  }

  // @ts-ignore
  const token = result.data.token;

  signInWithCustomToken(auth, token).catch((error) => {
    loginDebug("Custom token signin error: %o", error);
  });
};

export const Login = () => {
  const { loading, account, creatorMode } = useAccountContext().state;
  const signOut = useAccountContext().signOut;

  const dispatch = useAccountContext().dispatch;
  const iconColor = theme.palette.orange.main;

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.common.white,
        pl: 2,
        pr: 2,
        pt: 1,
        pb: 4,
      }}
    >
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
        spacing={2}
      >
        <CapIcon
          fontSize="medium"
          sx={{ color: iconColor, width: "100px", height: "100px" }}
        />
        <Typography variant="h3" align="center">
          Access without identity
        </Typography>
        <Typography variant="body1" align="left" fontWeight={600}>
          Join today.
        </Typography>
        <GoogleButton
          onClick={() => {
            signOut();
            onGoogleClick();
          }}
          disabled={loading}
        />
        <Typography variant="body1">or</Typography>
        <Button
          variant="contained"
          onClick={() => {
            signOut();
            dispatch({ type: "setLoading", loading: true });
            onNostrClick().catch((error) => {
              console.log(error);
            });
          }}
          disabled={loading}
          sx={{
            backgroundColor: "#8e30eb", // nostr purple
            "&:hover": { backgroundColor: "#a915ff" },
            width: "191px",
            height: "40px",
          }}
        >
          Nostr Login
        </Button>
      </Stack>
    </Box>
  );
};
