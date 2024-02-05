"use client";

import theme from "./ThemeRegistry/theme";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { DocLink } from "@/app/components/items/DocLink";

export function EditCardFrame(props: {
  children: React.ReactNode;
  instructions: string;
  maxWidth?: number;
  docLink?: string;
}) {
  const { children, instructions, docLink, maxWidth } = props;
  return (
    <Stack
      id="editCardFrame"
      direction="column"
      width="100%"
      alignItems="center"
    >
      <Box
        id="instructionsAndCard"
        sx={{
          [theme.breakpoints.down("sm")]: {
            width: "auto",
            minWidth: "360px",
            maxWidth: "400px",
          },
          [theme.breakpoints.up("sm")]: {
            width: "400px",
          },
        }}
      >
        <Typography variant="body1">{instructions}</Typography>
        {docLink && <DocLink doc={docLink}>learn more...</DocLink>}
        <Card
          id="editCardFrameCard"
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            mt: 1,
            pt: 2,
            pb: 3,
            [theme.breakpoints.down("sm")]: { pt: 1 },
          }}
        >
          {children}
        </Card>
      </Box>
    </Stack>
  );
}
