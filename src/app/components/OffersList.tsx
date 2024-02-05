"use client";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Typography from "@mui/material/Typography";

import { Day } from "./items/Day";

import { GroupOffer } from "@/data/groupOfferLib";
import { shortenDesc } from "@/app/utils/utils";

export const OffersList = (props: {
  offers: Record<string, GroupOffer>;
  onClick: (offerId: string) => void;
}) => {
  const { offers, onClick } = props;

  if (Object.keys(offers).length == 0)
    return <Typography variant="body2">none</Typography>;

  return (
    <List
      sx={{
        width: "100%",
        maxWidth: 360,
        bgcolor: "background.paper",
        pt: 0,
        mt: 0,
      }}
    >
      {Object.keys(offers).map((key) => {
        const offer = offers[key];
        const seconds = offer.created ? offer.created.seconds : 0;
        const shortDesc = shortenDesc(offer.description, 35);

        return (
          <ListItem key={key} sx={{ m: 0, p: 0.5 }}>
            <ListItemButton
              onClick={() => {
                onClick(key);
              }}
              sx={{ m: 0, p: 0 }}
            >
              <ListItemAvatar sx={{ pr: 2 }}>
                <Day seconds={seconds} />
              </ListItemAvatar>
              <ListItemText
                primary={offer.name}
                secondary={<>{shortDesc}</>}
                sx={{ pt: 0.2 }}
              />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
};
