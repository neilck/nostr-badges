"use client";

import { useEffect } from "react";
import { PubkeySourceType } from "@/data/sessionLib";
import { Profile, getEmptyProfile } from "@/data/profileLib";

import styles from "./styles.module.css";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { CapIcon } from "@/app/components/items/CapIcon";

import { SignIn } from "./SignIn";

export const PubkeyDialog = (props: {
  show: boolean;
  pubkey: string;
  source: PubkeySourceType;
  onClose: (profile: Profile, pubkeySource: PubkeySourceType) => void;
}) => {
  const { show, pubkey, source, onClose } = props;

  const onSignIn = (profile: Profile, source: PubkeySourceType) => {
    onClose(profile, source);
  };

  useEffect(() => {
    if (show) {
      // @ts-ignore
      document.getElementById("pubkeydialog").showModal();
    } else {
      // @ts-ignore
      document.getElementById("pubkeydialog").close();
    }
  }, [show]);

  const onCancelClick = () => {
    const profile = getEmptyProfile();
    onClose(profile, "DIRECT");
  };

  return (
    <dialog id="pubkeydialog" className={styles.customdialog}>
      <Box id="pubkeydialogcontent" className={styles.customdialogcontent}>
        <Stack direction="column" alignItems="center" alignContent="center">
          <Stack direction="column" alignItems="center" columnGap="10px">
            <CapIcon fontSize="large" sx={{ color: "orange.main" }} />
            {/* display at sm and smaller */}

            <Typography
              variant="body1"
              fontWeight={500}
              sx={{
                color: "grey.800",
              }}
            >
              AKA Profiles
            </Typography>
          </Stack>
          <SignIn
            isVisible={show}
            pubkey={pubkey}
            source={source}
            onSignIn={onSignIn}
          />

          <Button onClick={onCancelClick} sx={{ width: "160px", pt: 3 }}>
            <Typography variant="body1" align="center" fontWeight="600">
              cancel
            </Typography>
          </Button>
        </Stack>
      </Box>
    </dialog>
  );
};
