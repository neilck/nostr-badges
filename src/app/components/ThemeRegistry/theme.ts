"use client";

import { createTheme } from "@mui/material/styles";
import { red } from "@mui/material/colors";
import { Inter } from "next/font/google";

const inter = Inter({
  weight: ["400", "500", "600", "800"],
  style: ["normal"],
  subsets: ["latin"],
});

declare module "@mui/material/styles" {
  interface Palette {
    orange: Palette["primary"];
    yellow: Palette["primary"];
    blue: Palette["primary"];
    green: Palette["primary"];
  }

  interface PaletteOptions {
    orange: PaletteOptions["primary"];
    yellow: PaletteOptions["primary"];
    blue: PaletteOptions["primary"];
    green: PaletteOptions["primary"];
  }
}

// A custom theme for this app
// https://mui.com/material-ui/customization/default-theme/
// default
// xs, extra-small: 0px
// sm, small: 600px
// md, medium: 900px
// lg, large: 1200px
// xl, extra-large: 1536px

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  palette: {
    primary: {
      main: "#174496",
      light: "#335BA5",
      dark: "#0E3274",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#F88A3A",
      light: "#FFA35F",
      dark: "#E2680E",
      contrastText: "#FFFFFF",
    },
    orange: {
      main: "#F88A3A",
      light: "#FFA35F",
      dark: "#E2680E",
      contrastText: "#FFFFFF",
    },
    yellow: {
      main: "#F8B53A",
      light: "#FFC75F",
      dark: "#E2980E",
    },
    blue: {
      main: "#174496",
      light: "#335BA5",
      dark: "#0E3274",
    },
    green: {
      main: "#098C7E",
      light: "#249A8E",
      dark: "#036C61",
    },
    error: {
      main: red.A400,
    },
    background: {
      default: "#DEDEDE",
    },
  },
  typography: {
    fontFamily: [inter.style.fontFamily, "Roboto", "Arial", "sans-serif"].join(
      ","
    ), // `"Inter", "Roboto", "Arial", sans-serif`,
    button: {
      textTransform: "none",
    },
    h6: {
      lineHeight: 1.0,
    },
  },
  components: {
    MuiMenuItem: {
      styleOverrides: {
        root: {
          paddingTop: 1,
          paddingBottom: 1,
        },
      },
    },
  },
});

export default theme;
