"use client";

import { useAccountContext } from "@/context/AccountContext";
import { useSessionContext } from "@/context/SessionContext";
import { useNostrContext } from "@/context/NostrContext";
import GoogleButton from "@/app/components/Login/GoogleButton";
import { UserCredential } from "firebase/auth";
import { useEffect, useState } from "react";
import { Box, Button, Link, Stack, Typography } from "@mui/material";
import { ProfileSmall } from "./ProfileSmall";
import { SaveButtonEx } from "@/app/components/items/SaveButtonEx";
import { NostrButton } from "@/app/components/Login/NostrButton";
import { SessionState } from "@/context/SessionContext";
import { getDefaultRelays } from "@/data/relays";
import { getRelays } from "@/data/serverActions";

export const Sign = (props: { instructions: string; pubkey: string }) => {
  const instructions = props.instructions;

  const accountContext = useAccountContext();
  const sessionContext = useSessionContext();
  const nostrContext = useNostrContext();

  const [readyToSign, setReadyToSign] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pubkey, setPubkey] = useState(props.pubkey);
  const [uid, setUid] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [domain, setDomain] = useState("");
  const [usePubkey, setUsePubkey] = useState(props.pubkey != "");

  function getDomain(urlString: string): string {
    try {
      const url = new URL(urlString);
      return url.hostname;
    } catch (error) {
      return "";
    }
  }

  useEffect(() => {
    console.log(`useEffect[pubkey] setReadyToSign(${pubkey != ""})`);
    setReadyToSign(pubkey != "");
  }, [pubkey]);

  useEffect(() => {
    if (!usePubkey) {
      const profile = accountContext.state.currentProfile;
      if (profile) {
        setPubkey(profile.publickey);
        setUid(profile.uid);
      }
    }
  }, [accountContext.state.currentProfile]);

  useEffect(() => {
    if (sessionContext.state.session) {
      let redirectUrl = sessionContext.state.session.redirectUrl;
      const state = sessionContext.state.session.state;

      if (state != "" && redirectUrl != "") {
        redirectUrl = `${redirectUrl}?state=${state}`;
      }

      setRedirectUrl(redirectUrl);
      setDomain(getDomain(sessionContext.state.session.redirectUrl));
    }
  }, [sessionContext.state.session]);

  const onSignIn = (userCredential: UserCredential | void) => {
    if (userCredential) {
    }
  };

  const redirectToTargetPage = (url: string) => {
    setTimeout(() => {
      window.location.href = url;
    }, 3000);
  };

  const onSaveClick = async () => {
    if (!sessionContext.state.session) return { success: false };

    const state = sessionContext.getSessionState();

    console.log(state);
    if (
      state != SessionState.ReadyToAward &&
      state != SessionState.BadgeAwardsCreated
    )
      return { success: false };

    if (state == SessionState.ReadyToAward) {
      await sessionContext.createBadgeAwards(uid, pubkey);
    }

    const events = await sessionContext.getSignedEvents();

    // get relays associated with badge / group owner
    const result = await getRelays(
      sessionContext.state.session.itemState.owner
    );
    let relays = result.relays;

    if (result.defaultRelays) {
      relays = relays.concat(getDefaultRelays());
    }

    const promises: Promise<any>[] = [];
    for (let i = 0; i < events.length; i++) {
      promises.push(nostrContext.publish(events[i], relays));
    }

    await Promise.all(promises);
    setSaved(true);
    if (redirectUrl != "") {
      redirectToTargetPage(redirectUrl);
    }
    return { success: true };
  };

  const onChangeProfile = () => {
    setUsePubkey(false);
    setReadyToSign(false);
    accountContext.signOut(false);
  };
  return (
    <Box width="100%" alignItems="center">
      {readyToSign && (
        <Stack width="100%" alignItems="center">
          <Box pt={2} width="100%">
            <Typography variant="body1" fontWeight={600} textAlign="left">
              Profile
            </Typography>
          </Box>
          <Box width="100%">
            <ProfileSmall pubkey={pubkey} />
          </Box>

          <Box
            pt={2}
            width="auto"
            display="flex"
            flexDirection="column"
            alignItems="center"
          >
            <SaveButtonEx
              buttonLabel="Save to this profile"
              disabled={saved}
              onClick={onSaveClick}
              sx={{ width: "auto" }}
            />
            {!saved && (
              <Button onClick={onChangeProfile}>change profile</Button>
            )}
            {saved && domain != "" && (
              <Box>
                Redirecting back to <Link href={redirectUrl}>{domain}</Link>...
              </Box>
            )}
          </Box>
        </Stack>
      )}

      {!readyToSign && (
        <Stack width="100%" alignItems="center" spacing={1.5}>
          <Box pt={1} pb={1} pl={3} pr={3}>
            <Typography variant="body1">{instructions}</Typography>
          </Box>
          <GoogleButton disabled={false} redirect={false} onSignIn={onSignIn} />
          <NostrButton redirect={false} onSignIn={onSignIn} />
        </Stack>
      )}
    </Box>
  );
};
