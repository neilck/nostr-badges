"use client";

import theme from "@/app/components/ThemeRegistry/theme";
import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { PubkeySourceType } from "@/data/sessionLib";
import { Profile, getEmptyProfile } from "@/data/profileLib";
import { useSessionContext } from "@/context/SessionContext";
import { SessionState } from "@/context/SessionHelper";
import { ProfileSmall } from "./ProfileSmall";
import { PubkeyDialog } from "./PubkeyDialog";

export const StartSessionButton = (props: {
  badgeId: string;
  naddr: string;
  isGroup?: boolean;
}) => {
  const { badgeId, naddr, isGroup } = props; // naddr...
  const sessionContext = useSessionContext();
  const sessionState = sessionContext.getSessionState();

  const defaultLabel = isGroup ? "Join Group" : "Get Badge";
  const awardedLabel = isGroup ? "Join Group" : "Badge Awarded";
  const instructions = ".";

  const [pubkey, setPubkey] = useState("");
  const [profile, setProfile] = useState(getEmptyProfile());
  const [source, setSource] = useState<PubkeySourceType>("DIRECT");
  const [isLoading, setIsLoading] = useState(true);
  const [buttonLabel, setButtonLabel] = useState(defaultLabel);
  const [disabled, setDisabled] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    setIsLoading(sessionState == SessionState.Initial);

    switch (sessionState) {
      case SessionState.Initial:
        setButtonLabel(defaultLabel);
        setDisabled(false);
        break;
      case SessionState.InProgress:
        setButtonLabel(defaultLabel);
        setDisabled(true);
        break;
      case SessionState.ReadyToAward:
        if (isGroup) {
          setButtonLabel("Join Group");
          setDisabled(false);
          break;
        } else {
          setButtonLabel(awardedLabel);
          setDisabled(true);
          break;
        }
    }
  }, [
    sessionState,
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
    }
  };

  const handleLoginClick = () => {
    setShowDialog(true);
  };

  const handleDialogClose = (
    profile: Profile,
    pubkeySource: PubkeySourceType
  ) => {
    setShowDialog(false);

    const pubkey = profile.publickey;
    setPubkey(pubkey);
    setProfile(profile);
    sessionContext.changePubkey(pubkey, pubkeySource);

    setSource(source);
  };

  const onSwitchAccount = () => {
    setShowDialog(true);
  };

  if (isLoading) return <></>;

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
          }}
        >
          <Typography variant="body2" textAlign="center" fontWeight={600}>
            Click badges above to apply
          </Typography>
        </Box>
      )}
      {pubkey == "" && (
        <Box
          display="Flex"
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          pt={0.5}
        >
          <Typography variant="body2">Use existing account</Typography>
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
          <Typography variant="body2" fontWeight={400} pt={1}>
            Applying as
          </Typography>
          <ProfileSmall profile={profile} widthOption="wide" />
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
          color="primary"
          sx={{
            width: "80%",
            color: theme.palette.grey[200],
            backgroundColor: theme.palette.blue.main,
            "&:hover": {
              color: theme.palette.grey[100],
              backgroundColor: theme.palette.blue.dark,
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
        source={source}
      />
    </>
  );
};
