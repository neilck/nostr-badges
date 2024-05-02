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
import { ConfirmationDialog } from "./ConfirmationDialog";
import { Profile, deleteProfile } from "@/data/profileLib";
import { Section } from "./Section";
import { ProfileRowSmall } from "@/app/components/ProfileRowSmall";
import { ProfileDisplay } from "../ProfileDisplay";
import { ProfileEdit } from "./ProfileEdit";

export default function EditProfilePage() {
  const accountContext = useAccountContext();
  let numProfiles = 0;
  if (accountContext.state.profiles) {
    numProfiles = Object.keys(accountContext.state.profiles).length;
  }

  const loading = accountContext.state.loading;

  const router = useRouter();
  let profile = accountContext.currentProfile;

  const handleProfileSave = (profile: Profile) => {};

  const handleAddClose = async (
    data: { username?: string; privatekey?: string } | null
  ) => {
    if (data) {
      const { username, privatekey } = data;
      const functions = getFunctions();
      const createProfile = httpsCallable(functions, "createProfile");
      if (username) {
        const result = await createProfile({ username: username });
        const data: any = result.data;
        const profile: Profile = data;
        accountContext.setCurrentProfile(profile);
      } else {
        if (privatekey) {
          const result = await createProfile({ privatekey: privatekey });
          const data: any = result.data;
          const profile: Profile = data;
          await accountContext.updateProfileFromRelays(profile);
          accountContext.reloadProfiles(profile.publickey);
        }
      }
    }

    router.push("/profile/edit");
  };

  const handleOnEdit = (id: string) => {
    switch (id) {
      case "profile":
        router.push("/profile");
        break;
    }
  };

  // Delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const handleOpenDialog = () => {
    setDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDeleteDialogOpen(false);
  };

  const handleDeleteProfile = async () => {
    const result = await deleteProfile(profile.publickey);
    handleCloseDialog(); // Close dialog after deletion
    accountContext.reloadProfiles();
  };

  return (
    <CommonLayout
      developerMode={false}
      bgColor={theme.palette.background.paper}
    >
      <Stack width="400px" minWidth="300px" pt={4} spacing={2}>
        <Section id="profile" onEdit={handleOnEdit}>
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
          {!loading && (
            <ProfileEdit
              profile={profile}
              onSave={handleProfileSave}
              onDelete={handleOpenDialog}
            />
          )}
        </Section>
        {numProfiles > 1 && (
          <Box pt={4} display="flex" justifyContent="end" width="100%">
            <ConfirmationDialog
              title="Delete Profile"
              prompt="Delete this profile and related badges?"
              buttonLabel="Delete"
              open={deleteDialogOpen}
              onClose={handleCloseDialog}
              onConfirm={handleDeleteProfile}
            >
              <ProfileRowSmall
                id={profile.publickey}
                name={profile.name}
                displayName={profile.displayName}
                image={profile.image}
              />
            </ConfirmationDialog>
          </Box>
        )}
      </Stack>

      <Suspense>
        <AddProfileDialog onClose={handleAddClose} />
      </Suspense>
    </CommonLayout>
  );
}
