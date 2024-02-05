"use client";

import theme from "@/app/components/ThemeRegistry/theme";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

import { Group } from "@/data/groupLib";
import { GroupOffer, loadGroupOffers } from "@/data/groupOfferLib";
import { Badge, loadBadge } from "@/data/badgeLib";

import { CardHeading } from "./items/CardHeadings";
import { ItemRowSmall } from "./ItemRowSmall";
import { OffersList } from "./OffersList";
import { BadgesList } from "./BadgesList";

export const GroupView = (props: { groupId: string; group: Group }) => {
  const { group } = props;
  const groupId = props.groupId;
  const uid = group.uid;
  const [offers, setOffers] = useState<Record<string, GroupOffer>>({});
  const [badges, setBadges] = useState<Record<string, Badge>>({});
  const { image, name, description } = group;

  const router = useRouter();

  useEffect(() => {
    const loadOffers = async (uid: string, groupId: string, limit?: number) => {
      const offers = await loadGroupOffers(uid, groupId, limit);
      setOffers(offers);
    };

    const loadBadges = async (uid: string) => {
      if (!uid) return;

      const requiredBadges: Record<string, Badge> = {};

      for (let i = 0; i < group.badges.length; i++) {
        const id = group.badges[i];
        const badge = await loadBadge(id);
        if (badge) requiredBadges[id] = badge;
      }

      setBadges(requiredBadges);
    };

    loadOffers(uid, groupId, 3);
    loadBadges(uid);
  }, [uid, groupId, group]);

  const onOfferClicked = (docId: string) => {
    router.push(`/creator/groups/${groupId}/offers?id=${docId}`);
  };

  return (
    <Box
      sx={{
        id: "parentCard",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        mt: 0,
        pt: 0,
        pb: 0,
        pl: 2,
        pr: 2,
        [theme.breakpoints.down("sm")]: { pt: 1 },
        maxWidth: theme.breakpoints.values.sm,
      }}
    >
      <ItemRowSmall
        id="memberBadge"
        key="memberBadge"
        name={name}
        description={description}
        image={image}
        sx={{ width: "350px" }}
      />

      <Stack
        direction="column"
        justifyContent="center"
        alignItems="stretch"
        width="100%"
        pt={2}
        sx={{
          [theme.breakpoints.down("sm")]: { pt: 1 },
          maxWidth: theme.breakpoints.values.sm,
        }}
      >
        <CardHeading sx={{ pb: 0.5 }}>Required badges to join</CardHeading>
        <BadgesList records={badges} />
        <CardHeading sx={{ pt: 2 }}>Latest exclusives</CardHeading>
        <OffersList offers={offers} onClick={onOfferClicked} />
      </Stack>
    </Box>
  );
};
