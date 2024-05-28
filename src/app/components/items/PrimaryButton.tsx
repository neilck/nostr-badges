"use client";

import theme from "../ThemeRegistry/theme";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { MouseEventHandler } from "react";

export const PrimaryButton = (props: {
  buttonLabel: string;
  disabledLabel: string;
  onClick: MouseEventHandler<HTMLButtonElement> | undefined;
}) => {
  const { buttonLabel, disabledLabel, onClick } = props;

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        disabled={disabledLabel != ""}
        onClick={onClick}
        sx={{
          width: "80%",
          color: theme.palette.grey[200],
          backgroundColor: theme.palette.orange.main,
          "&:hover": {
            color: theme.palette.grey[100],
            backgroundColor: theme.palette.orange.dark,
          },
        }}
      >
        <Typography variant="body2" align="center" fontWeight="800">
          {disabledLabel != "" ? disabledLabel : buttonLabel}
        </Typography>
      </Button>
    </>
  );
};
