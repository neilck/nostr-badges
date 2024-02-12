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

export default function Profile() {
  const accountContext = useAccountContext();
  const pendingAward = accountContext.state.pendingAward;
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | undefined>(undefined);
  const [groups, setGroups] = useState<Group[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);

  useEffect(() => {
    const load = async () => {
      if (pendingAward) {
        const session = await getSession(
          pendingAward.sessionId,
          pendingAward.clientToken
        );
        if (session) {
          const updatedBadges = [];
          const updatedGroups = [];
          setSession(session);
          if (session.type == "GROUP" && session.itemState.isAwarded) {
            const group = await loadGroup(session.targetId);
            if (group) {
              updatedGroups.push(group);
            }
          }
          if (session.type == "BADGE" && session.itemState.isAwarded) {
            const badge = await loadBadge(session.targetId);
            if (badge) {
              updatedBadges.push(badge);
            }
          }
          if (session.requiredBadges) {
            for (let i = 0; i < session.requiredBadges.length; i++) {
              const sessionBadge = session.requiredBadges[i];
              if (sessionBadge.itemState.isAwarded) {
                const badge = await loadBadge(sessionBadge.badgeId);
                if (badge) updatedBadges.push(badge);
              }
            }
          }
          setGroups(updatedGroups);
          setBadges(updatedBadges);
        }
      }
      setIsLoading(false);
    };

    load();
  }, [pendingAward]);

  const onClick = async () => {
    return { success: true, mesg: "Added to profile" };
  };

  return (
    <CommonLayout>
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
        {groups.map((group) => {
          return (
            <BadgeAwardedRow
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
        {badges.map((badge) => {
          return (
            <BadgeAwardedRow
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
