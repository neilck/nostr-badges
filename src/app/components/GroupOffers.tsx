"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";

import theme from "@/app/components/ThemeRegistry/theme";

import { Group } from "@/data/groupLib";
import { GroupOffer, loadGroupOffers } from "@/data/groupOfferLib";
import { OffersList } from "./OffersList";

export const GroupOffers = (props: { groupId: string; group: Group }) => {
  const { group } = props;
  const groupId = props.groupId;
  const uid = group.uid;
  const [offers, setOffers] = useState<Record<string, GroupOffer>>({});
  const { image, name, description } = group;
  const router = useRouter();

  useEffect(() => {
    loadOffers(uid, groupId);
  }, [uid, groupId]);

  const loadOffers = async (uid: string, groupId: string) => {
    const loadedOffers = await loadGroupOffers(uid, groupId);
    setOffers(loadedOffers);
  };

  const onAdd = () => {
    return router.push(`/creator/groups/${groupId}/offers/add`);
  };

  const onClicked = (docId: string) => {
    router.push(`/creator/groups/${groupId}/offers/${docId}/edit`);
  };

  return (
    <Card
      sx={{
        id: "parentCard",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        mt: 0,
        pt: 1,
        pb: 0,
        pl: 0,
        pr: 0,
        [theme.breakpoints.down("sm")]: { pt: 1 },
        maxWidth: theme.breakpoints.values.sm,
      }}
    >
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="stretch"
        width="100%"
        pl={2}
        pr={2}
        sx={{
          [theme.breakpoints.down("sm")]: { pt: 1 },
          maxWidth: theme.breakpoints.values.sm,
        }}
      >
        <Box sx={{ pt: 2 }}>
          <h3>Exclusives</h3>
        </Box>

        <Button onClick={onAdd}>+ new exclusive</Button>
        <OffersList offers={offers} onClick={onClicked} />
      </Stack>
    </Card>
  );
};
