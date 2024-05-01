import { SxProps, Theme } from "@mui/material";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { Profile } from "@/data/profileLib";

export const ProfileDisplay = ({ profile }: { profile: Profile }) => {
  const id = profile.publickey;
  const name = profile.name ? profile.name : "";
  const displayName = profile.displayName ? profile.displayName : "";
  const about = profile.about ? profile.about : "";
  const image = profile.image;

  const defaultSx = {
    border: 0,
    p: 0,
  };

  return (
    <Card variant="outlined" sx={{ ...defaultSx }}>
      <Box sx={{ display: "flex" }}>
        <Avatar
          src={image}
          sx={{
            width: 38,
            height: 38,
            mt: 0.5,
          }}
        ></Avatar>

        <Box sx={{ width: "100%", ml: 2, maxHeight: 80 }}>
          <Stack direction="column" justifyContent="left" alignItems="left">
            <div
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                width: "16rem",
              }}
            >
              <Typography
                noWrap
                variant="body1"
                fontWeight={600}
                sx={{ minWidth: 0 }}
              >
                {displayName != "" ? displayName : name}
              </Typography>
            </div>
            <Typography
              variant="body2"
              sx={{ whiteSpace: "pre-wrap", lineHeight: "1em" }}
            >
              {displayName != "" ? name : ""}
            </Typography>
          </Stack>
        </Box>
      </Box>
      <Typography
        variant="subtitle2"
        sx={{ whiteSpace: "pre-wrap", lineHeight: "1.2em", pt: 1 }}
      >
        {about}
      </Typography>
    </Card>
  );
};
