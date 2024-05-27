"use client";

import { useState } from "react";
import { useNostrContext } from "@/context/NostrContext";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

export const NostrSnackbar = () => {
  const nostrContext = useNostrContext();

  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const publishCallback = (
    publishedCount: number,
    relayCount: number,
    error?: string | undefined
  ) => {
    setError("");
    setMessage("");

    if (error) {
      setError(error);
    } else {
      setMessage(`published to ${publishedCount}/${relayCount} relays`);
    }

    setOpen(true);
  };

  nostrContext.setPublishCallback(publishCallback);

  const handleClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setError("");
    setMessage("");
    setOpen(false);
  };

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      autoHideDuration={6000}
      onClose={handleClose}
    >
      <Alert
        onClose={handleClose}
        severity={error != "" ? "error" : "success"}
        sx={{ width: "100%" }}
      >
        {error == "" ? message : error}
      </Alert>
    </Snackbar>
  );
};
