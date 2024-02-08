"use client";

import { useState, useEffect } from "react";
import {
  NDKEvent,
  NDKFilter,
  NDKRelay,
  NDKRelaySet,
  NDKSubscription,
  NDKSubscriptionOptions,
  NDKSubscriptionCacheUsage,
  NostrEvent,
} from "@nostr-dev-kit/ndk";
import { _publishNdk } from "@/context/NostrContext";
import { Grid, Typography } from "@mui/material";

export const BadgeStatus = (props: {
  relays: string[];
  filter: NDKFilter | undefined;
  badgeEvent: NostrEvent;
}) => {
  const relays = props.relays;
  const filter = props.filter;
  const badgeEvent = props.badgeEvent;

  const [statuses, setStatuses] = useState(new Map<string, string>());
  const [sub, setSub] = useState<NDKSubscription | undefined>(undefined);

  useEffect(() => {
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sub]);

  useEffect(() => {
    if (!filter || relays.length == 0) {
      return;
    }
    if (sub) {
      return;
    }

    startSub(filter, relays);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relays, filter]);

  const startSub = (filter: NDKFilter, relays: string[]) => {
    const onEventListener = async (event: NDKEvent, relay: NDKRelay) => {
      for (let entry of statuses.entries()) {
        if (entry[0] == relay.url) {
          if (event.created_at) {
            let status = "---";
            if (event.created_at == badgeEvent.created_at) {
              status = "up to date";
            }
            if (event.created_at < badgeEvent.created_at) {
              status = "out of date";
            }
            if (event.created_at > badgeEvent.created_at) {
              status = "newer";
            }
            setStatuses((prev) => {
              const updated = new Map<string, string>(prev);
              updated.set(entry[0], status);
              return updated;
            });
          }

          return;
        }
      }
    };

    const subOpts: NDKSubscriptionOptions = {
      closeOnEose: false,
      cacheUsage: NDKSubscriptionCacheUsage.ONLY_RELAY,
      groupable: false,
    };

    const statuses = new Map<string, string>();
    relays.forEach((relay) => {
      statuses.set(relay, "---");
    });
    setStatuses(statuses);

    const relaySet = NDKRelaySet.fromRelayUrls(relays, _publishNdk);
    const newSub = _publishNdk.subscribe(filter, subOpts, relaySet);

    newSub.on("event", onEventListener);
    newSub.on("event:dup", onEventListener);

    setSub(newSub);
    return cleanup;
  };

  const cleanup = () => {
    if (sub) {
      sub.stop();
    }
  };

  return (
    <Grid container spacing={0} width="100%">
      <Grid item xs={6}>
        <Typography variant="subtitle2" fontWeight={800}>
          Relay
        </Typography>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="subtitle2" fontWeight={800}>
          Badge
        </Typography>
      </Grid>
      {Array.from(statuses.entries()).map(([url, status]) => (
        <Grid container key={url}>
          <Grid item xs={6}>
            <Typography variant="subtitle2">{url}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2">{status}</Typography>
          </Grid>
        </Grid>
      ))}
    </Grid>
  );
};
