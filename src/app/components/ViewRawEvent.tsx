"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Event, toNostrEvent } from "@/data/eventLib";

import theme from "@/app/components/ThemeRegistry/theme";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import MuiNextLink from "@/app/components/items/MuiNextLink";
import { CopiableText } from "./items/CopiableText";
import { CodeDialog } from "@/app/components/CodeDialog";

export const ViewRawEvent = (props: { event: Event }) => {
  const { event } = props;
  const nostrEvent = toNostrEvent(event);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="flex-start"
      width="100%"
    >
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
      <CodeDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
        }}
        title={"Badge Event"}
        code={JSON.stringify(nostrEvent, null, 2)}
      />
    </Box>
  );
};
