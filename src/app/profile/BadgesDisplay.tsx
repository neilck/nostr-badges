import { useState, useEffect } from "react";
import theme from "../components/ThemeRegistry/theme";

import { Badge, getEmptyBadge, loadBadge } from "@/data/badgeLib";
import { BadgeAward, loadBadgeAwardsByPubkey } from "@/data/badgeAwardLib";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { ItemRowSmall } from "../components/ItemRowSmall";
import { BadgeAwardItem } from "./BadgeAwardItem";
function objectToKeyValueArray(obj: object) {
  return Object.entries(obj).map(([key, value]) => `${key}: ${value}`);
}

export const BadgesDisplay = ({
  uid,
  pubkey,
}: {
  uid: string;
  pubkey: string;
}) => {
  const [awards, setAwards] = useState<Record<string, BadgeAward>>({});
  const [badges, setBadges] = useState<Record<string, Badge>>({});

  useEffect(() => {
    const loadBadgeAwards = async (uid: string, pubkey: string) => {
      const awards = await loadBadgeAwardsByPubkey(pubkey, "badgeawards");
      const badgeIds = Object.entries(awards).map(
        ([id, badgeAward]) => badgeAward.badge
      );
      const promises: Promise<Badge | undefined>[] = [];
      const badges: Record<string, Badge> = {};

      for (let i = 0; i < badgeIds.length; i++) {
        const badgeId = badgeIds[i];
        const promise = loadBadge(badgeId);
        promise.then((result) => {
          if (result) {
            badges[badgeId] = result as Badge;
          }
        });
        promises.push(promise);
      }

      await Promise.all(promises);
      setAwards(awards);
      setBadges(badges);
    };

    loadBadgeAwards(uid, pubkey);
  }, [uid, pubkey]);

  return (
    <Stack direction="row" flexWrap="wrap" rowGap={2} columnGap={2}>
      {Object.entries(awards).map(([id, badgeAward]) => {
        const badge = badges[badgeAward.badge];
        const created = badgeAward.created;

        // @ts-ignore
        const formatted = created.toDate().toLocaleString();
        const lines = objectToKeyValueArray(badgeAward);
        return (
          <Card>
            <BadgeAwardItem id={id} badgeAward={badgeAward} badge={badge} />
          </Card>
        );
      })}
    </Stack>
  );
};
