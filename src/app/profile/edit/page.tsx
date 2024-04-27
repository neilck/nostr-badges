"use client";

import theme from "@/app/components/ThemeRegistry/theme";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useAccountContext } from "@/context/AccountContext";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

import { CommonLayout } from "@/app/components/ComonLayout";
import { CardHeading } from "@/app/components/items/CardHeadings";
import { AddProfileDialog } from "@/app/components/AddProfileDialog";
import { Profile, getEmptyProfile } from "@/data/profileLib";
import { Section } from "./Section";
import { ProfileDisplay } from "./ProfileDisplay";
import { ProfileEdit } from "./ProfileEdit";

export default function ProfilePage() {
  const accountContext = useAccountContext();
  const loading = accountContext.state.loading;

  const router = useRouter();
  let profile = accountContext.currentProfile;

  const [edittingHi, setEdittingHi] = useState(false);
  const [edittingProfile, setEditingProfile] = useState(false);

  const handleProfileSave = (profile: Profile) => {
    setEditingProfile(false);
  };

  const handleAddClose = async (
    data: { username?: string; privatekey?: string } | null
  ) => {
    if (data) {
      const { username, privatekey } = data;
      if (username) {
        const functions = getFunctions();
        const createProfile = httpsCallable(functions, "createProfile");
        const result = await createProfile({ username: username });
        const data: any = result.data;
        const profile: Profile = data;
        accountContext.setCurrentProfile(profile);
      }
    }

    router.push("/profile/edit");
  };

  const handleOnEdit = (id: string) => {
    switch (id) {
      case "hi":
        setEdittingHi(!edittingHi);
        break;
      case "profile":
        setEditingProfile(!edittingProfile);
        break;
    }
  };

  return (
    <CommonLayout
      developerMode={false}
      bgColor={theme.palette.background.paper}
    >
      <Stack width="400px" minWidth="300px" pt={4} spacing={2}>
        <CardHeading>Edit Profile</CardHeading>
        <Section id="hi" edit={!edittingHi} onEdit={handleOnEdit}>
          Hi
        </Section>
        <Section id="profile" edit={!edittingProfile} onEdit={handleOnEdit}>
          {loading && (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
              }}
            >
              <CircularProgress />
            </Box>
          )}
          {!loading && edittingProfile && (
            <ProfileEdit profile={profile} onSave={handleProfileSave} />
          )}
          {!loading && !edittingProfile && <ProfileDisplay profile={profile} />}
        </Section>
      </Stack>
      <Suspense>
        <AddProfileDialog onClose={handleAddClose} />
      </Suspense>
    </CommonLayout>
  );
}
