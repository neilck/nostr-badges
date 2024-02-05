"use client";

import theme from "@/app/components/ThemeRegistry/theme";
import Box from "@mui/material/Box";
import { AkaAppBar } from "./components/AkaAppBar";
import { Login } from "./components/Login";
import Grid from "@mui/material/Grid";
import Paper from "@mui/material/Paper";
import ThemeRegistry from "./components/ThemeRegistry/ThemeRegistry";

export default function Home() {
  return (
    <ThemeRegistry>
      <Box position="fixed" top={0} width="100%" height="48px">
        <AkaAppBar />
      </Box>

      <Grid
        container
        sx={{ height: "100vh", width: "100%" }}
        rowSpacing={0}
        marginTop="48px"
        position="fixed"
      >
        {/* Image on the left */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{ display: { xs: "none", md: "flex" }, flexGrow: 1 }}
        >
          <img
            src="/heroes.png"
            alt="Your Image"
            style={{ width: "100%", height: "auto", objectFit: "cover" }}
          />
        </Grid>

        {/* Login box on the right for screens greater than md breakpoint */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{ display: { xs: "none", md: "flex" }, flexGrow: 1 }}
        >
          <Paper
            style={{
              padding: theme.spacing(3),
              textAlign: "center",
              height: "100%",
              width: "100%",
            }}
          >
            <Login />
          </Paper>
        </Grid>

        {/* Login box centered for screens less than md breakpoint */}
        <Grid item xs={12} sx={{ display: { md: "none" }, flexGrow: 1 }}>
          <Paper
            style={{
              padding: theme.spacing(3),
              textAlign: "center",
              height: "100%",
            }}
          >
            <Login />
          </Paper>
        </Grid>
      </Grid>
    </ThemeRegistry>
  );
}
