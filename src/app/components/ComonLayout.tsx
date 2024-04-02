import theme from "@/app/components/ThemeRegistry/theme";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";

import { AkaAppBar } from "@/app/components/AkaAppBar";
import { Profile } from "@/app/components/Profile";
import { CreatorNavMenu } from "./NavMenu";
import { Footer } from "./Footer";

export const CommonLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      id="frame"
      sx={{
        flexGrow: 1,
        display: "flex",
        width: "100%",
        flexDirection: "column",
      }}
    >
      <Box id="header">
        <AkaAppBar />
      </Box>
      <Box
        id="main"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "row",
          flexWrap: "nowrap",
        }}
      >
        <Box
          id="leftMenu"
          sx={{
            display: { xs: "none", sm: "block" },
            width: "200px",
            flexGrow: 0,
            flexShrink: 1,
            bgcolor: theme.palette.common.white,
          }}
        >
          <Box
            id="leftMenuTopRow"
            sx={{
              display: "flex",
              width: "100%",
              height: "100%",
              justifyContent: "space-between",
            }}
          >
            <Box id="spacer"></Box>
            <Stack id="leftMain" direction="column">
              <Profile />
              <CreatorNavMenu />
            </Stack>
            <Divider orientation="vertical" variant="middle" flexItem />
          </Box>
        </Box>

        <Box
          id="content"
          display="flex"
          flexDirection="column"
          alignItems="center"
          sx={{
            flexGrow: 1,
            flexShrink: 1,
            bgcolor: theme.palette.background.default,
          }}
        >
          {children}
        </Box>
      </Box>
      {/* display at sm or larger */}
      <Box
        sx={{
          display: { xs: "none", sm: "flex" },
          height: "40px",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Footer />
      </Box>
    </Box>
  );
};
