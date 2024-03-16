"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Event, toNostrEvent } from "@/data/eventLib";

import theme from "@/app/components/ThemeRegistry/theme";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MuiNextLink from "@/app/components/items/MuiNextLink";
import { CopiableText } from "./items/CopiableText";

export const BadgeTestLinks = (props: {
  event: Event;
  title?: string;
  type?: string;
}) => {
  const applyURL = `${process.env.NEXT_PUBLIC_AKA_GET}/njump/${props.event.encodedAddress}`;
  const shortURL = applyURL.substring(0, 40);
  const { title, event } = props;
  const [type, setType] = useState(props.type ?? "BADGE");
  const [applyTitle, setApplyTitle] = useState("");
  const [awardName, setAwardName] = useState("");
  const nostrEvent = toNostrEvent(event);

  useEffect(() => {
    if (type == "GROUP") {
      setApplyTitle("Apply to group link");
      setAwardName("group members");
    } else {
      setApplyTitle("Get badge link");
      setAwardName("badge awards");
    }
  }, [type]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      width="100%"
    >
      {title && (
        <Typography textAlign="left" fontWeight={600} variant="body1">
          {title}
        </Typography>
      )}

      <Box justifyContent="left">
        <Typography variant="subtitle2" fontWeight={600}>
          {applyTitle}
        </Typography>
        <Box width="320px">
          <CopiableText initValue={applyURL} variant="body2" />
        </Box>
        <MuiNextLink href={applyURL} rel="noopener noreferrer" target="_blank">
          <Typography
            variant="subtitle2"
            fontWeight="500"
            pl={0.7}
            sx={{
              "&:hover": { color: { color: theme.palette.blue.dark } },
            }}
          >
            open in new tab
          </Typography>
        </MuiNextLink>
      </Box>

      <Box pt={2} pb={2} display="flex" alignItems="center">
        <Typography variant="subtitle1">Visit </Typography>
        <MuiNextLink
          href={`https://badges.page/a/${event.encodedAddress}`}
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
            badges.page
          </Typography>
        </MuiNextLink>
        <Typography pl={0.5}>to manage {awardName}.</Typography>
      </Box>
    </Box>
  );
};
