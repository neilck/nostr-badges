import Box from "@mui/material/Box";
import { Badge } from "@/data/badgeLib";
import { Profile, getEmptyProfile, loadProfile } from "@/data/profileLib";
import { toNostrEvent } from "@/data/eventLib";
import { getBadge, getEvent, getSession } from "@/data/serverActions";

import { getSessionState } from "@/context/SessionHelper";

import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import EventFrame from "../EventFrame";
import { SessionController } from "../../SessionController";
import { BadgeView } from "@/app/components/BadgeView";
import { ProfileSmall } from "../ProfileSmall";
import { PrimaryButton } from "@/app/components/Events/PrimaryButton";
import { SecondaryButton } from "@/app/components/Events/SecondaryButton";

const getHeader = (type: string) => {
  switch (type) {
    case "BADGE":
      return "Badge issued!";
    case "GROUP":
      return "Membership approved!";
    default:
      return "Approved!";
  }
};

export default async function AwardedPage({
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

  const sessionState = getSessionState(session);
  const event = eventResult.event;
  let profile = getEmptyProfile();
  let lProfile = await loadProfile(session.pubkey);
  if (lProfile != null) {
    const keys = Object.keys(profile);
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (Object.hasOwn(lProfile, key)) {
        profile[key] = lProfile[key];
      }
    }
  }

  let title = "";
  let description = "";
  let image = "";
  let type = "";

  const hasRedirect = session.redirectUrl != "";
  let url = `${process.env.NEXT_PUBLIC_AKA_APP}/profile/${session.pubkey}`;
  let buttonLabel = "View in Profile";

  if (hasRedirect) {
    url = session.redirectUrl;
    buttonLabel = "Next";
  }

  if (event) {
    for (let i = 0; i < event.tags.length; i++) {
      const tag = event.tags[i];
      if (tag.name == "type" && tag.values.length > 0) {
        type = tag.values[0];
      }
      if (tag.name == "name" && title == "" && tag.values.length > 0) {
        title = tag.values[0];
      }
      if (tag.name == "title" && title == "" && tag.values.length > 0) {
        title = tag.values[0];
      }
      if (
        tag.name == "description" &&
        description == "" &&
        tag.values.length > 0
      ) {
        description = tag.values[0];
      }
      if (tag.name == "image" && image == "" && tag.values.length > 0) {
        image = tag.values[0];
      }
    }
  }

  const header = getHeader(type);

  return (
    <EventFrame event={event} header={header}>
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
          <Typography variant="body2" fontWeight={400} pt={1}>
            Awarded to
          </Typography>
          <Card variant="outlined">
            <ProfileSmall profile={profile} widthOption="wide" />
          </Card>
          <BadgeView name={title} description={description} image={image} />
        </Box>
        <SessionController />
      </Box>

      <Stack alignItems="center" sx={{ pt: 2, pb: 3 }}>
        <PrimaryButton buttonLabel={buttonLabel} url={url} />
      </Stack>
    </EventFrame>
  );
}
