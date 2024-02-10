"use client";

import { useEffect, useState } from "react";
import CardActionArea from "@mui/material/CardActionArea";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { CircularProgress } from "@mui/material";
import TextField from "@mui/material/TextField";
import { BadgeAwardedRow } from "./BadgeAwardedRow";
import { ItemRowSmall } from "./ItemRowSmall";
import { Badge, getEmptyBadge } from "@/data/badgeLib";

import { useSessionContext } from "@/context/SessionContext";

type Item = {
  docId: string;
  badge: Badge;
  isAwarded: boolean;
};

export type OnBadgeSelectedHandler = (docId: string, badge: Badge) => void;

export function renderBadge(item: Item, handler: OnBadgeSelectedHandler) {
  const { docId, badge, isAwarded } = item;
  const image = badge.thumbnail != "" ? badge.thumbnail : badge.image;

  return (
    <CardActionArea
      onClick={() => {
        handler(docId, badge);
      }}
    >
      <BadgeAwardedRow
        name={badge.name}
        description={badge.description}
        image={image}
        awarded={isAwarded}
      />
    </CardActionArea>
  );
}

export const BadgeAwardedList = (props: {}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<Item[]>([]);
  const sessionContext = useSessionContext();
  const session = sessionContext.state.session;

  useEffect(() => {
    const load = async () => {
      if (session?.requiredBadges) {
        const newItems = [] as Item[];
        for (let i = 0; i < session.requiredBadges.length; i++) {
          const sessionBadge = session.requiredBadges[i];
          const badge = await sessionContext.loadBadge(sessionBadge.badgeId);
          if (badge) {
            newItems.push({
              docId: sessionBadge.badgeId,
              badge: badge,
              isAwarded: sessionBadge.itemState.isAwarded,
            });
          }
        }
        setItems(newItems);
        setIsLoading(false);
      }
    };

    load();
  }, [session]);

  const handleClick: OnBadgeSelectedHandler = (docId: string, badge: Badge) => {
    sessionContext.setCurrentBadge(docId);
  };

  return (
    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
      {isLoading && <CircularProgress />}
      {!isLoading &&
        items.map((item) => (
          <div key={item.docId}>{renderBadge(item, handleClick)}</div>
        ))}
    </Stack>
  );
};
