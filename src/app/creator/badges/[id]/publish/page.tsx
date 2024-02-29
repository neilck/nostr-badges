"use client";

import theme from "@/app/components/ThemeRegistry/theme";
import { useEffect, useState } from "react";
import { NostrEvent, NDKFilter } from "@nostr-dev-kit/ndk";
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
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { EditCardFrame } from "@/app/components/EditCardFrame";
import { SaveButtonEx } from "@/app/components/items/SaveButtonEx";
import { BadgeStatus } from "@/app/components/BadgeStatus";
import { BadgeTestLinks } from "@/app/components/BadgeTestLinks";

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
    nostrContext.publish(nostrEvent, relays);
    return { success: true, mesg: "Badge sent to relays" };
  };

  return (
    <EditCardFrame
      instructions="Re-publish badge to your configured relays.."
      docLink="help-pages/badge-publish"
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
        <BadgeTestLinks event={event} />
      </Stack>
    </EditCardFrame>
  );
}
