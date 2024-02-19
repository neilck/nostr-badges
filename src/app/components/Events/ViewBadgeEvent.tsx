import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Event, toNostrEvent } from "@/data/eventLib";
import { NostrEvent } from "@/data/ndk-lite";
import { BadgeView } from "@/app/components/BadgeView";
import { parseEventTags } from "../../utils/parseEvent";
import { BadgesList, RecordItem } from "@/app/components/BadgesList";
import { getEventByAddress } from "@/data/serverActions";
import { ReactNode } from "react";

export const ViewBadgeEvent = async (props: {
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
  const badges: Record<string, RecordItem> = {};

  const recordTags = parseEventTags(e);
  if (recordTags["name"]) name = recordTags["name"][0];
  if (recordTags["description"]) description = recordTags["description"][0];
  if (recordTags["image"]) image = recordTags["image"][0];
  if (recordTags["thumb"]) thumb = recordTags["thumb"][0];

  e.tags.forEach((tag) => {
    if (tag.length > 1 && tag[0] == "a") {
      badgeTags.push(tag);
    }
  });

  badgeTags.forEach((tag) => {
    if (tag.length > 1) {
      promises.push(
        getEventByAddress(tag[1])
          .then((data) => {
            const badgeEvent = data.event;
            const nostrEvent = toNostrEvent(badgeEvent);
            const recordTags = parseEventTags(nostrEvent);

            const name = "name" in recordTags ? recordTags["name"][0] : "";
            const image = "image" in recordTags ? recordTags["image"][0] : "";
            const thumb = "thumb" in recordTags ? recordTags["thumb"][0] : "";

            badges[tag[1]] = {
              name: name,
              image: image,
              thumbnail: thumb,
            };
          })
          .catch((error) => {
            Promise.resolve();
          })
      );
    }
  });

  await Promise.all(promises);

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
      <BadgesList records={badges} />

      {children}
    </Stack>
  );
};
