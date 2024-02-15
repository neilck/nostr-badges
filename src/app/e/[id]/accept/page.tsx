import Box from "@mui/material/Box";
import { Badge } from "@/data/badgeLib";
import { toNostrEvent } from "@/data/eventLib";
import { getBadge, getEvent, getSession } from "@/data/serverActions";
import { Accept } from "./Accept";

export default async function AcceptPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { session?: string };
}) {
  const sessionId = searchParams.session ? searchParams.session : "";

  const [session, eventResult] = await Promise.all([
    getSession(sessionId),
    getEvent(params.id),
  ]);

  const nostrEvent = toNostrEvent(eventResult.event);
  const id = eventResult.id;

  let badges: Badge[] = [];
  if (session.requiredBadges) {
    const promises: Promise<Badge>[] = [];
    for (let i = 0; i < session.requiredBadges.length; i++) {
      const badgePromise = getBadge(session.requiredBadges[i].badgeId);
      promises.push(badgePromise);
    }
    badges = await Promise.all(promises);
  }

  return (
    <Box
      minHeight={320}
      maxWidth={360}
      display="flex"
      flexDirection="column"
      justifyContent="center"
      pl={2}
      pr={2}
    >
      <Box pt={2}>
        {session && (
          <Accept
            id={id}
            type={session.type}
            nostrEvent={nostrEvent}
            badges={badges}
          />
        )}
      </Box>
    </Box>
  );
}
