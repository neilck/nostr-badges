"use client";

import theme from "@/app/components/ThemeRegistry/theme";
import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { SessionState, useSessionContext } from "@/context/SessionContext";

export const StartSessionButton = (props: {
  badgeId: string;
  isGroup?: boolean;
}) => {
  const { badgeId, isGroup } = props; // naddr...
  const sessionContext = useSessionContext();

  const defaultLabel = isGroup ? "Join Group" : "Get Badge";
  const awardedLabel = isGroup ? "Join Group" : "Badge Awarded";

  const [buttonLabel, setButtonLabel] = useState(defaultLabel);
  const [disabled, setDisabled] = useState(false);

  useEffect(() => {
    const sessionState = sessionContext.state.sessionState;
    console.log(`StartSessionButton useEffect ${sessionState} ${isGroup}`);

    switch (sessionState) {
      case SessionState.Initial:
        setButtonLabel(defaultLabel);
        setDisabled(false);
        break;
      case SessionState.InProgress:
        if (isGroup) {
          setButtonLabel(defaultLabel);
          setDisabled(true);
        } else {
          setButtonLabel(defaultLabel);
          setDisabled(false);
        }
        break;
      case SessionState.DialogOpen:
        setButtonLabel("waiting...");
        setDisabled(true);
        break;
      case SessionState.ReadyToAward:
        if (isGroup) {
          setButtonLabel("Join Group");
          setDisabled(false);
        } else {
          setButtonLabel(awardedLabel);
          setDisabled(true);
          sessionContext.redirectToLogin();
          return;
        }
    }
  }, [sessionContext.state.sessionState]);

  const onClick = async () => {
    if (isGroup) {
      // button only enabled after all badges awarded
      // manual click to advance
      sessionContext.redirectToLogin();
    } else {
      // single baddge, so open dialog
      sessionContext.setCurrentBadge(badgeId);
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
