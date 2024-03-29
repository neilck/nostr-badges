import theme from "@/app/components/ThemeRegistry/theme";
import MuiNextLink from "./items/MuiNextLink";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";

import { BadgeViewEx } from "./BadgeViewEx";
import { Badge } from "@/data/badgeLib";

const getURL = process.env.NEXT_PUBLIC_AKA_GET;

export interface BadgeDialogProps {
  badge: Badge;
  open: boolean;
  onClose: () => void;
}

export function BadgeDialog(props: BadgeDialogProps) {
  const { badge, onClose, open } = props;
  let description = badge.description;
  if (description == "") description = "<description not set>";
  let imageUrl = badge.image;
  if (imageUrl == "") imageUrl = "/default/badge.png";

  return (
    <Dialog open={open} onClose={onClose}>
      <Box sx={{ pt: 2 }}>
        <BadgeViewEx
          name={badge.name}
          description={description}
          image={imageUrl}
          eventId={badge.event}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-evenly",
          alignItems: "center",
          mt: 1,
          mb: 2,
        }}
      >
        <Button onClick={onClose}>
          <Typography
            variant="subtitle2"
            align="center"
            fontWeight="600"
            sx={{
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
