"use client";

import theme from "@/app/components/ThemeRegistry/theme";
import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";

import { SessionState, useSessionContext } from "@/context/SessionContext";
import Link from "next/link";
import { ProfileSmall } from "./ProfileSmall";
import { PubkeyDialog } from "./PubkeyDialog";

export const StartSessionButton = (props: {
  badgeId: string;
  naddr: string;
  isGroup?: boolean;
}) => {
  const { badgeId, naddr, isGroup } = props; // naddr...
  const sessionContext = useSessionContext();

  const defaultLabel = isGroup ? "Join Group" : "Get Badge";
  const awardedLabel = isGroup ? "Join Group" : "Badge Awarded";
  const instructions = ".";

  const [pubkey, setPubkey] = useState("");
  const [buttonLabel, setButtonLabel] = useState(defaultLabel);
  const [disabled, setDisabled] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const sessionState = sessionContext.state.sessionState;

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
          sessionContext.redirectToLogin(naddr);
          return;
        }
    }
  }, [
    sessionContext.state.sessionState,
    awardedLabel,
    defaultLabel,
    isGroup,
    naddr,
    sessionContext,
  ]);

  useEffect(() => {
    if (sessionContext.state.session) {
      setPubkey(sessionContext.state.session.pubkey);
    } else {
      setPubkey("");
    }
  }, [sessionContext.state.session]);

  const onClick = async () => {
    if (isGroup) {
      // button only enabled after all badges awarded
      // manual click to advance
      sessionContext.redirectToLogin(naddr);
    } else {
      // single baddge, so open dialog
      sessionContext.setCurrentBadge(badgeId);
    }
  };

  const handleLoginClick = () => {
    setShowDialog(true);
  };

  const handleDialogClose = (pubkey: string) => {
    setShowDialog(false);
    sessionContext.changePubkey(pubkey);
    setPubkey(pubkey);
  };

  const onSwitchAccount = () => {
    setShowDialog(true);
  };

  return (
    <>
      {disabled && (
        <Box
          display="flex"
          flexDirection="column"
          sx={{
            p: 0.5,
            pl: 1,
            pr: 1,
            border: 2,
            borderRadius: 10,
            borderColor: "blue.main",
            color: "blue.main",
          }}
        >
          <Typography variant="body2" fontWeight={600}>
            Click badges above to apply
          </Typography>
        </Box>
      )}
      {pubkey == "" && (
        <Box display="Flex" flexDirection="row" alignItems="center" pt={0.5}>
          <Typography variant="body2">Already have an account?</Typography>
          <Button variant="text" size="small" onClick={handleLoginClick}>
            <Typography
              variant="body2"
              color="primary"
              fontWeight={600}
              pl={0.5}
            >
              sign in
            </Typography>
          </Button>
        </Box>
      )}
      {pubkey != "" && (
        <Box display="flex" flexDirection="column">
          <Typography variant="body1" fontWeight={600}>
            Applying as
          </Typography>
          <ProfileSmall pubkey={pubkey} widthOption="wide" />
          <Button variant="text" size="small" onClick={onSwitchAccount}>
            switch account...
          </Button>
        </Box>
      )}
      {!disabled && (
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
      )}
      <Box pb="10"></Box>
      <PubkeyDialog
        show={showDialog}
        onClose={handleDialogClose}
        pubkey={pubkey}
      />
    </>
  );
};
