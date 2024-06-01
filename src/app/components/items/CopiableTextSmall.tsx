"use client";

import { Variant } from "@mui/material/styles/createTypography";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import IconButton from "@mui/material/IconButton";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import MuiNextLink from "./MuiNextLink";
interface CopiableTextProps {
  children: React.ReactNode;
  copyText: string;
}

export const CopiableTextSmall: React.FC<CopiableTextProps> = ({
  children,
  copyText,
}) => {
  const [open, setOpen] = useState(false);

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
      <MuiNextLink href={copyText} rel="noopener noreferrer" target="_blank">
        {children}
      </MuiNextLink>

      <ClickAwayListener onClickAway={handleClickAway}>
        <Tooltip
          placement="right"
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
              copyToClipboard(copyText);
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
