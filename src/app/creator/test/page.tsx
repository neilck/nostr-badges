"use client";
import theme from "@/app/components/ThemeRegistry/theme";
import { useEffect, useState } from "react";
import { Box, Stack } from "@mui/material";

import { Badge, loadBadge, getEmptyBadge } from "@/data/badgeLib";
import { BadgeRowSmall } from "@/app/components/BadgeRowSmall";
import { BadgeRowSmallEdit } from "@/app/components/BadgeRowSmallEdit";
import BadgeSquare from "@/app/components/BadgeSquare";
import { BadgeView } from "@/app/components/BadgeView";
import { BadgeAwardedRow } from "@/app/components/BadgeAwardedRow";
import { Item, ItemRow } from "@/app/components/ItemRow";
import { ItemRowSmall } from "@/app/components/ItemRowSmall";

export default function Test() {
  const [badge, setBadge] = useState(getEmptyBadge());
  const [item, setItem] = useState<Item>({
    id: "",
    name: "",
    description: "",
    image: "",
    readOnly: false,
  });

  useEffect(() => {
    const load = async () => {
      const badge = await loadBadge("njcm3pXVtWsdh6CWQP0i", "badges");
      if (badge) {
        setBadge(badge);

        const noop = (id: string) => {
          return;
        };
        setItem({
          id: "1",
          name: badge.name,
          description: badge.description,
          image: badge.image,
          onClick: noop,
          onEdit: noop,
          onDelete: noop,
        });
      }
    };
    load();
  }, []);

  return (
    <Stack direction="column" width="360px">
      <Box p={2} sx={{ backgroundColor: theme.palette.yellow.light }}>
        BadgeRowSmall
        <BadgeRowSmall name={badge.name} image={badge.image} />
      </Box>
      <Box p={2} sx={{ backgroundColor: theme.palette.yellow.light }}>
        BadgeRowSmallEdit
        <BadgeRowSmallEdit
          name={badge.name}
          image={badge.image}
          onDeleteClick={() => {}}
        />
      </Box>
      <Box p={2} sx={{ backgroundColor: theme.palette.yellow.light }}>
        BadgeAwardedRow
        <BadgeAwardedRow
          name={badge.name}
          description={badge.description}
          image={badge.image}
          awarded={false}
        />
      </Box>
      <Box p={2} sx={{ backgroundColor: theme.palette.yellow.light }}>
        ItemRow
        <ItemRow {...item} />
      </Box>
      <Box p={2} sx={{ backgroundColor: theme.palette.yellow.light }}>
        ItemRowSmall
        <ItemRowSmall {...item} />
      </Box>
      <Box p={2} sx={{ backgroundColor: theme.palette.yellow.light }}>
        BadgeSquare
        <BadgeSquare badge={badge} />
      </Box>
      <Box p={2} sx={{ backgroundColor: theme.palette.yellow.light }}>
        BadgeView
        <BadgeView
          name={badge.name}
          description={badge.description}
          image={badge.image}
        />
      </Box>
    </Stack>
  );
}
