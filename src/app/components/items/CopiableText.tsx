"use client";

import theme from "../ThemeRegistry/theme";

import { Variant } from "@mui/material/styles/createTypography";
import { TypographyStyle } from "@mui/material/styles/createTypography";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import IconButton from "@mui/material/IconButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

interface CopiableTextProps {
  initValue: string;
  variant: Variant;
  fontWeight?: number;
}

const getCssProperties = (variant: Variant) => {
  return (theme.typography as Record<Variant, TypographyStyle>)[variant];
};

export const CopiableText: React.FC<CopiableTextProps> = ({
  initValue,
  variant,
  fontWeight,
}) => {
  const [open, setOpen] = useState(false);

  let sx = getCssProperties(variant);
  if (fontWeight) {
    sx = { ...sx, fontWeight: fontWeight };
  }

  async function copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
      handleTooltipOpen();
    } catch (error) {
      console.error("Error copying text to clipboard:", error);
    }
  }

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(true);
  };

  const handleClickAway = () => {
    handleTooltipClose();
  };

  return (
    <Box display="flex" flexDirection="row" alignItems="center">
      <TextField
        id="copiableText"
        variant="standard"
        defaultValue={initValue}
        fullWidth
        InputProps={{
          readOnly: true,
        }}
        sx={{
          "& input": {
            ...sx,
          },
        }}
      />
      <ClickAwayListener onClickAway={handleClickAway}>
        <Tooltip
          placement="top"
          PopperProps={{
            disablePortal: true,
          }}
          onOpen={handleTooltipOpen}
          onClose={handleTooltipClose}
          open={open}
          disableFocusListener
          disableHoverListener
          disableTouchListener
          title="Copied to clipboard"
        >
          <IconButton
            onClick={() => {
              copyToClipboard(initValue);
            }}
            sx={{ height: 32 }}
          >
            <ContentCopyIcon />
          </IconButton>
        </Tooltip>
      </ClickAwayListener>
    </Box>
  );
};
