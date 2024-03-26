"use client";

import styles from "./styles.module.css";
import { useState, useEffect } from "react";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import MuiNextLink from "../items/MuiNextLink";
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
  noIFrame: boolean;
  code: string;
  show?: boolean;
  onClose?: () => void;
}) => {
  const { title, description, image, applyURL, noIFrame, code, show, onClose } =
    props;
  const [url, setUrl] = useState("");
  const [validUrl, setValidUrl] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    setCurrentUrl(encodeURIComponent(window.location.href));
  }, []); // Run once on component mount

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
        if (code) {
          const url = `${applyURL}?code=${code}`;
          const testDomain = process.env.NEXT_PUBLIC_DEV_APPLYURL_OVERRIDE;
          if (testDomain && testDomain != "") {
            const tempUrl = new URL(url);
            const path = tempUrl.pathname + tempUrl.search;
            const overrideUrl = `${testDomain}${path}`;
            console.log(`Using override url ${overrideUrl}`);
            setUrl(overrideUrl);
          } else {
            setUrl(url);
          }
        }
      } else {
        setValidUrl(false);
      }
    }
  }, [applyURL, code]);

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
          {validUrl && !noIFrame && (
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
          {validUrl && noIFrame && (
            <Box
              width="80%"
              height="100%"
              display="flex"
              flexDirection="column"
              alignItems="center"
              pt={2}
            >
              <Typography>
                By clicking the link below, you will be directed to the
                application page to apply for this badge.
              </Typography>
              <Box pt={2}>
                <MuiNextLink href={`${url}&redirect=${currentUrl}`}>
                  <Typography variant="body1" fontWeight={600}>
                    READY
                  </Typography>
                </MuiNextLink>
              </Box>
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
