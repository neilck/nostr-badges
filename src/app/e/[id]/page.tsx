import Stack from "@mui/material/Stack";
import { Event, toNostrEvent } from "@/data/eventLib";
import { NostrEvent } from "@nostr-dev-kit/ndk";

import { ViewBadgeEvent } from "@/app/components/Events/ViewBadgeEvent";
import { SessionFrameDialog } from "@/app/components/FrameDialog/SessionFrameDialog";
import { StartSessionButton } from "./StartSessionButton";
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
    throw new Error("Failed to fetch data");
  }
  return res.json();
}

export default async function ViewEventPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { session: string };
}) {
  const naddr = params.id;

  let event: Event | undefined = undefined;
  let nostrEvent: NostrEvent | undefined = undefined;
  let applyURL: string | undefined = undefined;
  let id: string = "";
  let type = "";

  let data = await getData(params.id);
  if (data != null) {
    event = data.event as Event;
    nostrEvent = toNostrEvent(event);
    id = data.id;
    applyURL = data.applyURL;
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

  if (event) {
    isBadge = event.kind == BadgeDefinitionKind;
    isGroup = isBadge && type == "GROUP";
    isOffer = event.kind == ClassifiedListingKind;
  }

  return (
    <>
      {isBadge && (
        <ViewBadgeEvent id={id} naddr={naddr} e={nostrEvent!} isGroup={isGroup}>
          <StartSessionButton badgeId={id} naddr={naddr} isGroup={isGroup} />
        </ViewBadgeEvent>
      )}
      {/* isOffer && <ViewOfferEvent e={event!} applyURL={applyURL} /> */}
      {!isBadge && !isOffer && (
        <Stack direction="column">
          <h1>Event</h1>
          <h2>{event && event.id}</h2>
          <p>{event && JSON.stringify(event.tags)}</p>
        </Stack>
      )}
      <SessionFrameDialog />
    </>
  );
}
