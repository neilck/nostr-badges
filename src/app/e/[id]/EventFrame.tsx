"use client";

import theme from "@/app/components/ThemeRegistry/theme";
import { Event } from "@/data/eventLib";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function EventFrame({
  event,
  header,
  children,
}: {
  event: Event | undefined;
  header: string;
  children: React.ReactNode;
}) {
  let title = "";
  let type = "";

  if (event) {
    for (let i = 0; i < event.tags.length; i++) {
      const tag = event.tags[i];
      if (tag.name == "type" && tag.values.length > 0) {
        type = tag.values[0];
      }
      if (tag.name == "name" && title == "" && tag.values.length > 0) {
        title = tag.values[0];
      }
      if (tag.name == "title" && title == "" && tag.values.length > 0) {
        title = tag.values[0];
      }
    }
  }

  return (
    <Stack
      direction="column"
      alignItems="center"
      sx={{
        backgroundColor: theme.palette.blue.main,
      }}
    >
      <Box sx={{ height: "72px", pt: 1.5 }}>
        <Typography variant="body1" sx={{ color: theme.palette.common.white }}>
          Applying for {type.toLowerCase()}
        </Typography>
        <Typography variant="h6" sx={{ color: theme.palette.common.white }}>
          {title}
        </Typography>
      </Box>
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderTopLeftRadius: "16px",
          borderTopRightRadius: "16px",
          minHeight: "300px",
          minWidth: "336px",
          p: 1,
        }}
      >
        <Typography variant="h5" fontWeight="bold" textAlign="center" pt={1}>
          {header}
        </Typography>
        {children}
      </Box>
    </Stack>
  );
}
