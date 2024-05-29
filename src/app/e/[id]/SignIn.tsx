"use client";

import { useState, useEffect } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import { auth } from "@/firebase-config";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithCustomToken,
} from "firebase/auth";
import { useAccountContext } from "@/context/AccountContext";

import { Profile, getEmptyProfile } from "@/data/profileLib";
import { PubkeySourceType } from "@/data/sessionLib";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { CardHeading } from "@/app/components/items/CardHeadings";
import { ProfileSmall } from "./ProfileSmall";
import GoogleButton from "@/app/components/items/GoogleButton";

const provider = new GoogleAuthProvider();

export const SignIn = (props: {
  isVisible: boolean;
  pubkey: string;
  source: PubkeySourceType;
  save?: boolean;
  onSignIn: (profile: Profile, pubkeySource: PubkeySourceType) => void;
}) => {
  const { save } = props;
  const { isVisible, onSignIn } = props;

  const accountContext = useAccountContext();

  let heading = "Apply with Existing Account";
  let instructions = "Sign in to apply with an existing account";
  let profileSelectText = save ? "Save to profile" : "Choose a profile";

  const [profileSelect, setProfileSelect] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const [disabled, setDisabled] = useState(false);
  const [pubkey, setPubkey] = useState(props.pubkey);
  const [pubkeySource, setPubkeySource] = useState<PubkeySourceType>(
    props.source
  );
  const emptyProfile = getEmptyProfile();
  emptyProfile.publickey = props.pubkey;
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const profiles = accountContext.state.profiles;

  useEffect(() => {
    if (!isVisible) {
      setProfileSelect(false);
      setGoogleError("");
      const emptyProfile = getEmptyProfile();
      emptyProfile.publickey = props.pubkey;
      setProfile(emptyProfile);
      setPubkeySource(props.source);
      // setProfiles([]);
    }
  }, [isVisible]);

  useEffect(() => {
    if (!profiles) return;

    const pubkeys = Object.keys(profiles);

    if (pubkey == "") {
      if (pubkeys.length == 1) {
        const singleKey = pubkeys[0];
        setPubkey(singleKey);
        setPubkeySource("AKA");
        setProfile(profiles[singleKey]);
        return;
      }

      if (pubkeys.length > 1) {
        setProfileSelect(true);
        return;
      }
    } else {
      if (pubkey in profiles) {
        setProfile(profiles[pubkey]);
        return;
      }
    }
  }, [profiles]);

  useEffect(() => {
    if (pubkey == "") {
      const profile = getEmptyProfile();
      profile.publickey = pubkey;
      setProfile(profile);
      return;
    }

    if (profiles) {
      const pubkeys = Object.keys(profiles);
      if (pubkeys.includes(pubkey)) {
        setProfile(profiles[pubkey]);
        return;
      }
    }
  }, [pubkey]);

  const onNostrClick = async () => {
    setDisabled(true);
    auth.signOut();

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
      setDisabled(false);
    });

    if (!signedEvent) {
      setDisabled(false);
      return;
    }

    // @ts-ignore Error in in signedEvent definition
    const hexPubkey = signedEvent.pubkey;
    if (hexPubkey && hexPubkey != "") {
      setPubkey(hexPubkey);
      setPubkeySource("EXTENSION");
    }

    const functions = getFunctions();
    const createCustomAuthToken = httpsCallable(
      functions,
      "createCustomAuthToken"
    );
    const result = await createCustomAuthToken({ event: signedEvent });

    // @ts-ignore
    if (!result.data.success) {
      setDisabled(false);
      return;
    }

    // @ts-ignore
    const token = result.data.token;
    const userCredential = await signInWithCustomToken(auth, token).catch(
      (error) => {
        setDisabled(false);
        return;
      }
    );

    setDisabled(false);
  };

  const onGoogleClick = async () => {
    setDisabled(true);
    auth.signOut();
    provider.setCustomParameters({
      prompt: "select_account",
    });
    const userCredential = await signInWithPopup(auth, provider).catch(
      (error) => {
        setDisabled(false);
        return;
      }
    );

    setPubkey("");
    setPubkeySource("AKA");
    setDisabled(false);
  };

  const onProfileClick = (publickey: string) => {
    if (profiles) {
      const profile = profiles[publickey];
      onSignIn(profile, "AKA");
      setPubkey("");
      setPubkeySource("DIRECT");
    } else {
      setPubkey(publickey);
      setPubkeySource("AKA");
      setProfileSelect(false);
    }
  };

  return (
    <>
      <Stack direction="column" alignItems="center" width="100%">
        {!save && (
          <>
            <Box width="auto" pt={1}>
              <CardHeading>{heading}</CardHeading>
            </Box>
            <Typography>{instructions}</Typography>
          </>
        )}
        {pubkey == "" && !profileSelect && (
          <Stack direction="column" pt={2} spacing={2} alignItems="center">
            {save && (
              <Typography variant="body1">
                Sign in to save credentials
              </Typography>
            )}
            <Box display="flex" flexDirection="column">
              <GoogleButton disabled={disabled} onClick={onGoogleClick} />
              {googleError != "" && (
                <Typography variant="subtitle2">{googleError}</Typography>
              )}
            </Box>

            <Button
              variant="contained"
              onClick={onNostrClick}
              disabled={disabled}
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
          </Stack>
        )}
        {pubkey != "" && (
          <Box display="flex" flexDirection="column" alignItems="center" pt={1}>
            <Box width="auto" border={1} borderColor="grey.300" pb={0.5}>
              <ProfileSmall widthOption="wide" profile={profile} />
            </Box>
            <Box pt={1} pb={1}>
              Use this profile?
            </Box>
            <Box>
              <Button
                onClick={() => {
                  onSignIn(profile, pubkeySource);
                  setPubkey("");
                  setPubkeySource("DIRECT");
                }}
              >
                <Typography variant="body1" align="center" fontWeight={600}>
                  yes
                </Typography>
              </Button>
              <Button
                onClick={() => {
                  setPubkey("");
                  setPubkeySource("DIRECT");
                }}
              >
                <Typography variant="body1" align="center">
                  no
                </Typography>
              </Button>
            </Box>
          </Box>
        )}
        {profileSelect && (
          <Box display="flex" flexDirection="column" alignItems="center" pt={1}>
            <Box pt={1} pb={1}>
              <Typography variant="body1">{profileSelectText}</Typography>
            </Box>
            <Box sx={{ mb: 1, maxHeight: "250px", overflowY: "auto" }}>
              {profiles &&
                Object.keys(profiles).map((key) => {
                  const profile = profiles[key];
                  return (
                    <Box
                      key={profile.publickey}
                      width="auto"
                      border={1}
                      borderColor="grey.300"
                      pb={0.5}
                      onClick={() => {
                        onProfileClick(profile.publickey);
                      }}
                      sx={{
                        "&:hover": {
                          border: 2,
                          borderRadius: 1,
                          borderColor: "blue.light",
                        },
                      }}
                    >
                      <ProfileSmall widthOption="wide" profile={profile} />
                    </Box>
                  );
                })}
            </Box>

            <Box>
              <Button
                onClick={() => {
                  setProfileSelect(false);
                }}
              >
                <Typography variant="body1" align="center">
                  change account
                </Typography>
              </Button>
            </Box>
          </Box>
        )}
      </Stack>
    </>
  );
};
