"use client";

import theme from "@/app/components/ThemeRegistry/theme";
import { useEffect, useState } from "react";
import {
  NostrEvent,
  NDKRelay,
  NDKSubscription,
  NDKFilter,
} from "@nostr-dev-kit/ndk";
import {
  Event,
  getEmptyEvent,
  getEmptyNostrEvent,
  loadBadgeEvent,
  toNostrEvent,
} from "@/data/eventLib";
import { Badge, getEmptyBadge } from "@/data/badgeLib";

import { useAccountContext } from "@/context/AccountContext";
import { useNostrContext } from "@/context/NostrContext";
import { useBadgeContext } from "@/context/BadgeContext";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MuiNextLink from "@/app/components/items/MuiNextLink";
import { EditCardFrame } from "@/app/components/EditCardFrame";
import { SaveButtonEx } from "@/app/components/items/SaveButtonEx";
import { CodeDialog } from "@/app/components/CodeDialog";
import { BadgeStatus } from "@/app/components/BadgeStatus";

export default function PublishPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const badgeContext = useBadgeContext();
  const accountContext = useAccountContext();
  const nostrContext = useNostrContext();

  const [relays, setRelays] = useState<string[]>([]);
  const [filter, setFilter] = useState<NDKFilter | undefined>(undefined);
  const [badge, setBadge] = useState<Badge>(getEmptyBadge());
  const [event, setEvent] = useState<Event>(getEmptyEvent());
  const [nostrEvent, setNostrEvent] = useState<NostrEvent>(
    getEmptyNostrEvent()
  );
  const [publishResult, setPublishResult] = useState<Set<NDKRelay> | undefined>(
    undefined
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  let subscription: NDKSubscription | undefined = undefined;

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (accountContext.state.account) {
      const relays = accountContext.getRelays();
      setRelays(relays);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountContext.state.account]);

  const load = async () => {
    const badge = await badgeContext.loadBadge(id);
    if (badge) {
      setBadge(badge);

      const event = await loadBadgeEvent(badge.event);
      if (event) {
        setEvent(event);

        const nostrEvent = toNostrEvent(event);
        setNostrEvent(nostrEvent);

        const filter: NDKFilter = {
          authors: [event.pubkey],
          kinds: [30009],
          "#d": [badge.identifier],
        };

        setFilter(filter);
      }
    }
  };

  const onSaveClick = async () => {
    const relays = accountContext.getRelays();
    nostrContext.publish(nostrEvent, relays).then((publishResult) => {
      setPublishResult(publishResult);
    });
    return { success: true, mesg: "Badge sent to relays" };
  };

  return (
    <EditCardFrame
      instructions="Publish badge to your configured relays.."
      docLink="hosted-badges/badge-publish"
    >
      <Stack direction="column" pl={2} pr={2} maxWidth={600} spacing={2}>
        <Box>
          <h3>Badge {badge.name}</h3>
        </Box>

        <Typography textAlign="left" fontWeight={600} variant="body1">
          Current Relay Status
        </Typography>
        <Box width="100%" bgcolor={theme.palette.background.default}>
          <BadgeStatus
            relays={relays}
            filter={filter}
            badgeEvent={nostrEvent}
          />
        </Box>

        <SaveButtonEx onClick={onSaveClick} buttonLabel="Publish" />
        <Box display="flex" flexDirection="column" alignItems="flex-start">
          <Typography textAlign="left" fontWeight={600} variant="body1">
            Test Links
          </Typography>
          <Button
            variant="text"
            size="small"
            onClick={() => {
              setDialogOpen(true);
            }}
            sx={{ textAlign: "left" }}
          >
            <Typography
              variant="subtitle2"
              align="center"
              fontWeight="600"
              sx={{
                "&:hover": { color: { color: theme.palette.blue.dark } },
              }}
            >
              View raw event
            </Typography>
          </Button>

          <MuiNextLink
            href={`/njump/${event.encodedAddress}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Typography
              variant="subtitle2"
              align="center"
              fontWeight="600"
              pl={0.7}
              sx={{
                "&:hover": { color: { color: theme.palette.blue.dark } },
              }}
            >
              Apply for badge link
            </Typography>
          </MuiNextLink>
        </Box>
      </Stack>
      <CodeDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
        }}
        title={"Badge Event"}
        code={JSON.stringify(nostrEvent, null, 2)}
      />
    </EditCardFrame>
  );
}
