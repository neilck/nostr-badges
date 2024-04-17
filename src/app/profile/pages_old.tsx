"use client";

import { useAccountContext } from "@/context/AccountContext";
import { Session } from "@/data/sessionLib";
import { getSession } from "@/data/serverActions";
import { Badge, loadBadge, getEmptyBadge } from "@/data/badgeLib";
import { Group, loadGroup, getEmptyGroup } from "@/data/groupLib";

import theme from "@/app/components/ThemeRegistry/theme";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { BadgeView } from "../components/BadgeView";
import { BadgeAwardedRow } from "../components/BadgeAwardedRow";
import { CommonLayout } from "../components/ComonLayout";
import { useEffect, useState } from "react";
import { SaveButtonEx } from "../components/items/SaveButtonEx";

export default function ProfileOld() {
  const accountContext = useAccountContext();

  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | undefined>(undefined);
  const [groups, setGroups] = useState<Group[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);

  const onClick = async () => {
    return { success: true, mesg: "Added to profile" };
  };

  return (
    <CommonLayout creatorMode={false}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "left",
          rowGap: 2,
          p: 2,
          maxWidth: "360px",
          backgroundColor: theme.palette.grey[100],
        }}
      >
        <Typography variant="h6">Add to Profile</Typography>
        {isLoading && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <CircularProgress />
          </Box>
        )}
        {groups.length > 0 && (
          <Typography variant="body1" fontWeight={600}>
            New Group Memberships
          </Typography>
        )}
        {groups.map((group, index) => {
          return (
            <BadgeAwardedRow
              key={`${group.name}-${index.toString()}`}
              name={group.name}
              description={group.description}
              image={group.image}
              awarded={true}
            />
          );
        })}
        {badges.length > 0 && (
          <Typography variant="body1" fontWeight={600}>
            New Badges
          </Typography>
        )}
        {badges.map((badge, index) => {
          return (
            <BadgeAwardedRow
              key={`${badge.name}-${index.toString()}`}
              name={badge.name}
              description={badge.description}
              image={badge.image}
              awarded={true}
            />
          );
        })}
        <SaveButtonEx buttonLabel="Accept" onClick={onClick} />
      </Box>
    </CommonLayout>
  );
}
