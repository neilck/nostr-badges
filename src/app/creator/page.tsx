"use client";

import { useState, useEffect } from "react";
import { useAccountContext } from "@/context/AccountContext";
import theme from "@/app/components/ThemeRegistry/theme";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import MuiNextLink from "../components/items/MuiNextLink";
import { CommonLayout } from "../components/ComonLayout";
import { CardHeading, CardSubHeading } from "../components/items/CardHeadings";

export default function CreatorHome() {
  const accountContext = useAccountContext();
  const profile = accountContext.currentProfile;

  const [showRec, setShowRec] = useState(false);

  useEffect(() => {
    if (profile.publickey != "") {
      let hasPrivateKey =
        profile.hasPrivateKey == undefined ? true : profile.hasPrivateKey;
      setShowRec(!hasPrivateKey);
    } else {
      setShowRec(false);
    }
  }, [profile]);

  console.log(`/creator profile ${JSON.stringify(profile)}`);

  return (
    <CommonLayout developerMode={true}>
      <Box
        sx={{
          pt: 2,
          maxWidth: "600px",
        }}
      >
        <Box
          sx={{
            p: 2,
            width: "100%",
            minHeight: "100px",
            borderColor: theme.palette.grey[500],
            borderRadius: "10px",
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <Typography variant="h5">Welcome to AKA Profiles</Typography>
          <CardSubHeading>
            Self-issued badges for decentralized identities.
          </CardSubHeading>

          <Typography variant="body1" pt={1}>
            Documentation is available at{" "}
            <MuiNextLink href="https://www.akaprofiles.com" target="_blank">
              www.akaprofiles.com
            </MuiNextLink>
          </Typography>
          <Typography variant="body1" fontWeight={600}></Typography>
        </Box>
        {showRec && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              width: "100%",
              minHeight: "100px",
              borderColor: theme.palette.grey[500],
              borderRadius: "10px",
              backgroundColor: theme.palette.background.paper,
            }}
          >
            <Typography variant="h6" color="red">
              Recommendation
            </Typography>
            <CardSubHeading>Create a new profile</CardSubHeading>

            <Typography variant="body1" pt={1}>
              You&apos;re logged in using a Nostr signing extension without a
              saved private key.
            </Typography>
            <Typography variant="body1" pt={1}>
              To automatically publish to relays, we recommend creating a
              separate profile for issuing badges and managing groups.
            </Typography>
            <Typography variant="body1" fontWeight={500} pt={1}>
              To add a new profile slect &quot;Add profile&quot; from top right
              avatar menu.
            </Typography>
            <Typography pt={1}>
              Alternatively, you can choose to{" "}
              <Link href="/profile/edit">save the private key</Link> for this
              profile.
            </Typography>
          </Box>
        )}
      </Box>
    </CommonLayout>
  );
}
