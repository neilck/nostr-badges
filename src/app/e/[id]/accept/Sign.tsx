"use client";

import * as nip19 from "@/nostr-tools/nip19";
import { Profile } from "@/data/profileLib";
import { useAccountContext } from "@/context/AccountContext";
import GoogleButton from "@/app/components/Login/GoogleButton";
import { UserCredential } from "firebase/auth";
import { useEffect, useState } from "react";
import { Box, Button, Card, Divider, Stack, Typography } from "@mui/material";
import { ProfileSmall } from "./ProfileSmall";
import { SaveButtonEx } from "@/app/components/items/SaveButtonEx";
import { NostrButton } from "@/app/components/Login/NostrButton";
import { sessionCreateBadgeAwards } from "@/data/serverActions";

const shortNpub = (pubkey: string) => {
  const long = nip19.npubEncode(pubkey);
  return long.substring(0, 10) + "...";
};

export const Sign = (props: { instructions: string }) => {
  const instructions = props.instructions;
  const accountContext = useAccountContext();
  const [readyToSign, setReadyToSign] = useState(false);
  const [saveDisahbled, setSaveDisabled] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileName, setProfileName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [profileAbout, setProfileAbout] = useState("");

  useEffect(() => {
    const profile = accountContext.state.currentProfile;
    setProfile(profile);
  }, [accountContext.state.currentProfile]);

  useEffect(() => {
    const updateReadyToSign = () => {
      if (profile) {
        setReadyToSign(true);

        let npub = "";
        try {
          npub = shortNpub(profile.publickey);
        } catch {}

        let name = profile.displayName ?? "";
        if (name == "") name = profile.name ?? "";
        setProfileName(name + " " + npub);
        setProfileImage(profile.image ?? "/default/profile.png");
        setProfileAbout(profile.about ?? "");
        setSaveDisabled(!profile.hasPrivateKey);
      } else {
        setReadyToSign(false);
        setProfileName("");
        setProfileImage("");
        setProfileAbout("");
        setSaveDisabled(true);
      }
    };

    updateReadyToSign();
  }, [profile]);

  const onSignIn = (userCredential: UserCredential | void) => {
    console.log(`signIn result: ${JSON.stringify(userCredential)}`);
  };

  const onSaveClick = async () => {
    return { success: true };
  };

  const onChangeProfile = () => {
    if (profile) {
      accountContext.signOut(false);
    }
  };
  return (
    <Box width="100%" alignItems="center">
      {profile && (
        <Stack width="100%" alignItems="center">
          <Box width="100%">
            <ProfileSmall
              id={profile.uid}
              name={profileName}
              description={profileAbout}
              image={profileImage}
            />
            {!profile.hasPrivateKey && (
              <Typography variant="body1">
                No private key for this profile
              </Typography>
            )}
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
              disabled={saveDisahbled}
              onClick={onSaveClick}
              sx={{ width: "auto" }}
            />
            <Button onClick={onChangeProfile}>change profile</Button>
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
