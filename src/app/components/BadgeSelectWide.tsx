"use client";

import { useState } from "react";
import CardActionArea from "@mui/material/CardActionArea";
import Box from "@mui/material/Box";
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
