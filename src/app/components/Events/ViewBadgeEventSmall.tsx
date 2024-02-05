import Stack from "@mui/material/Stack";

import { BadgeViewSmall } from "@/app/components/BadgeViewSmall";
import { NostrEvent } from "@nostr-dev-kit/ndk";
import { parseEventTags } from "../../utils/parseEvent";

export const ViewBadgeEventSmall = (props: { id: string; e: NostrEvent }) => {
  const { id, e } = props;

  let name = "";
  let description = "";
  let image = "";
  let thumb = "";

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
      <BadgeViewSmall
        name={name}
        description={description}
        image={thumb != "" ? thumb : image}
      />
    </Stack>
  );
};
