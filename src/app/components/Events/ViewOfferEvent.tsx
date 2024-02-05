import Box from "@mui/material/Box";
import { Event } from "@/nostr-tools/event";
import { OfferView } from "@/app/components/OfferView";
import { parseEventTags } from "../../utils/parseEvent";
import { BadgesList, RecordItem } from "@/app/components/BadgesList";
import { getBadgeByAddressPointer } from "../../utils/parseEvent";

export const ViewOfferEvent = async (props: {
  e: Event;
  applyURL: string | undefined;
}) => {
  const { e, applyURL } = props;
  let title = "";
  let summary = "";
  let content = "";
  let offerImage = "";

  const badgeTags: string[][] = [];
  const promises: Promise<any>[] = [];
  const badges: Record<string, RecordItem> = {};

  e.tags.forEach((tag) => {
    if (tag.length > 1) {
      const value = tag[1];
      switch (tag[0]) {
        case "title":
          title = value;
          break;
        case "summary":
          summary = value;
          break;
        case "content":
          content = value;
          break;
        case "image":
          offerImage = value;
        case "a":
          badgeTags.push(tag);
          break;
      }
    }
  });

  badgeTags.forEach((tag) => {
    if (tag.length > 1) {
      promises.push(
        getBadgeByAddressPointer(tag[1])
          .then((badgeEvent) => {
            const recordTags = parseEventTags(badgeEvent);

            const name = "name" in recordTags ? recordTags["name"][0] : "";
            const image = "image" in recordTags ? recordTags["image"][0] : "";
            const thumb = "thumb" in recordTags ? recordTags["thumb"][0] : "";

            badges[tag[1]] = {
              name: name,
              image: image,
              thumbnail: thumb,
              // thumbnail: recordTags["thumb"][0],
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
    <Box p={2.5}>
      <OfferView
        offerName={title}
        offerDescription={summary}
        offerImage={offerImage}
      />
      <BadgesList records={badges} />
    </Box>
  );
};
