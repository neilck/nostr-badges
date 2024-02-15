import Box from "@mui/material/Box";
import { parseEventTags } from "@/app/utils/parseEvent";

import { BadgeAwardedRow } from "@/app/components/BadgeAwardedRow";
import { BadgeRowSmall } from "@/app/components/BadgeRowSmall";
import { CardTitle } from "@/app/components/items/CardHeadings";
import { NostrEvent } from "@nostr-dev-kit/ndk";
import { Badge } from "@/data/badgeLib";
import { Stack, Typography } from "@mui/material";
import { Sign } from "./Sign";
import { useState } from "react";

export const Accept = (props: {
  id: string;
  type: string;
  nostrEvent: NostrEvent;
  badges: Badge[];
}) => {
  const { id, type, nostrEvent, badges } = props;
  const recordTags = parseEventTags(nostrEvent);

  let name = "";
  let description = "";
  let image = "";
  let thumb = "";

  if (recordTags["name"]) name = recordTags["name"][0];
  if (recordTags["description"]) description = recordTags["description"][0];
  if (recordTags["image"]) image = recordTags["image"][0];
  if (recordTags["thumb"]) thumb = recordTags["thumb"][0];

  const getTitle = (type: string) => {
    switch (type) {
      case "BADGE":
        return "Badge earned!";
      case "GROUP":
        return "Membership approved!";
      default:
        return "Approved";
    }
  };

  const getInstructions = (type: string) => {
    switch (type) {
      case "BADGE":
        return "To save your badge, please sign in.";
      case "GROUP":
        return "To save your group membership, please sign in.";
      default:
        return "Approved";
    }
  };

  const title = getTitle(type);
  const instructions = getInstructions(type);

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Box>
        <CardTitle>{title}</CardTitle>
      </Box>

      <Box
        width="100%"
        sx={{
          mt: 2,
          p: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          border: 1,
          borderColor: "grey.400",
        }}
      >
        <Box width="auto" pt={1} pb={1}>
          <BadgeAwardedRow
            name={name}
            description={description}
            image={thumb != "" ? thumb : image}
            awarded={true}
          />
        </Box>
        {badges.length > 0 && (
          <Stack pt={1} width="100%" spacing={1}>
            {badges.map((badge) => (
              <BadgeRowSmall
                name={badge.name}
                image={badge.thumbnail != "" ? badge.thumbnail : badge.image}
              />
            ))}
          </Stack>
        )}
      </Box>

      <Box pt={2} pb={3} width="100%">
        <Sign instructions={instructions} />
      </Box>
    </Box>
  );
};
