import * as React from "react";
import { notFound } from "next/navigation";
import { Metadata, ResolvingMetadata } from "next";
import { Event, toNostrEvent } from "@/data/eventLib";
import { getEvent } from "@/data/serverActions";
import { NostrEvent } from "@/data/ndk-lite";
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
  try {
    const data = await getEvent(params.id);

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
  } catch {
    return {};
  }
}

const BadgeDefinitionKind = 30009;
const ClassifiedListingKind = 30402;

const getURL = process.env.NEXT_PUBLIC_AKA_GET;

export default async function Njump({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { state?: string; pubkey?: string };
}) {
  const naddr = params.id;
  const { state, pubkey } = searchParams;
  let url = `${getURL}/e/${naddr}`;
  let addedParam = false;
  if (state && state != "") {
    url = url + `?state=${state}`;
    addedParam = true;
  }
  if (pubkey && pubkey != "") {
    if (!addedParam) url = url + `?pubkey=${pubkey}`;
    else url = url + `&pubkey=${pubkey}`;
  }

  let event: Event | undefined = undefined;
  let nostrEvent: NostrEvent | undefined = undefined;
  let id: string = "";
  let type: string = "";

  try {
    let data = await getEvent(params.id);
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
  } catch {
    return notFound();
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
            url={url}
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
