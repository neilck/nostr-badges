"use client";

import theme from "@/app/components/ThemeRegistry/theme";
import { useState, useEffect, useRef } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "@/firebase-config";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { useSessionContext } from "@/context/SessionContext";

export const StartSessionButton = (props: {
  badgeId: string;
  naddr: string;
  state?: string;
  isGroup?: boolean;
}) => {
  const { badgeId, naddr, state, isGroup } = props; // naddr...
  const sessionContext = useSessionContext();
  const session = sessionContext.state.session;
  const sessionId = sessionContext.state.sessionId;
  const clientToken = sessionContext.state.clientToken;
  const current = sessionContext.state.current;

  const router = useRouter();
  const pathName = usePathname();

  const defaultLabel = isGroup ? "Join Group" : "Get Badge";
  const awardedLabel = isGroup ? "Join Group" : "Badge Awarded";

  const [uid, setUid] = useState("");
  const [buttonLabel, setButtonLabel] = useState(defaultLabel);
  const [hasSession, setHasSession] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [allAwarded, setAllAwarded] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const effectRan = useRef(false);
  useEffect(() => {
    // prevent 2nd session creation due to Next.js React.Strict in dev mode
    if (
      !effectRan.current ||
      (effectRan.current && process.env.NODE_ENV !== "development")
    ) {
      if (session == null) {
        startSession();
      }

      const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (user == null) {
          signInAnonymously(auth);
        } else {
          setUid(user.uid);
        }
      });
      return () => {
        effectRan.current = true;
        unsubscribe();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    console.log(`useEffect [session, current]`);
    // has Session
    setHasSession(session != null);
    // all badges awarded
    setAllAwarded(sessionContext.allBadgesAwarded());
    console.log(`allBadgesAwarded ${sessionContext.allBadgesAwarded()}`);
    // dialog open
    setDialogOpen(current != null);
  }, [session, current]);

  useEffect(() => {
    const updateButton = () => {
      console.log(`allAwarded ${allAwarded}`);
      if (isGroup) {
        setButtonLabel("Join Group");
        setDisabled(!allAwarded);
        return;
      } else {
        if (isLoading) {
          setButtonLabel("loading...");
          setDisabled(true);
          return;
        }
        if (!hasSession) {
          setButtonLabel(defaultLabel);
          setDisabled(false);
          return;
        }
        if (allAwarded) {
          setButtonLabel(awardedLabel);
          setDisabled(true);
          redirectToApply();
          return;
        }
        if (dialogOpen) {
          setButtonLabel("waiting...");
          setDisabled(true);
          return;
        } else {
          setButtonLabel(defaultLabel);
          setDisabled(false);
          return;
        }
      }
    };

    updateButton();
  }, [isLoading, hasSession, dialogOpen, allAwarded]);

  const startSession = async () => {
    if (!isGroup) await startBadgeSession();
    else await startGroupSession();
    setIsLoading(false);
  };

  const startBadgeSession = async () => {
    const functions = getFunctions();
    const createBadgeSession = httpsCallable(functions, "createBadgeSession");
    const result = await createBadgeSession({
      badgeId: badgeId,
      state: state ? state : "",
    });
    // @ts-ignore
    const newSession: { sessionId; awardToken; clientToken } = result.data;
    if (newSession.sessionId && newSession.clientToken) {
      sessionContext.loadSession(newSession.sessionId, newSession.clientToken);
    }
  };

  const startGroupSession = async () => {
    const functions = getFunctions();
    const createGroupSession = httpsCallable(functions, "createGroupSession");
    const result = await createGroupSession({
      groupId: badgeId,
      state: state ? state : "",
    });
    // @ts-ignore
    const newSession: { sessionId; awardToken; clientToken } = result.data;
    if (newSession.sessionId && newSession.clientToken) {
      sessionContext.loadSession(newSession.sessionId, newSession.clientToken);
    }
  };

  const redirectToApply = () => {
    // save sessionId and clientToken to sessionStorage before redirect
    const sessionId = sessionContext.state.sessionId;
    const clientToken = sessionContext.state.clientToken;

    if (sessionId && clientToken) {
      sessionStorage.setItem(
        "pendingAward",
        JSON.stringify({ sessionId: sessionId, clientToken: clientToken })
      );

      const searchParams = new URLSearchParams();
      searchParams.set("session", sessionId);
      const updatedURL = `/e/${naddr}/login?${searchParams.toString()}`;
      router.push(updatedURL);
    }
  };

  const onClick = async () => {
    if (!hasSession) {
      // create new session
      if (uid != "") {
        setIsLoading(true);
        setDisabled(true);
        await startSession();
        setIsLoading(false);
        setDisabled(false);
      }
    } else {
      if (isGroup) {
        // button only enabled after all badges awarded
        // manual click to advance
        redirectToApply();
      } else {
        // single baddge, so open dialog
        sessionContext.dispatch({ type: "setCurrentId", currentId: badgeId });
      }
    }
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="contained"
      color="secondary"
      sx={{
        width: "80%",
        color: theme.palette.grey[200],
        backgroundColor: theme.palette.orange.main,
        "&:hover": {
          color: theme.palette.grey[100],
          backgroundColor: theme.palette.orange.dark,
        },
      }}
    >
      <Typography variant="body2" align="center" fontWeight="800">
        {buttonLabel}
      </Typography>
    </Button>
  );
};
