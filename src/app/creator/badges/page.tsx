"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import theme from "@/app/components/ThemeRegistry/theme";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { DocLink } from "@/app/components/items/DocLink";
import { CardHeading } from "@/app/components/items/CardHeadings";
import { CommonLayout } from "@/app/components/ComonLayout";
import { ItemRow } from "@/app/components/ItemRow";
import { BadgeDialog } from "@/app/components/BadgeDialog";

import {
  Badge,
  addBadge,
  getEmptyBadge,
  loadBadges as fsLoadBadges,
  deleteBadge,
} from "@/data/badgeLib";

import { AddButtonEx } from "@/app/components/items/AddButtonEx";
import { useAccountContext } from "@/context/AccountContext";

export default function Badges() {
  const router = useRouter();

  const { account } = useAccountContext().state;
  const profile = useAccountContext().currentProfile;

  const [badges, setBadges] = useState<Record<string, Badge>>({});
  const [selectedBadge, setSelectedBadge] = useState<Badge | undefined>(
    undefined
  );

  useEffect(() => {
    if (account?.uid) loadBadges(account.uid, profile.publickey);
  }, [account, profile]);

  async function loadBadges(uid: string, publickey: string) {
    const badges = await fsLoadBadges(uid, publickey);
    setBadges(badges);
  }

  async function displayBadge(badge: Badge, id: string) {
    setSelectedBadge(badge);
    setOpen(true);
  }

  const onAddHandler = async (name: string) => {
    const uid = account?.uid;
    if (!uid) return;

    const newBadge = getEmptyBadge();
    newBadge.name = name;
    newBadge.uid = uid;
    newBadge.publickey = profile.publickey;
    const addResult = await addBadge(newBadge);
    if (addResult.success) {
      loadBadges(account.uid, profile.publickey);
    }
  };

  const onEditClicked = (docId: string) => {
    router.push(`/creator/badges/${docId}/badge`);
  };

  const onDeleteClicked = async (docId: string) => {
    await deleteBadge(docId);
    if (account?.uid) loadBadges(account.uid, profile.publickey);
  };

  // Dialog
  const [open, setOpen] = useState(false);

  const onClose = () => {
    setOpen(false);
  };

  return (
    <CommonLayout developerMode={true}>
      <Box width="auto">
        <Stack direction="column" pt={1} pl={3} maxWidth={600}>
          <CardHeading>Hosted Badges</CardHeading>
          <Typography variant="body2">
            Users can apply for auto badges using AKA Profiles.
          </Typography>
          <DocLink doc="intro">learn more...</DocLink>
        </Stack>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            rowGap: 1.5,
            p: 2,
            maxWidth: "400px",
            backgroundColor: theme.palette.background.default,
            height: "auto",
          }}
        >
          <AddButtonEx placeholder="new badge name" onAdd={onAddHandler} />

          {Object.keys(badges).map((key) => {
            const badge = badges[key];
            let imageUrl = badge.thumbnail;
            if (badge.thumbnail == "") imageUrl = badge.image;
            if (imageUrl == "") imageUrl = "/default/badge.png";
            return (
              <Box key={key} pt={0.5}>
                <ItemRow
                  id={key}
                  name={badge.name}
                  description={
                    badge.description != ""
                      ? badge.description
                      : "<description not set>"
                  }
                  image={imageUrl}
                  onClick={() => {
                    displayBadge(badge, key);
                  }}
                  onEdit={onEditClicked}
                  onDelete={onDeleteClicked}
                ></ItemRow>
              </Box>
            );
          })}
        </Box>
        {selectedBadge && (
          <BadgeDialog open={open} onClose={onClose} badge={selectedBadge} />
        )}
      </Box>
    </CommonLayout>
  );
}
