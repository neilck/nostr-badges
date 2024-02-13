import Box from "@mui/material/Box";
import { Session } from "@/data/sessionLib";
import { Event, toNostrEvent } from "@/data/eventLib";
import { getEvent, getSession } from "@/data/serverActions";
import { NostrEvent } from "@nostr-dev-kit/ndk";
import * as nip19 from "@/nostr-tools/nip19";
import { Login } from "@/app/components/Login/Login";
import { Accept } from "./Accept";
import { ViewBadgeEventSmall } from "@/app/components/Events/ViewBadgeEventSmall";

export default async function AcceptPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { session?: string };
}) {
  const sessionId = searchParams.session;
  let session: Session | undefined = undefined;
  if (sessionId) {
    try {
      session = await getSession(sessionId);
    } catch {
      console.log(`Session ${sessionId} not found.`);
    }
  }

  const decoded = nip19.decode(params.id);
  let addressPointer: nip19.AddressPointer | undefined = undefined;
  if (decoded.type == "naddr") {
    addressPointer = decoded.data as nip19.AddressPointer;
  }
  let event: Event | undefined = undefined;
  let nostrEvent: NostrEvent | undefined = undefined;
  let id: string = "";
  let data = await getEvent(params.id);
  if (data != null) {
    event = data.event as Event;
    nostrEvent = toNostrEvent(event);
    id = data.id;
  }

  return (
    <Box
      minHeight={320}
      maxWidth={360}
      display="flex"
      flexDirection="column"
      justifyContent="center"
    >
      {session && <>{JSON.stringify(session)}</>}
      <Accept />
      <Login
        title="Badge earned!"
        instructions="To save your badge, please sign in."
      >
        <ViewBadgeEventSmall id={id} e={nostrEvent!} />
      </Login>
    </Box>
  );
}
