import theme from "@/app/components/ThemeRegistry/theme";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";

import { GroupView } from "./GroupView";

import { Group } from "@/data/groupLib";

export interface GroupDialogProps {
  groupId: string;
  group: Group;
  open: boolean;
  onClose: () => void;
}

export function GroupDialog(props: GroupDialogProps) {
  const { groupId, group, open, onClose } = props;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>{group.name}</DialogTitle>
      <GroupView groupId={groupId} group={group} />
      <Box sx={{ mb: 2, display: "flex", justifyContent: "center" }}>
        <Button onClick={onClose}>
          <Typography
            variant="subtitle2"
            align="center"
            fontWeight="600"
            sx={{
              pt: 1,
              width: "160px",
              "&:hover": { color: { color: theme.palette.blue.dark } },
            }}
          >
            CLOSE
          </Typography>
        </Button>
      </Box>
    </Dialog>
  );
}
