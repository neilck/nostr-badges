"use client";

import theme from "@/app/components/ThemeRegistry/theme";
import { useEffect, useState } from "react";
import { useAccountContext } from "@/context/AccountContext";

import Box from "@mui/material/Box";

import { CommonLayout } from "@/app/components/ComonLayout";

export default function UserPage() {
  const accountContext = useAccountContext();
  const profile = accountContext.state.currentProfile;
  const loading = accountContext.state.loading;

  return (
    <CommonLayout developerMode={false}>
      <Box display="flex" flexDirection="column">
        "User Home"
      </Box>
    </CommonLayout>
  );
}
