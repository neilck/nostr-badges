"use client";

import styles from "./styles.module.css";
import { useState, useEffect } from "react";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { CardHeading } from "../items/CardHeadings";
import { ItemRow } from "../ItemRow";

const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

export const FrameDialog = (props: {
  identifier: string;
  title: string;
  description: string;
  image: string;
  applyURL: string;
  sessionId: string;
  awardtoken: string;
  show?: boolean;
  onClose?: () => void;
}) => {
  const {
    identifier,
    title,
    description,
    image,
    applyURL,
    sessionId,
    awardtoken,
    show,
    onClose,
  } = props;
  const [url, setUrl] = useState("");
  const [validUrl, setValidUrl] = useState(false);

  useEffect(() => {
    if (show) {
      // @ts-ignore
      document.getElementById("framedialog").showModal();
    } else {
      // @ts-ignore
      document.getElementById("framedialog").close();
    }
  }, [show]);

  useEffect(() => {
    {
      if (isValidUrl(applyURL)) {
        setValidUrl(true);
        if (awardtoken) {
          const encodedIdentifier = encodeURIComponent(identifier);
          const url = `${applyURL}?session=${sessionId}&identifier=${encodedIdentifier}&awardtoken=${awardtoken}`;
          setUrl(url);
        }
      } else {
        setValidUrl(false);
      }
    }
  }, [applyURL, awardtoken, sessionId, identifier]);

  const onCloseClick = () => {
    if (onClose) {
      onClose();
    }
  };

  return (
    <dialog
      id="framedialog"
      className={styles.customdialog}
      onClose={onCloseClick}
    >
      <Box id="framedialogcontent" className={styles.customdialogcontent}>
        <Stack
          direction="column"
          alignItems="center"
          width="100%"
          height="100%"
        >
          <CardHeading>{`Applying for \"${title}\" badge`}</CardHeading>
          <Box width="100%" pt={1} pb={2}>
            <ItemRow
              id="itemRow"
              key="itemRow"
              name={title}
              description={description}
              image={image}
              readOnly={true}
            />
          </Box>
          {validUrl && (
            <Box width="100%" height="100%">
              <iframe
                id="contentFrame"
                src={url}
                title={title}
                style={{
                  height: "100%",
                  width: "100%",
                  minHeight: "240px",
                  border: 0,
                }}
              ></iframe>
            </Box>
          )}
          {!validUrl && <Box>Invalid Badge Apply URL: {applyURL}</Box>}

          <Button onClick={onCloseClick} sx={{ width: "160px", pt: 2 }}>
            <Typography variant="subtitle2" align="center" fontWeight="600">
              CLOSE
            </Typography>
          </Button>
        </Stack>
      </Box>
    </dialog>
  );
};
