"use client";

import theme from "@/app/components/ThemeRegistry/theme";
import { useEffect, useState } from "react";
import { useAccountContext } from "@/context/AccountContext";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

import { CommonLayout } from "../components/ComonLayout";
import Profile from "../components/Profile";
import { SaveButtonEx } from "../components/items/SaveButtonEx";

export default function ProfilePage() {
  const accountContext = useAccountContext();
  const profile = accountContext.state.currentProfile;
  const loading = accountContext.state.loading;

  return (
    <CommonLayout creatorMode={false}>
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
        <Box display="flex" flexDirection="column">
          <Profile />
          <Button>Manage Accounts</Button>
        </Box>
      )}
    </CommonLayout>
  );
}
