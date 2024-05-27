import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

import { parseEventTags } from "@/app/utils/parseEvent";
import { SessionState } from "@/context/SessionHelper";
import { BadgeAwardedRow } from "@/app/components/BadgeAwardedRow";
import { BadgeRowSmall } from "@/app/components/BadgeRowSmall";
import { CardTitle } from "@/app/components/items/CardHeadings";
import { NostrEvent } from "@/data/ndk-lite";
import { Badge } from "@/data/badgeLib";
import { ContextSwitch } from "./ContextSwitch";

export const Accept = (props: {
  id: string;
  type: string;
  pubkey: string;
  nostrEvent: NostrEvent;
  badgeItems: {
    badge: Badge;
    awardData?: { [key: string]: string } | undefined;
  }[];
  sessionState: SessionState;
}) => {
  const { id, type, pubkey, nostrEvent, badgeItems, sessionState } = props;
  const recordTags = parseEventTags(nostrEvent);

  let name = "";
  let description = "";
  let image = "";
  let thumb = "";

  if (recordTags["name"]) name = recordTags["name"][0];
  if (recordTags["description"]) description = recordTags["description"][0];
  if (recordTags["image"]) image = recordTags["image"][0];
  if (recordTags["thumb"]) thumb = recordTags["thumb"][0];

  const getHeader = (type: string) => {
    switch (type) {
      case "BADGE":
        return "Badge issued!";
      case "GROUP":
        return "Membership approved!";
      default:
        return "Approved!";
    }
  };

  const getInstructions = (type: string, useRecommended: boolean) => {
    if (!useRecommended) {
      switch (type) {
        case "BADGE":
          return "Select an account to assign this badge.";
        case "GROUP":
          return "Select an account to assign this group membership.";
        default:
          return "Select an account";
      }
    } else {
      switch (type) {
        case "BADGE":
          return "Login with this account to accept this badge.";
        case "GROUP":
          return "Login with this account to accept group membership.";
        default:
          return "Login";
      }
    }
  };

  const header = getHeader(type);
  const instructions = getInstructions(type, pubkey != "");

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Box
        width="100%"
        sx={{
          p: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          backgroundColor: "grey.200",
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
        {badgeItems.length > 0 && (
          <Stack pt={1} width="100%" spacing={1}>
            {badgeItems.map((badgeItem) => (
              <BadgeRowSmall
                key={badgeItem.badge.uid + "-" + badgeItem.badge.identifier}
                name={badgeItem.badge.name}
                image={
                  badgeItem.badge.thumbnail != ""
                    ? badgeItem.badge.thumbnail
                    : badgeItem.badge.image
                }
                data={badgeItem.awardData}
              />
            ))}
          </Stack>
        )}
      </Box>
      <ContextSwitch />
    </Box>
  );
};
