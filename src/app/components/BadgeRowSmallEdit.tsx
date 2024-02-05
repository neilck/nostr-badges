"use client";

import { useState } from "react";

import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardMedia from "@mui/material/CardMedia";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";

export const BadgeRowSmallEdit = (props: {
  name: string;
  image: string;
  onDeleteClick: () => void;
}) => {
  const { name, image, onDeleteClick } = props;

  return (
    <Card variant="outlined">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "top",
          pr: 0.5,
        }}
      >
        <Box id="contentArea" display="flex" flexDirection="column">
          <Box
            id="contentRowTop"
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Box width="40px">
              {image != "" && (
                <CardMedia
                  component="img"
                  sx={{ width: 40, objectFit: "contain" }}
                  image={image}
                  alt="badge image"
                />
              )}
            </Box>

            <Stack
              direction="column"
              justifyContent="center"
              alignItems="left"
              sx={{
                ml: 2,
                maxHeight: 80,
              }}
            >
              <Typography
                variant="body1"
                fontWeight={400}
                sx={{ minWidth: 0, pt: 0.5 }}
              >
                {name}
              </Typography>
            </Stack>
          </Box>
        </Box>

        <CardActionArea
          onClick={onDeleteClick}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "32px",
            height: "32px",
          }}
        >
          <CloseIcon />
        </CardActionArea>
      </Box>
    </Card>
  );
};
