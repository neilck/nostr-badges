"use client";

import theme from "@/app/components/ThemeRegistry/theme";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { AkaAppBar } from "@/app/components/AkaAppBar";
import { BadgeSquare } from "@/app/components/BadgeSquare";
import { NavMenu } from "./NavMenu";
import { Tab, TabNav } from "@/app/components/TabNav";
import { useBadgeContext } from "@/context/BadgeContext";
import React from "react";
import { getEmptyBadge } from "@/data/badgeLib";

const tabs: Tab[] = [
  { name: "DISPLAY", path: "/creator/badges/[id]/badge" },
  { name: "CONFIG", path: "/creator/badges/[id]/config" },
  { name: "DATA", path: "/creator/badges/[id]/data" },
  { name: "PUBLISH", path: "/creator/badges/[id]/publish" },
];

export const BadgeLayout = (props: {
  id: string;
  children: React.ReactNode;
}) => {
  const badgeContext = useBadgeContext();
  const badge = badgeContext.state.badge
    ? badgeContext.state.badge
    : getEmptyBadge();
  const { id, children } = props;
  const tabsFormatted: Tab[] = [];
  for (let i = 0; i < tabs.length; i++) {
    const tab = tabs[i];
    tabsFormatted.push({ name: tab.name, path: tab.path.replace("[id]", id) });
  }

  return (
    <Box
      id="frame"
      sx={{
        flexGrow: 1,
        display: "flex",
        width: "100%",
        flexDirection: "column",
      }}
    >
      <Box id="header">
        <AkaAppBar developerMode={true} />
      </Box>
      <Box
        id="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
        }}
      >
        <Box
          id="leftMenu"
          sx={{
            display: { xs: "none", sm: "block" },
            width: "240px",
            flexGrow: 0,
            flexShrink: 1,
            bgcolor: theme.palette.common.white,
          }}
        >
          <Box
            id="leftMenuTopRow"
            sx={{
              display: "flex",
              width: "100%",
              height: "100%",
              justifyContent: "space-between",
            }}
          >
            <Box id="spacer"></Box>
            <Stack id="leftMain" width="240px" direction="column">
              <BadgeSquare badge={badge} />
              <NavMenu developerMode={true} />
            </Stack>
            <Divider orientation="vertical" variant="middle" flexItem />
          </Box>
        </Box>

        <Box
          id="contentMain"
          display="flex"
          flexDirection="column"
          alignItems="center"
          sx={{
            flexGrow: 1,
            flexShrink: 1,
            bgcolor: theme.palette.background.default,
          }}
        >
          <Box
            id="content"
            display="flex"
            flexDirection="column"
            alignItems="stretch"
            width="100%"
            maxWidth={theme.breakpoints.values.md}
          >
            <Box sx={{ pt: 1.5, pl: 3 }}>
              <Typography variant="h6">Hosted Badge</Typography>
              <TabNav tabs={tabsFormatted} />
            </Box>
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
