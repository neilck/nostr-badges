"use client";

import { useState } from "react";
import { NostrEvent } from "@nostr-dev-kit/ndk";
import { Event, toNostrEvent } from "@/data/eventLib";

import theme from "@/app/components/ThemeRegistry/theme";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import MuiNextLink from "@/app/components/items/MuiNextLink";
import { CodeDialog } from "@/app/components/CodeDialog";

export const BadgeTestLinks = (props: { event: Event }) => {
  const { event } = props;
  const nostrEvent = toNostrEvent(event);

  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
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
      <CodeDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
        }}
        title={"Badge Event"}
        code={JSON.stringify(nostrEvent, null, 2)}
      />
    </>
  );
};
