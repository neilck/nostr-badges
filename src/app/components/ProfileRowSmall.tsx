import { SxProps, Theme } from "@mui/material";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export type Item = {
  id: string;
  name?: string;
  displayName?: string;
  image?: string;
};

export const ProfileRowSmall = (item: Item) => {
  const id = item.id;
  const name = item.name ? item.name.substring(0, 20) : "";
  const displayName = item.displayName ? item.displayName.substring(0, 20) : "";
  const image = item.image;

  const defaultSx = {
    border: 0,
    p: 0,
    height: "40px",
    "&:hover": { backgroundColor: "grey.200" },
  };

  return (
    <Card variant="outlined" sx={{ ...defaultSx }}>
      <Box sx={{ display: "flex" }}>
        <Avatar
          src={image}
          sx={{
            width: 34,
            height: 34,
            mt: 0.5,
          }}
        ></Avatar>

        <Box sx={{ width: 160, ml: 2, maxHeight: 80 }}>
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
                variant="subtitle2"
                fontWeight={600}
                sx={{ minWidth: 0 }}
              >
                {name}
              </Typography>
            </div>

            <Typography
              variant="subtitle2"
              sx={{ whiteSpace: "pre-wrap", lineHeight: "1em" }}
            >
              {displayName}
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Card>
  );
};
