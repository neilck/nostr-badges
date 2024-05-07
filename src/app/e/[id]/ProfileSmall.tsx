"use client";

import { SxProps, Theme } from "@mui/material";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import * as nip19 from "@/nostr-tools/nip19";
import { useNostrContext } from "@/context/NostrContext";
import { shortenDesc } from "@/app/utils/utils";
import { useEffect, useState } from "react";

type WidthOption = "normal" | "wide";

export type Item = {
  pubkey: string;
  widthOption?: WidthOption;
  sx?: SxProps<Theme> | undefined;
};

export const ProfileSmall = (item: Item) => {
  const { pubkey, widthOption, sx } = item;
  const nostrContext = useNostrContext();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("/default/profile.png");

  const textWidth = widthOption == "wide" ? "220px" : "180px";
  const truncateLength = widthOption == "wide" ? 70 : 50;

  const defaultSx = {
    border: 0,
    pt: 1,
    pl: 1,
    pr: 1,
    "&:hover": { backgroundColor: "grey.200" },
  };

  useEffect(() => {
    let isCancelled = false;
    const shortNpub = (pubkey: string) => {
      const long = nip19.npubEncode(pubkey);
      return long.substring(0, 16) + "...";
    };

    const getProfile = async (pubkey: string) => {
      let name = "";
      let image = "";
      let description = "";

      if (pubkey != "") {
        const profile = await nostrContext.fetchProfile(pubkey);
        if (!isCancelled && profile) {
          if (name == "" && profile.displayName) name = profile.displayName;

          if (name == "" && profile.name) name = profile.name;

          if (description == "" && profile.about)
            description = shortenDesc(profile.about, truncateLength);

          if (description == "" && profile.bio)
            description = shortenDesc(profile.bio, truncateLength);

          if (profile.image) image = profile.image;
        }
      }
      if (name == "") name = shortNpub(pubkey);
      if (image == "") image = "/default/profile.png";

      setName(name);
      setDescription(description);
      setImage(image);
    };

    if (pubkey != "") {
      getProfile(pubkey);
    }

    return () => {
      isCancelled = true;
    };
  }, [pubkey, nostrContext, truncateLength]);

  return (
    <Card variant="outlined" sx={{ ...defaultSx, ...sx }}>
      <Box sx={{ display: "flex" }}>
        <Box pt={0.5} sx={{ width: 40, height: 46 }}>
          {image != "" && (
            <CardMedia
              component="img"
              sx={{ width: 40, height: 40, objectFit: "contain" }}
              image={image}
              alt="badge image"
            />
          )}
        </Box>
        <Box sx={{ width: textWidth, ml: 2, maxHeight: 80, pb: 1 }}>
          <Stack direction="column" justifyContent="left" alignItems="left">
            <div
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                width: "16rem",
              }}
            >
              <Typography
                noWrap
                variant="body1"
                fontWeight={600}
                sx={{ minWidth: 0, pt: 0.5 }}
              >
                {name}
              </Typography>
            </div>

            <Typography variant="body2" whiteSpace="pre-wrap">
              {description}
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Card>
  );
};
