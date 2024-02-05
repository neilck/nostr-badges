"use client";

import { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { SaveButtonEx } from "@/app/components/items/SaveButtonEx";
import { FieldManager } from "./FieldManager";
import { Badge, DataField, getEmptyBadge } from "@/data/badgeLib";
import { useBadgeContext } from "@/context/BadgeContext";

export const DataEdit = (props: { docId: string }) => {
  const badgeContext = useBadgeContext();
  const { docId } = props;

  const [badge, setBadge] = useState<Badge>(getEmptyBadge());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function getBadge() {
      const badge = await badgeContext.loadBadge(docId);
      if (badge) {
        setBadge(badge);
        setIsLoading(false);
      }
    }

    getBadge();
  }, [badgeContext, docId]);

  const onSaveClick = async () => {
    const saveResult = await badgeContext.saveBadge(docId, badge);
    if (!saveResult.success) {
      return { success: false, mesg: saveResult.error };
    } else {
      return { success: true };
    }
  };

  const onfieldsChangedHandler = (fields: DataField[]) => {
    const updated = { ...badge };
    updated.dataFields = fields;
    setBadge(updated);
  };

  return (
    <>
      {!isLoading && (
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="center"
          spacing={2.5}
          pl={2}
          pr={2}
          maxWidth="400px"
        >
          <Box sx={{ width: "100%" }}>
            <Typography textAlign="left" fontWeight={600} variant="body1">
              Badge Data Fields
            </Typography>
            <Typography textAlign="left" variant="body2" pb={1}>
              Add a data field by name.
            </Typography>
            <FieldManager
              fields={badge.dataFields}
              onChange={onfieldsChangedHandler}
            />
          </Box>
          <Box
            sx={{
              pt: 2.5,
              display: "flex",
              justifyContent: "space-evenly",
              width: "100%",
            }}
          >
            <SaveButtonEx onClick={onSaveClick}></SaveButtonEx>
          </Box>
        </Stack>
      )}
    </>
  );
};
