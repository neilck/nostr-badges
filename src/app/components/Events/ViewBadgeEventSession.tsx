import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { NostrEvent } from "@nostr-dev-kit/ndk";
import { BadgeView } from "@/app/components/BadgeView";
import { parseEventTags } from "../../utils/parseEvent";
import { BadgeAwardedList } from "../BadgeAwardedList";
import { ReactNode } from "react";

export const ViewBadgeEventSession = async (props: {
  id: string;
  naddr: string;
  e: NostrEvent;
  children: ReactNode;
  isGroup?: boolean;
}) => {
  const { id, e, naddr, isGroup, children } = props;

  let name = "";
  let description = "";
  let image = "";
  let thumb = "";

  const badgeTags: string[][] = [];
  const promises: Promise<any>[] = [];

  const recordTags = parseEventTags(e);
  if (recordTags["name"]) name = recordTags["name"][0];
  if (recordTags["description"]) description = recordTags["description"][0];
  if (recordTags["image"]) image = recordTags["image"][0];
  if (recordTags["thumb"]) thumb = recordTags["thumb"][0];

  return (
    <Stack
      direction="column"
      alignItems="center"
      width="100%"
      spacing={2}
      pt={2}
      pl={2}
      pr={2}
      pb={3}
    >
      <Typography variant="h5">{isGroup ? "GROUP" : "BADGE"}</Typography>
      <BadgeView name={name} description={description} image={image} />
      {isGroup && (
        <Typography variant="body1" fontWeight={600}>
          Eligibility requirements
        </Typography>
      )}
      <BadgeAwardedList />
      {children}
    </Stack>
  );
};
