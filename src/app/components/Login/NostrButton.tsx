"use client";

import debug from "debug";
import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "@/firebase-config";
import { UserCredential, signInWithCustomToken } from "firebase/auth";

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { useAccountContext } from "@/context/AccountContext";

const loginDebug = debug("aka:Login");

export const NostrButton = (props: {
  redirect?: boolean;
  onSignIn?: (userCredential: void | UserCredential) => void;
}) => {
  const { redirect, onSignIn } = props;
  const accountContext = useAccountContext();
  const { loading } = accountContext.state;
  const dispatch = accountContext.dispatch;

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
      dispatch({ type: "setLoading", loading: false });
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

    signInWithCustomToken(auth, token)
      .then((result) => {
        if (onSignIn) onSignIn(result);
      })
      .catch((error) => {
        loginDebug("Custom token signin error: %o", error);
      })
      .finally(() => {
        dispatch({ type: "setLoading", loading: false });
      });
  };

  const clickHandler = () => {
    accountContext.signOut(redirect);
    dispatch({ type: "setLoading", loading: true });
    onNostrClick().catch((error) => {
      console.log(error);
    });
  };

  return (
    <Button
      variant="contained"
      onClick={clickHandler}
      disabled={loading}
      sx={{
        backgroundColor: "#8e30eb", // nostr purple
        "&:hover": { backgroundColor: "#a915ff" },
        width: "191px",
        height: "40px",
      }}
    >
      <Typography variant="body1" fontWeight={600}>
        Nostr Extension
      </Typography>
    </Button>
  );
};
