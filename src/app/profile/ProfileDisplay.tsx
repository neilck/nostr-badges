"use client";

import { SxProps, Theme } from "@mui/material";
import { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Collapse from "@mui/material/Collapse";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Profile } from "@/data/profileLib";
import { DisplayData } from "./DisplayData";

const keyList = [
  "publickey",
  "website",
  "nip05",
  "lud06",
  "lud16",
  "zapService",
];
export const ProfileDisplay = ({
  profile,
  extra,
}: {
  profile: Profile;
  extra?: boolean;
}) => {
  const id = profile.publickey;
  const name = profile.name ? profile.name : "";
  const displayName = profile.displayName ? profile.displayName : "";
  const about = profile.about ? profile.about : "";
  const image = profile.image;

  const defaultSx = {
    border: 0,
    p: 0,
  };

  const [showMore, setShowMore] = useState(false);
  const handleToggleCollapse = () => {
    setShowMore((prev) => !prev); // Toggle the collapsed state
  };

  return (
    <Card variant="outlined" sx={{ ...defaultSx }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar
          src={image}
          sx={{
            width: 120,
            height: 120,
            mt: 0.5,
          }}
        ></Avatar>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",

            pb: 1,
            pl: 2,
            pr: 2,
          }}
        >
          <Typography
            noWrap
            variant="body1"
            fontWeight={600}
            sx={{ minWidth: 0, pt: 2 }}
          >
            {displayName != "" ? displayName : name}
          </Typography>

          <Typography variant="body1" sx={{ whiteSpace: "pre-wrap" }}>
            {displayName != "" ? name : ""}
          </Typography>
        </Box>
      </Box>
      <Typography pt={1}>About me:</Typography>
      <Typography
        variant="body1"
        sx={{ whiteSpace: "pre-wrap", lineHeight: "1.2em", pt: 1 }}
      >
        {about}
      </Typography>

      {extra && (
        <>
          <Button onClick={handleToggleCollapse} endIcon={<ExpandMoreIcon />}>
            {showMore ? "show less" : "show more..."}
          </Button>
          <Collapse in={showMore}>
            <DisplayData data={profile} keysToShow={keyList} />
          </Collapse>
        </>
      )}
    </Card>
  );
};
