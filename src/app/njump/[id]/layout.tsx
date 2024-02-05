import * as React from "react";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

import ThemeRegistry from "@/app/components/ThemeRegistry/ThemeRegistry";
import { AppBarUser } from "@/app/components/AppBar/AppBarUser";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeRegistry>
      <AppBarUser />
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        paddingTop={4}
      >
        <Box maxWidth="400px">
          <Paper elevation={4}>{children}</Paper>
        </Box>
      </Box>
    </ThemeRegistry>
  );
}
