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
      bgColor={theme.palette.background.paper}
    >
      <Stack width="400px" minWidth="300px" pt={4} spacing={2}>
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
          <Section id="profile" onEdit={handleEdit}>
            <ProfileDisplay profile={profile} extra={true} />
          </Section>
        )}
      </Stack>
    </CommonLayout>
  );
}
