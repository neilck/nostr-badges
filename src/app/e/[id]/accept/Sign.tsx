"use client";

import { useEffect, useState } from "react";
import { UserCredential } from "firebase/auth";

import { useAccountContext } from "@/context/AccountContext";
import { useSessionContext, SessionState } from "@/context/SessionContext";
import { useNostrContext } from "@/context/NostrContext";

import { getDefaultRelays } from "@/data/relays";
import { getRelays } from "@/data/serverActions";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { ProfileSmall } from "./ProfileSmall";
import { SaveButtonEx } from "@/app/components/items/SaveButtonEx";
import { Buttons } from "./Buttons";

export const Sign = (props: {
  header: string;
  instructions: string;
  reqPubkey: string;
}) => {
  const { header, instructions, reqPubkey } = props;

  const sessionContext = useSessionContext();
  const nostrContext = useNostrContext();

  const [alertError, setAlertError] = useState("");
  const [readyToSign, setReadyToSign] = useState(false);
  const [saved, setSaved] = useState(false);
  const [pubkey, setPubkey] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [domain, setDomain] = useState("");

  function getDomain(urlString: string): string {
    try {
      const url = new URL(urlString);
      return url.hostname;
    } catch (error) {
      return "";
    }
  }

  useEffect(() => {
    setReadyToSign(pubkey != "");
  }, [pubkey]);

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

  const redirectToTargetPage = (url: string) => {
    setTimeout(() => {
      window.location.href = url;
    }, 3000);
  };

  const onSaveClick = async () => {
    if (!sessionContext.state.session) return { success: false };

    const state = sessionContext.getSessionState();
    if (
      state != SessionState.ReadyToAward &&
      state != SessionState.BadgeAwardsCreated
    )
      return { success: false };

    if (state == SessionState.ReadyToAward) {
      await sessionContext.createBadgeAwards("", pubkey);
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
    setPubkey("");
  };

  const verifiedHandler = (pubkey: string) => {
    console.log(`verifiedHandler ${pubkey}`);
    if (reqPubkey != "" && pubkey != reqPubkey) {
      setAlertError("Accounts do not match.");
    } else {
      setPubkey(pubkey);
    }
  };

  return (
    <Box width="100%" alignItems="center">
      {readyToSign && (
        <Stack width="100%" alignItems="center">
          <Box pt={2} width="100%">
            <Typography variant="body1" fontWeight={600} textAlign="left">
              Account
            </Typography>
          </Box>
          <Box width="100%">
            <ProfileSmall key="selectedProfile" pubkey={pubkey} />
          </Box>

          <Box
            pt={2}
            width="auto"
            display="flex"
            flexDirection="column"
            alignItems="center"
          >
            <SaveButtonEx
              buttonLabel="Save to this account"
              disabled={saved}
              onClick={onSaveClick}
              sx={{ width: "auto" }}
            />
            {!saved && (
              <Button onClick={onChangeProfile}>change account</Button>
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
          <Box pt={1} pl={3} pr={3}>
            <Typography variant="body1" fontWeight={600} sx={{ pb: 1 }}>
              {header}
            </Typography>
            <Typography variant="body1">{instructions}</Typography>
            {reqPubkey != "" && (
              <>
                <Box width="100%" pt={2}>
                  <ProfileSmall key="selectedProfile" pubkey={reqPubkey} />
                </Box>
                <Collapse in={alertError != ""}>
                  <Alert
                    severity={"error"}
                    onClose={() => {
                      setAlertError("");
                    }}
                    sx={{ minWidth: "100px", width: "fit-content" }}
                  >
                    {alertError}
                  </Alert>
                </Collapse>
              </>
            )}
          </Box>

          <Buttons onVerified={verifiedHandler} />
        </Stack>
      )}
    </Box>
  );
};
