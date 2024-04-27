"use client";

import theme from "@/app/components/ThemeRegistry/theme";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useAccountContext } from "@/context/AccountContext";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

import { CommonLayout } from "../components/ComonLayout";
import { AddProfileDialog } from "@/app/components/AddProfileDialog";
import { Profile, getEmptyProfile } from "@/data/profileLib";
import Link from "next/link";

export default function ProfilePage() {
  const accountContext = useAccountContext();
  const loading = accountContext.state.loading;

  const router = useRouter();
  const profile = accountContext.currentProfile;

  return (
    <CommonLayout developerMode={false}>
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
        <>
          <Link href="/profile/edit">Edit</Link>
          <Box display="flex" flexDirection="column">
            pubkey: {profile.publickey}
          </Box>
        </>
      )}
    </CommonLayout>
  );
}
