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
}) => {
  const { badgeId, naddr } = props; // naddr...
  const sessionContext = useSessionContext();
  const session = sessionContext.state.session;
  const sessionId = sessionContext.state.sessionId;
  const clientToken = sessionContext.state.clientToken;
  const currentBadge = sessionContext.state.currentBadge;

  const router = useRouter();
  const pathName = usePathname();

  const [uid, setUid] = useState("");
  const [buttonLabel, setButtonLabel] = useState("Get Badge");
  const [hasSession, setHasSession] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const showGetBadge = () => {
    setButtonLabel("Get Badge");
    setDisabled(false);
  };

  const showAwarded = () => {
    setButtonLabel("Badge Awarded");
    setDisabled(true);
  };

  const showWaiting = () => {
    setButtonLabel("Waiting...");
    setDisabled(true);
  };

  const showLoading = () => {
    setButtonLabel("please wait...");
    setDisabled(true);
  };

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

  // update button based on session state
  useEffect(() => {
    // if no session, display Get Badge
    if (session == null) {
      setHasSession(false);
      showGetBadge();
      return;
    } else {
      setHasSession(true);
    }

    // if all badges awarded, show awarded
    if (sessionContext.allBadgesAwarded()) {
      showAwarded();
      return redirectToApply();
    }

    // if dialog is open
    if (currentBadge != null) {
      showWaiting();
      return;
    }

    // session exists, not all awarded, dialog closed

    showGetBadge();
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, currentBadge]);

  const startSession = async () => {
    const functions = getFunctions();
    const createBadgeSession = httpsCallable(functions, "createBadgeSession");
    const result = await createBadgeSession({ badgeId: badgeId });
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

    console.log(`redirectToApply ${sessionId} ${clientToken}`);
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
      // open dialog
      console.log(`StartSessionButton updateCurrentBadgeById(${badgeId})`);
      sessionContext.updateCurrentBadgeById(badgeId);
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
