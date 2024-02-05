"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Typography from "@mui/material/Typography";
import { Badge, loadSharedBadges } from "@/data/badgeLib";
import { BadgeSelectWide } from "@/app/components/BadgeSelectWide";
export interface Props {
  open: boolean;
  excludeBadgeIds: string[];
  onClose: (badgeId: string) => void;
}

export function BadgeSelectDialog(props: Props) {
  const { open, onClose } = props;
  const [badgeId, setBadgeId] = useState("");

  const [availBadges, setAvailBadges] = useState<Map<string, Badge>>(
    new Map<string, Badge>()
  );

  useEffect(() => {
    const loadBadges = async () => {
      // get all available badges
      const allBadges = await loadSharedBadges();

      const required = new Map<string, Badge>();
      const available = new Map<string, Badge>();

      for (let i = 0; i < props.excludeBadgeIds.length; i++) {
        const badgeId = props.excludeBadgeIds[i];
        const badge = allBadges[badgeId];
        if (badge) {
          required.set(badgeId, badge);
          delete allBadges[badgeId];
        }
      }

      // add remaining badges to available
      Object.entries(allBadges).map(([id, badge]) => {
        available.set(id, badge);
      });

      setAvailBadges(available);
    };

    loadBadges();
  }, [props.excludeBadgeIds]);

  const onBadgeSelectChange = (docId: string, badge: Badge) => {
    if (badge) {
      onClose(docId);
    }
  };

  const title = "Choose a badge...";

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (onClose) onClose(badgeId);
      }}
      maxWidth="md"
      fullWidth
    >
      <DialogContent>
        <Box
          display="flex"
          flexDirection="column"
          alignContent="center"
          padding={1}
        >
          <Box pb={1}>
            <Typography variant="body1">{title}</Typography>
          </Box>
          <BadgeSelectWide
            availableBadges={Object.fromEntries(availBadges.entries())}
            onSelected={onBadgeSelectChange}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              pt: 2,
            }}
          >
            <Button
              onClick={() => {
                if (onClose) onClose(badgeId);
              }}
            >
              Close
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
