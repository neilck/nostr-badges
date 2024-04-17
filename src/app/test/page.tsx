"use client";

import theme from "@/app/components/ThemeRegistry/theme";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { CommonLayout } from "../components/ComonLayout";

export default function CreatorHome() {
  return (
    <CommonLayout developerMode={false}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          rowGap: 2,
          p: 2,
          maxWidth: "360px",
          backgroundColor: theme.palette.grey[100],
        }}
      >
        <Typography variant="h2">H2 Header Text</Typography>
        <Typography variant="h3">H3 Header Text</Typography>
        <Typography variant="h4">H4 Header Text</Typography>
        <Typography variant="h5">H5 Header Text</Typography>
        <Typography variant="h6">H6 Header Text</Typography>
        <Typography variant="body1">Body1 Text</Typography>
        <Typography variant="body2">Body2 Text</Typography>
        <Typography variant="subtitle1">Subtitle1 Text</Typography>
        <Typography variant="subtitle2">Subtitle2 Text</Typography>
        <h1>H1 Header Text</h1>
        <h2>H2 Header Text</h2>
        <h3>H3 Header Text</h3>
        <h4>H4 Header Text</h4>
        <h5>H5 Header Text</h5>
        <h6>H6 Header Text</h6>
      </Box>
    </CommonLayout>
  );
}
