"use client";

import theme from "@/app/components/ThemeRegistry/theme";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MuiNextLink from "../components/items/MuiNextLink";
import { CommonLayout } from "../components/ComonLayout";
import { CardHeading, CardSubHeading } from "../components/items/CardHeadings";

export default function CreatorHome() {
  return (
    <CommonLayout>
      <Box
        sx={{
          pt: 2,
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
      </Box>
    </CommonLayout>
  );
}
