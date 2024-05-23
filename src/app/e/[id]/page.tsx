import { notFound } from "next/navigation";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { getEvent } from "@/data/serverActions";
import { Event, toNostrEvent } from "@/data/eventLib";
import { NostrEvent } from "@/data/ndk-lite";

import { StartSessionButton } from "./StartSessionButton";
import { SessionController } from "./SessionController";
import EventFrame from "./EventFrame";
import { BadgeAwardedList } from "@/app/components/BadgeAwardedList";
const BadgeDefinitionKind = 30009;
const ClassifiedListingKind = 30402;

export default async function ViewEventPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { state?: string; pubkey?: string };
}) {
  const naddr = params.id;
  const { state, pubkey } = searchParams;

  let event: Event | undefined = undefined;
  let nostrEvent: NostrEvent | undefined = undefined;
  let id: string = "";
  let type = "";

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

  if (event) {
    isBadge = event.kind == BadgeDefinitionKind;
    isGroup = isBadge && type == "GROUP";
    isOffer = event.kind == ClassifiedListingKind;
  }

  return (
    <EventFrame event={event} header="Eligibility Check">
      {isBadge && (
        <Box display="flex" flexDirection="column" sx={{ minHeight: "260px" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              flexGrow: 1,
            }}
          >
            <BadgeAwardedList />
          </Box>
          {/* This is a spacer to push the last item down */}
          <Box sx={{ padding: 2 }}>
            <StartSessionButton badgeId={id} naddr={naddr} isGroup={isGroup} />
          </Box>
        </Box>
      )}
      {!isBadge && !isOffer && (
        <Stack direction="column">
          <h1>Event</h1>
          <h2>{event && event.id}</h2>
          <p>{event && JSON.stringify(event.tags)}</p>
        </Stack>
      )}
      <SessionController
        badgeId={id}
        naddr={naddr}
        state={state}
        pubkey={pubkey}
        isGroup={isGroup}
      />
    </EventFrame>
  );
}
