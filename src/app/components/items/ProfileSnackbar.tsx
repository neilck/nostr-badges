"use client";

import { useState, useEffect } from "react";
import { useAccountContext } from "@/context/AccountContext";

import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

export const ProfileSnackbar = () => {
  const accountContext = useAccountContext();
  const profile = accountContext.currentProfile;

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (profile.publickey != "" && !profile.hasPrivateKey) {
      setMessage(
        "To automatically push changes to relays, please use a profile with a private key saved."
      );
      setOpen(true);
    }
  }, [profile]);

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setMessage("");
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      onClose={handleClose}
    >
      <Alert
        variant="filled"
        onClose={handleClose}
        severity="error"
        sx={{ width: "100%" }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};
