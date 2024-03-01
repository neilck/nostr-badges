import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { CapIcon } from "./items/CapIcon";

export const AkaAppBarEmpty = (props: any) => {
  let name = "AKA Profiles";

  let iconColor = "orange.main";
  let bgColor = "grey.800";

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
          bgcolor: bgColor,
          pl: "14px",
          pr: "10px",
        }}
      >
        <Stack direction="row" alignItems="center" columnGap="10px">
          <CapIcon fontSize="medium" sx={{ color: iconColor }} />
          {/* display at sm and smaller */}
          <Box
            sx={{
              display: { xs: "block", sm: "none" },
            }}
          >
            <Typography
              sx={{
                color: "white",
              }}
            >
              {name}
            </Typography>
          </Box>
          {/* display at md and larger */}
          <Box
            sx={{
              display: { xs: "none", sm: "block" },
            }}
          >
            <Typography
              sx={{
                color: "grey.300",
              }}
            >
              {name}
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
};
