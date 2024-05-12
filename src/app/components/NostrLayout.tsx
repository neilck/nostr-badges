import theme from "@/app/components/ThemeRegistry/theme";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";

import { AkaAppBar } from "@/app/components/AkaAppBar";
import { Profile } from "@/app/components/Profile";
import { NavMenu } from "./NavMenu";
import { Tab, TabNav } from "@/app/components/TabNav";

const tabs: Tab[] = [
  { name: "ISSUER KEY", path: "/creator/developer/keypair" },
  { name: "RELAYS", path: "/creator/developer/relays" },
  { name: "API KEY", path: "/creator/developer/apikey" },
];

export const NostrLayout = ({ children }: { children: React.ReactNode }) => {
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
        <AkaAppBar developerMode={true} />
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
            width: "240px",
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
              <Link href="/profile">
                <Profile />
              </Link>
              <NavMenu developerMode={true} />
            </Stack>
            <Divider orientation="vertical" variant="middle" flexItem />
          </Box>
        </Box>

        <Box
          id="contentMain"
          display="flex"
          flexDirection="column"
          alignItems="center"
          sx={{
            flexGrow: 1,
            flexShrink: 1,
            bgcolor: theme.palette.common.white,
          }}
        >
          <Box
            id="content"
            display="flex"
            flexDirection="column"
            alignItems="strech"
            maxWidth={theme.breakpoints.values.md}
          >
            <Box sx={{ pt: 1.5, pl: 3 }}>
              <Typography variant="h6">Nostr Settings</Typography>
              <TabNav tabs={tabs} />
            </Box>
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};
