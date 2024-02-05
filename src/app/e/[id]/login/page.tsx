import Box from "@mui/material/Box";

import { Event, toNostrEvent } from "@/data/eventLib";
import { NostrEvent } from "@nostr-dev-kit/ndk";
import * as nip19 from "@/nostr-tools/nip19";
import { Login } from "@/app/components/Login/Login";
import { ViewBadgeEventSmall } from "@/app/components/Events/ViewBadgeEventSmall";

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

export default async function LoginPage({
  params,
}: {
  params: { id: string };
}) {
  const decoded = nip19.decode(params.id);
  let addressPointer: nip19.AddressPointer | undefined = undefined;
  if (decoded.type == "naddr") {
    addressPointer = decoded.data as nip19.AddressPointer;
  }
  let event: Event | undefined = undefined;
  let nostrEvent: NostrEvent | undefined = undefined;
  let id: string = "";
  let data = await getData(params.id);
  if (data != null) {
    event = data.event as Event;
    nostrEvent = toNostrEvent(event);
    id = data.id;
  }

  return (
    <Box minHeight={320} maxWidth={360}>
      <Login
        title="Badge earned!"
        instructions="To save your badge, please sign in."
      >
        <ViewBadgeEventSmall id={id} e={nostrEvent!} />
      </Login>
    </Box>
  );
}
