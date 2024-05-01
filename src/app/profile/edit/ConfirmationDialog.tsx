import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Stack } from "@mui/material";

export interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  prompt: string;
  onClose: () => void;
  onConfirm: () => void;
  children?: React.ReactNode; // Allow any React node as children
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  open,
  title,
  prompt,
  onClose,
  onConfirm,
  children,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <Stack direction="column" width="320px">
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>{children}</DialogContent>

        <Typography variant="body2" sx={{ pl: 3, pr: 3 }}>
          {prompt}
        </Typography>
        <DialogActions
          sx={{ display: "flex", justifyContent: "center", pb: 3 }}
        >
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button onClick={onConfirm} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Stack>
    </Dialog>
  );
};
