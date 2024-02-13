import { notFound } from "next/navigation";
import Stack from "@mui/material/Stack";
import { getEvent } from "@/data/serverActions";
import { Event, toNostrEvent } from "@/data/eventLib";
import { NostrEvent } from "@nostr-dev-kit/ndk";

import { ViewBadgeEventSession } from "@/app/components/Events/ViewBadgeEventSession";
import { SessionFrameDialog } from "@/app/components/FrameDialog/SessionFrameDialog";
import { StartSessionButton } from "./StartSessionButton";
import { SessionDisplay } from "./SessionDisplay";
import { SessionController } from "./SessionController";
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
    <>
      {isBadge && (
        <ViewBadgeEventSession
          id={id}
          naddr={naddr}
          e={nostrEvent!}
          isGroup={isGroup}
        >
          <StartSessionButton badgeId={id} naddr={naddr} isGroup={isGroup} />
        </ViewBadgeEventSession>
      )}
      {!isBadge && !isOffer && (
        <Stack direction="column">
          <h1>Event</h1>
          <h2>{event && event.id}</h2>
          <p>{event && JSON.stringify(event.tags)}</p>
        </Stack>
      )}
      {/* <SessionDisplay /> */}
      <SessionController
        badgeId={id}
        naddr={naddr}
        state={state}
        pubkey={pubkey}
        isGroup={isGroup}
      />
      <SessionFrameDialog />
    </>
  );
}
