"use client";

import { useState } from "react";

import * as nip19 from "@/nostr-tools/nip19";
import CardActionArea from "@mui/material/CardActionArea";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import TextField from "@mui/material/TextField";
import { ItemRowSmall } from "./ItemRowSmall";
import { Badge, getEmptyBadge } from "@/data/badgeLib";

export type OnBadgeSelectedHandler = (docId: string, badge: Badge) => void;

export function renderBadge(
  docId: string,
  badge: Badge,
  handler: OnBadgeSelectedHandler
) {
  const image = badge.thumbnail != "" ? badge.thumbnail : badge.image;
  const npub = nip19.npubEncode(badge.publickey);
  const issuerLink = `${process.env.NEXT_PUBLIC_NJUMP_HOST}${npub}`;

  return (
    <CardActionArea
      onClick={() => {
        handler(docId, badge);
      }}
    >
      <ItemRowSmall
        id={docId}
        name={badge.name}
        description={badge.description}
        image={image}
        widthOption="wide"
      />
      <Box>
        <Typography variant="body2" sx={{ display: "inline" }}>
          Issued by
        </Typography>
        <Link href={issuerLink} underline="none">
          <Typography
            variant="body2"
            fontWeight="600"
            sx={{ display: "inline" }}
          >
            {" " + badge.issuerName}
          </Typography>
        </Link>
      </Box>
    </CardActionArea>
  );
}

export const BadgeSelectWide = (props: {
  availableBadges: Record<string, Badge>;
  onSelected: OnBadgeSelectedHandler;
}) => {
  const availableBadges = props.availableBadges;
  const onSelected = props.onSelected;
  const [badge, setBadge] = useState<Record<string, Badge> | null>(null);

  const handleClick: OnBadgeSelectedHandler = (docId: string, badge: Badge) => {
    const item: Record<string, Badge> = { docId: badge };
    setBadge(item);
    if (onSelected) onSelected(docId, badge);
  };

  return (
    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
      {Object.entries(availableBadges).map(([key, item]) => (
        <div key={key}>{renderBadge(key, item, handleClick)}</div>
      ))}
    </Stack>
  );
};
