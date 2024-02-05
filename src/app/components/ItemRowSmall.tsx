"use client";

import { SxProps, Theme } from "@mui/material";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { shortenDesc } from "@/app/utils/utils";

type WidthOption = "normal" | "wide";

export type Item = {
  id: string;
  name: string;
  description: string;
  image: string;
  widthOption?: WidthOption;
  sx?: SxProps<Theme> | undefined;
};

export const ItemRowSmall = (item: Item) => {
  const { id, name, description, image, sx, widthOption } = item;

  const textWidth = widthOption && widthOption == "wide" ? "220px" : "180px";
  const truncateLength = widthOption && widthOption == "wide" ? 70 : 50;
  const shortDesc = shortenDesc(description, truncateLength);

  const defaultSx = {
    border: 0,
    pt: 1,
    pl: 1,
    pr: 1,
    "&:hover": { backgroundColor: "grey.200" },
  };

  return (
    <Card variant="outlined" sx={{ ...defaultSx, ...sx }}>
      <Box sx={{ display: "flex" }}>
        <Box sx={{ width: 80, height: 80 }}>
          {image != "" && (
            <CardMedia
              component="img"
              sx={{ width: 80, height: 80, objectFit: "contain" }}
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
              {shortDesc}
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Card>
  );
};
