"use client";

import theme from "@/app/components/ThemeRegistry/theme";
import React, { useState, useEffect } from "react";
import { useGroupContext } from "@/context/GroupContext";
import { Group } from "@/data/groupLib";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { AkaAppBar } from "../../../components/AkaAppBar";
import { GroupViewSmall } from "../../../components/GroupViewSmall";
import { NavMenu } from "../../../components/NavMenu";
import { Tab, TabNav } from "../../../components/TabNav";

const tabsTemplate: Tab[] = [
  { name: "BADGE", path: "/creator/groups/[ID]/edit" },
  { name: "ELIGIBILITY", path: "/creator/groups/[ID]/eligibility" },
  { name: "PUBLISH", path: "/creator/groups/[ID]/publish" },
];

export const GroupLayout = (props: {
  id: string;
  children: React.ReactNode;
}) => {
  const { id, children } = props;
  const [group, setGroup] = useState<Group | null>(null);
  const groupContext = useGroupContext();
  const name = group?.name ? group.name : "";
  const image = group?.image ? group.image : "";
  const event = group?.event ? group.event : "";

  useEffect(() => {
    if (id != "") {
      loadGroup();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadGroup = async () => {
    const group = await groupContext.loadGroup(id);
    setGroup(group);
  };

  const tabs = [] as Tab[];
  tabsTemplate.forEach((tab) => {
    tabs.push({
      name: tab.name,
      path: tab.path.replace("[ID]", id),
    });
  });

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
        <AkaAppBar creatorMode={true} />
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
            <Stack id="leftMain" direction="column">
              {name && image && (
                <GroupViewSmall name={name} image={image} event={event} />
              )}
              <NavMenu creatorMode={true} />
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
            alignItems="strech"
            width="100%"
            maxWidth={theme.breakpoints.values.md}
          >
            <Box sx={{ pt: 1.5, pl: 3 }}>
              <Typography variant="h6">{name && `${name} Group`}</Typography>
              <TabNav tabs={tabs} />
            </Box>
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
