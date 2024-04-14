"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import CardActionArea from "@mui/material/CardActionArea";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from "@mui/material/CircularProgress";

import MuiNextLink from "./items/MuiNextLink";
import { BadgeAwardedRow } from "./BadgeAwardedRow";
import { Badge } from "@/data/badgeLib";

import { useSessionContext } from "@/context/SessionContext";

type Item = {
  docId: string;
  badge: Badge;
  isAwarded: boolean;
  url: string;
};

export type OnBadgeSelectedHandler = (url: string) => void;

export function renderBadge(item: Item, handler: OnBadgeSelectedHandler) {
  const { badge, isAwarded, url } = item;
  const image = badge.thumbnail != "" ? badge.thumbnail : badge.image;

  return (
    <MuiNextLink href={url}>
      <Box
        sx={{
          "p": 0.5,
          "&:hover": { border: 2, borderRadius: 1, borderColor: "blue.light" },
        }}
      >
        <BadgeAwardedRow
          name={badge.name}
          description={badge.description}
          image={image}
          awarded={isAwarded}
        />
      </Box>
    </MuiNextLink>
  );
}

export const BadgeAwardedList = (props: {}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [currentUrl, setCurrentUrl] = useState("");

  const sessionContext = useSessionContext();
  const sessionId = sessionContext.state.sessionId;
  const session = sessionContext.state.session;

  const startTimer = () => {
    setTimerRunning(true);
    setTimeout(() => {
      setTimerRunning(false);
    }, 1000);
  };

  useEffect(() => {
    setCurrentUrl(encodeURIComponent(window.location.href));
  }, []);

  useEffect(() => {
    const load = async () => {
      if (session && sessionContext.shouldAutoOpen()) {
        const newItems = [] as Item[];
        const badge = await sessionContext.loadBadge(session.targetId);
        if (badge) {
          const code = sessionId + session.itemState.awardtoken;
          let url = `${badge.applyURL}?code=${code}`;

          const testDomain = process.env.NEXT_PUBLIC_DEV_APPLYURL_OVERRIDE;
          if (testDomain && testDomain != "") {
            const tempUrl = new URL(url);
            const path = tempUrl.pathname + tempUrl.search;
            const overrideUrl = `${testDomain}${path}`;
            console.log(`Using override url ${overrideUrl}`);
            url = overrideUrl;
          }

          url = `${url}&redirect=${currentUrl}`;

          newItems.push({
            docId: session.targetId,
            badge: badge,
            isAwarded:
              session.itemState.isAwarded || session.itemState.prevAward,
            url: url,
          });
        }
        setItems(newItems);
        setIsLoading(false);
        return;
      }

      if (session?.requiredBadges) {
        const newItems = [] as Item[];
        for (let i = 0; i < session.requiredBadges.length; i++) {
          const sessionBadge = session.requiredBadges[i];
          const badge = await sessionContext.loadBadge(sessionBadge.badgeId);
          if (badge) {
            const code = sessionId + sessionBadge.itemState.awardtoken;
            let url = `${badge.applyURL}?code=${code}`;

            const testDomain = process.env.NEXT_PUBLIC_DEV_APPLYURL_OVERRIDE;
            if (testDomain && testDomain != "") {
              const tempUrl = new URL(url);
              const path = tempUrl.pathname + tempUrl.search;
              const overrideUrl = `${testDomain}${path}`;
              console.log(`Using override url ${overrideUrl}`);
              url = overrideUrl;
            }

            url = `${url}&redirect=${currentUrl}`;

            newItems.push({
              docId: sessionBadge.badgeId,
              badge: badge,
              isAwarded:
                sessionBadge.itemState.isAwarded ||
                sessionBadge.itemState.prevAward,
              url: url,
            });
          }
        }
        setItems(newItems);
        setIsLoading(false);
      }
    };

    load();
  }, [session, sessionContext]);

  useEffect(() => {
    setIsUpdating(sessionContext.state.isUpdating);
    if (sessionContext.state.isUpdating) {
      startTimer();
    }
  }, [sessionContext.state.isUpdating]);

  const handleClick: OnBadgeSelectedHandler = (url: string) => {
    console.log("Reidrecting to : " + url);
  };

  return (
    <Stack
      direction="column"
      spacing={1}
      useFlexGap
      flexWrap="wrap"
      alignItems="center"
    >
      {isLoading && <CircularProgress />}

      {!isLoading &&
        items.map((item) => (
          <div key={item.docId}>{renderBadge(item, handleClick)}</div>
        ))}
      {!isLoading && (isUpdating || timerRunning) && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          width="100%"
        >
          <Box width="auto" pb={0.5}>
            <Typography fontWeight="600">updating...</Typography>
          </Box>
          <Box width="100%">
            <LinearProgress />
          </Box>
        </Box>
      )}
    </Stack>
  );
};
