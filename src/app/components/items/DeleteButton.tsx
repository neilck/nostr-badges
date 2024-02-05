"use client";

import theme from "@/app/components/ThemeRegistry/theme";
import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import Tooltip from "@mui/material/Tooltip";
import ClickAwayListener from "@mui/material/ClickAwayListener";
export const DeleteButton = (props: { onClick?: () => void }) => {
  const [secondClick, setSecondClick] = useState(false);
  const [color, setColor] = useState<
    | "primary"
    | "warning"
    | "inherit"
    | "default"
    | "secondary"
    | "error"
    | "info"
    | "success"
  >("inherit");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setColor(secondClick ? "error" : "inherit");
  }, [secondClick]);

  const onClick = () => {
    if (!secondClick) {
      setSecondClick(true);
      handleTooltipOpen();
      return;
    }
    if (props.onClick) props.onClick();
  };

  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(true);
  };

  const handleClickAway = () => {
    setSecondClick(false);
    handleTooltipClose();
  };

  return (
    <Box
      sx={{
        color: theme.palette.grey[400],
        "&:hover": { color: theme.palette.grey[800] },
      }}
    >
      <ClickAwayListener onClickAway={handleClickAway}>
        <div>
          <Tooltip
            PopperProps={{
              disablePortal: true,
            }}
            onOpen={handleTooltipOpen}
            onClose={handleTooltipClose}
            open={open}
            disableFocusListener
            disableHoverListener
            disableTouchListener
            title="Click again to delete"
          >
            <IconButton
              color={color}
              aria-label="delete"
              onClick={onClick}
              sx={{ height: 32 }}
            >
              <DeleteIcon />
            </IconButton>
          </Tooltip>
        </div>
      </ClickAwayListener>
    </Box>
  );
};
