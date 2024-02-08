import * as React from "react";
import { Metadata, ResolvingMetadata } from "next";
import { Event, toNostrEvent } from "@/data/eventLib";
import { NostrEvent } from "@nostr-dev-kit/ndk";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ViewBadgeEvent } from "@/app/components/Events/ViewBadgeEvent";
import { GetBadgeButton } from "@/app/components/Events/GetBadgeButton";
import { parseEventTags } from "../../utils/parseEvent";

type Props = {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
};
export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const id = params.id;

  // fetch data
  const data = await getData(params.id);
  const event = data.event as Event;
  if (event == null) {
    return {};
  }

  const nostrEvent = toNostrEvent(event);
  let name,
    description,
    image,
    thumb = "";

  const recordTags = parseEventTags(nostrEvent);
  if (recordTags["name"]) name = recordTags["name"][0];
  if (recordTags["description"]) description = recordTags["description"][0];
  if (recordTags["image"]) image = recordTags["image"][0];
  if (recordTags["thumb"]) thumb = recordTags["thumb"][0];

  let metadata: Metadata = {
    metadataBase: new URL("https://akaprofiles.com"),

    title: name,
    description: description,
    applicationName: "AKA Profiles",
    // authors:
    keywords: ["nostr", "badge"],
    openGraph: {
      title: name,
      description: description,
      images: image,
    },
    twitter: {
      title: name,
      card: "summary",
      site: "@nostrprotocol",
      images: image,
      description: description,
    },
  };
  return metadata;
}

const BadgeDefinitionKind = 30009;
const ClassifiedListingKind = 30402;

// returns { id: string; event: object; applyURL?: string }
async function getData(id: string) {
  const authorization = `Bearer ${process.env.AKA_API_TOKEN}`;

  const url = `https://getevent-k5ca2jsy4q-uc.a.run.app/aka-profiles/us-central1/getEvent?id=${id}`;
  const res = await fetch(url, {
    headers: { authorization },
    next: { tags: [id] },
    cache: "no-store",
  });

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    return null;
  }
  return res.json();
}

export default async function Njump({ params }: { params: { id: string } }) {
  const naddr = params.id;

  let event: Event | undefined = undefined;
  let nostrEvent: NostrEvent | undefined = undefined;
  let id: string = "";
  let type: string = "";
  let data = await getData(params.id);
  if (data != null) {
    event = data.event as Event;
    nostrEvent = toNostrEvent(event);
    id = data.id;
    for (let i = 0; i < event.tags.length; i++) {
      const tag = event.tags[i];
      if (tag.name == "type" && tag.values.length > 0) {
        type = tag.values[0];
      }
    }
  }

  let isBadge = false;
  let isGroup = false;
  let isOffer = false;

  if (nostrEvent != undefined) {
    isBadge = nostrEvent.kind == BadgeDefinitionKind;
    isGroup = isBadge && type == "GROUP";
    isOffer = nostrEvent.kind == ClassifiedListingKind;
  }

  return (
    <>
      {isBadge && (
        <ViewBadgeEvent id={id} naddr={naddr} e={nostrEvent!} isGroup={isGroup}>
          <GetBadgeButton
            buttonLabel={isGroup ? "Apply" : "Get Badge"}
            url={`/e/${naddr}`}
          />
        </ViewBadgeEvent>
      )}

      {!isBadge && !isOffer && (
        <Box p={6}>
          <Typography variant="h6">event not found</Typography>
          <Typography variant="body2" pt={2}>
            only returns events registered with akaprofiles.com
          </Typography>
        </Box>
      )}
    </>
  );
}
