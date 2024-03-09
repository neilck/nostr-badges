"use client";

import { useState, useEffect } from "react";
import { getFunctions, httpsCallable } from "firebase/functions";
import * as nip19 from "@/nostr-tools/nip19";
import { auth } from "@/firebase-config";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

import { Profile } from "@/data/profileLib";

import styles from "./styles.module.css";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import {
  CardHeading,
  CardSubHeading,
} from "@/app/components/items/CardHeadings";
import { ProfileSmall } from "./ProfileSmall";
import GoogleButton from "@/app/components/items/GoogleButton";
import { CapIcon } from "@/app/components/items/CapIcon";

const provider = new GoogleAuthProvider();

export const PubkeyDialog = (props: {
  show: boolean;
  pubkey: string;
  onClose: (pubkey: string) => void;
}) => {
  const defaultHelperText = "Paste a hex public key or npub";
  const { show, onClose } = props;
  const [googleError, setGoogleError] = useState("");
  const [pubkey, setPubkey] = useState(props.pubkey);
  const [textPubkey, setTextPubkey] = useState("");
  const [helperText, setHelperText] = useState(defaultHelperText);
  const [textError, setTextError] = useState(false);

  useEffect(() => {
    if (show) {
      // @ts-ignore
      document.getElementById("pubkeydialog").showModal();
    } else {
      // @ts-ignore
      document.getElementById("pubkeydialog").close();
    }
  }, [show]);

  function validateKey(key: string): {
    valid: boolean;
    key: string;
    mesg: string;
  } {
    const clean = key.trim();
    if (key.startsWith("npub")) {
      try {
        const result = nip19.decode(clean);
        if (
          result.type != "npub" ||
          typeof result.data != "string" ||
          result.data == ""
        ) {
          return { valid: false, key: "", mesg: "not a valid npub" };
        }
        return { valid: true, key: result.data, mesg: "" };
      } catch {
        return { valid: false, key: "", mesg: "not a valid npub" };
      }
    } else {
      const hexRegex = /^[0-9a-fA-F]+$/;
      if (!hexRegex.test(clean) || clean.length != 64)
        return { valid: false, key: "", mesg: "not a valid public key" };
      else {
        return { valid: true, key: clean, mesg: "" };
      }
    }
  }
  const onCloseClick = () => {
    onClose("");
  };

  const onNostrClick = async () => {
    // @ts-ignore Error in NDK global interface declaration
    setTextPubkey("");
    setTextError(false);
    const hexPubkey = await window.nostr?.getPublicKey().catch((error) => {
      console.log(`get public key cancelled: ${error}`);
      return;
    });
    if (hexPubkey && hexPubkey != "") {
      setPubkey(hexPubkey);
    }
  };

  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTextError(false);
    setHelperText(defaultHelperText);
    const updated = event.currentTarget.value;
    setTextPubkey(updated);
  };

  const onSubmitClick = () => {
    const result = validateKey(textPubkey);
    if (!result.valid) {
      setTextError(true);
      setHelperText(result.mesg);
    } else {
      setPubkey(result.key);
    }
  };

  const onGoogleClick = async () => {
    provider.setCustomParameters({
      prompt: "select_account",
    });
    const userCredential = await signInWithPopup(auth, provider).catch(
      (error) => {
        // swallow error
        console.log("google sign-in cancelled");
        return;
      }
    );

    let found = false;
    if (userCredential) {
      const functions = getFunctions();
      const getProfiles = httpsCallable(functions, "getProfiles");
      const result = await getProfiles();
      if (result.data) {
        const profiles = result.data as Profile[];
        console.log(`profiles: ${JSON.stringify(profiles)}`);
        if (profiles.length > 0) {
          found = true;
          console.log(`profile: ${JSON.stringify(profiles[0])}`);
          setPubkey(profiles[0].publickey);
        }
      }
    }
    if (!found) setGoogleError("Account not setup.");

    auth.signOut();
  };

  return (
    <dialog id="pubkeydialog" className={styles.customdialog}>
      <Box id="pubkeydialogcontent" className={styles.customdialogcontent}>
        <Stack direction="column" alignItems="center" columnGap="10px">
          <CapIcon fontSize="large" sx={{ color: "orange.main" }} />
          {/* display at sm and smaller */}

          <Typography
            variant="body1"
            fontWeight={500}
            sx={{
              color: "grey.800",
            }}
          >
            AKA Profiles
          </Typography>
        </Stack>
        <Stack
          direction="column"
          alignItems="center"
          width="100%"
          height="100%"
        >
          <Box width="auto" pt={1}>
            <CardHeading>Apply with Existing Account</CardHeading>
          </Box>
          <Typography>Sign in to apply with an existing account</Typography>
          {pubkey == "" && (
            <Stack direction="column" pt={2} spacing={2} alignItems="center">
              <Box display="flex" flexDirection="column">
                <GoogleButton disabled={false} onClick={onGoogleClick} />
                {googleError != "" && (
                  <Typography variant="subtitle2">{googleError}</Typography>
                )}
              </Box>

              <Button
                variant="contained"
                onClick={onNostrClick}
                sx={{
                  backgroundColor: "#8e30eb", // nostr purple
                  "&:hover": { backgroundColor: "#a915ff" },
                  width: "191px",
                  height: "40px",
                }}
              >
                Nostr Extension
              </Button>

              <Box
                display="flex"
                flexDirection="column"
                width="auto"
                p={1}
                border={1}
                borderColor="grey.300"
              >
                <Box width="auto">
                  <CardSubHeading>Public Key</CardSubHeading>
                </Box>
                <Box pt={1}>
                  <TextField
                    id="pubkey"
                    value={textPubkey}
                    onChange={onChangeHandler}
                    size="small"
                    helperText={helperText}
                    error={textError}
                  />
                  <Button variant="text" size="small" onClick={onSubmitClick}>
                    submit
                  </Button>
                </Box>
              </Box>
              <Button onClick={onCloseClick} sx={{ width: "160px", pt: 3 }}>
                <Typography variant="body1" align="center" fontWeight="600">
                  cancel
                </Typography>
              </Button>
            </Stack>
          )}
          {pubkey != "" && (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              pt={1}
            >
              <Box width="auto" border={1} borderColor="grey.300" pb={0.5}>
                <ProfileSmall widthOption="wide" pubkey={pubkey} />
              </Box>
              <Box pt={1} pb={1}>
                Use this account?
              </Box>
              <Box>
                <Button
                  onClick={() => {
                    onClose(pubkey);
                    setPubkey("");
                  }}
                >
                  <Typography variant="body1" align="center" fontWeight={600}>
                    yes
                  </Typography>
                </Button>
                <Button
                  onClick={() => {
                    setPubkey("");
                  }}
                >
                  <Typography variant="body1" align="center">
                    no
                  </Typography>
                </Button>
              </Box>
            </Box>
          )}
        </Stack>
      </Box>
    </dialog>
  );
};
