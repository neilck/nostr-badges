"use client";

import theme from "@/app/components/ThemeRegistry/theme";
import { useRouter } from "next/navigation";
import { useAccountContext } from "@/context/AccountContext";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";

import { CommonLayout } from "../components/ComonLayout";
import { Section } from "./edit/Section";

import Link from "next/link";
import { ProfileDisplay } from "./ProfileDisplay";
import { BadgesDisplay } from "./BadgesDisplay";
import { Typography } from "@mui/material";

export default function ProfilePage() {
  const accountContext = useAccountContext();
  const loading = accountContext.state.loading;

  const router = useRouter();
  const profile = accountContext.currentProfile;

  const handleEdit = (id: string) => {
    router.push("/profile/edit");
  };
  return (
    <CommonLayout
      developerMode={false}
      bgColor={theme.palette.background.default}
    >
      {loading && (
        <Stack maxWidth="800px" minWidth="300px" pt={4} spacing={2}>
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
        </Stack>
      )}
      {!loading && (
        <>
          <Box sx={{ width: "100%", bgcolor: "white" }}>
            <Section id="profile" border={false} onEdit={handleEdit}>
              <ProfileDisplay profile={profile} extra={true} />
            </Section>
          </Box>
          <Stack
            width="100%"
            maxWidth="800px"
            minWidth="300px"
            pt={1}
            spacing={2}
          >
            <Box p={1}>
              <Typography variant="h6" pb={1}>
                Badges
              </Typography>

              <BadgesDisplay uid={profile.uid} pubkey={profile.publickey} />
            </Box>
          </Stack>
        </>
      )}
    </CommonLayout>
  );
}
