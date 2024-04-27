"use client";

import React from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

import { useAccountContext } from "@/context/AccountContext";

export const Profile = () => {
  const accountContext = useAccountContext();
  const profile = accountContext.currentProfile;

  if (!profile) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          p: 2,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 2,
      }}
    >
      {/* Circular avatar */}
      <Avatar
        src={profile.image}
        sx={{
          width: 80,
          height: 80,
        }}
      ></Avatar>
      <Typography
        variant="h6"
        sx={{
          mt: 1.5,
        }}
      >
        {profile.displayName}
      </Typography>
      <Typography variant="body1">{profile.name}</Typography>
    </Box>
  );
};

export default Profile;
