"use client";

import theme from "../ThemeRegistry/theme";
import { useState } from "react";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { SxProps, Theme } from "@mui/material";

export const GenericButton = (props: {
  onClick?: () => void;
  color?: "primary" | "secondary" | "grey";
  buttonLabel?: string;
  sx?: SxProps<Theme> | undefined;
  disabled?: boolean;
}) => {
  const { onClick } = props;
  const [isDisabled, setIsDisabled] = useState(false);
  const [buttonLabel, setButtonLabel] = useState(
    props.buttonLabel ? props.buttonLabel : "Button"
  );
  const color = props.color ?? "secondary";

  const getThemeColor = (color: string, dark: boolean = false) => {
    if (!dark) {
      switch (color) {
        case "primary":
          return theme.palette.primary.main;
        case "secondary":
          return theme.palette.secondary.main;
        case "grey":
          return theme.palette.grey[500];
      }
      return theme.palette.primary.main;
    } else {
      switch (color) {
        case "primary":
          return theme.palette.primary.dark;
        case "secondary":
          return theme.palette.secondary.dark;
        case "grey":
          return theme.palette.grey[700];
      }
      return theme.palette.primary.dark;
    }
  };

  const bgColor = getThemeColor(color);
  const hoverBgColor = getThemeColor(color, true);

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Button
        onClick={() => {
          if (onClick) onClick();
        }}
        variant="contained"
        disabled={props.disabled}
        sx={{
          width: "191px",
          backgroundColor: bgColor,
          "&:hover": { backgroundColor: hoverBgColor },
          ...props.sx,
        }}
      >
        <Typography variant="body1" fontWeight={600}>
          {buttonLabel}
        </Typography>
      </Button>
    </Box>
  );
};
