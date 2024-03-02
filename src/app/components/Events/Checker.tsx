"use client";

import { useEffect, useState } from "react";
import { useSessionContext } from "@/context/SessionContext";
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
import { Session } from "@/data/sessionLib";
import { Event } from "@/data/eventLib";
import Typography from "@mui/material/Typography";
import { getBadgeDefEvent } from "@/data/serverActions";

const BadgeAwardKind = 8;

export const Checker = () => {
  const sessionContext = useSessionContext();
  const session = sessionContext.state.session;

  const [pubkey, setPubkey] = useState("");
  const [badgeDefEvents, setBadgeDefEvents] = useState<Event[]>([]);

  /*
  const getBadge = async (badgeDefRef: string, issuerHex: string,  recipientHex: string) => {
    // Get all badge awards for the user
    const filter: NDKFilter = { kinds: [BadgeAwardKind], authors: [issuerHex], "#p": [recipientHex]};

    // Will return all found events
    const events = await _publishNdk.fetchEvents(filter);    
  }
  */

  const getBadges = async (session: Session) => {
    sessionContext.state.badges;
    const events: Event[] = [];
    if (session.requiredBadges) {
      for (let i = 0; i < session.requiredBadges.length; i++) {
        const badgeSession = session.requiredBadges[i];
        const badgeDefEvent = await getBadgeDefEvent(
          "BADGE",
          badgeSession.badgeId
        );

        if (badgeDefEvent) {
          events.push(badgeDefEvent);
        }
      }
      setBadgeDefEvents(events);
    }
  };

  useEffect(() => {
    if (sessionContext.state.session) {
      setPubkey(sessionContext.state.session.pubkey);
      getBadges(sessionContext.state.session);
    } else {
      setPubkey("");
    }
  }, [sessionContext.state.session]);

  useEffect(() => {
    // check for badge awards
    // if found, send badge award event to server for verification
  }, [badgeDefEvents]);

  return (
    <>
      {pubkey != "" && (
        <Typography>{`checking for badges for ${pubkey}`}</Typography>
      )}
    </>
  );
};
