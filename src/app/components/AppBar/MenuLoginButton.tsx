"use client";

import { useState, useEffect } from "react";

import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { SxProps, Theme } from "@mui/material";
import { auth } from "@/firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import theme from "@/app/components/ThemeRegistry/theme";
import MenuLogout from "./MenuLogout";

export const MenuLoginButton = (props: {
  children: string;
  sx?: SxProps<Theme> | undefined;
}) => {
  const { children, sx } = props;
  const [loading, setLoading] = useState(true);
  const [loggedIn, setLoggedIn] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loginClicked = () => {
    setDialogOpen(true);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user == null || user.isAnonymous) {
        setLoggedIn(false);
        setLoading(false);
      } else {
        setLoggedIn(true);
        setLoading(false);
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {!loading && !loggedIn && (
        <Button
          variant="contained"
          onClick={loginClicked}
          sx={{
            color: theme.palette.common.white,
            backgroundColor: theme.palette.primary.light,
            ...sx,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: "500" }}>
            {children}
          </Typography>
        </Button>
      )}
      {!loading && loggedIn && (
        <>
          <MenuLogout />
        </>
      )}
    </>
  );
};
