import Box from "@mui/material/Box";
import { Badge } from "@/data/badgeLib";
import { toNostrEvent } from "@/data/eventLib";
import { getBadge, getEvent, getSession } from "@/data/serverActions";
import { Accept } from "./Accept";
import { SessionController } from "./SessionController";

export default async function AcceptPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { session?: string };
}) {
  const naddr = params.id;
  const sessionId = searchParams.session ? searchParams.session : "";

  const [session, eventResult] = await Promise.all([
    getSession(sessionId),
    getEvent(params.id),
  ]);

  const nostrEvent = toNostrEvent(eventResult.event);
  const id = eventResult.id;

  let badges: Badge[] = [];
  let badgeItems: {
    badge: Badge;
    awardData?: { [key: string]: string } | undefined;
  }[] = [];
  if (session.requiredBadges) {
    const promises: Promise<Badge>[] = [];
    for (let i = 0; i < session.requiredBadges.length; i++) {
      const badge = await getBadge(session.requiredBadges[i].badgeId);
      const badgeItem: {
        badge: Badge;
        awardData?: { [key: string]: string } | undefined;
      } = { badge: badge };
      if (session.requiredBadges[i].itemState.awardData) {
        badgeItem.awardData = session.requiredBadges[i].itemState.awardData;
      }
      badgeItems.push(badgeItem);
    }
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
            pubkey={session.pubkey}
            nostrEvent={nostrEvent}
            badgeItems={badgeItems}
          />
        )}
      </Box>
      <SessionController naddr={naddr} />
    </Box>
  );
}
