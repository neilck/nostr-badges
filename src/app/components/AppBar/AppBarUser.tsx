import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { CapIcon } from "../items/CapIcon";

export const AppBarUser = (props: any) => {
  return (
    <Stack direction="column">
      {/* App Bar */}
      <Box
        sx={{
          height: "48px",
          width: "100%",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "grey.800",
          pl: "14px",
          pr: "10px",
          color: "white",
        }}
      >
        <Stack direction="row" alignItems="center" columnGap="10px">
          <CapIcon fontSize="medium" color="secondary" />
          <Box>
            <Typography>AKA Profiles</Typography>
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
};
