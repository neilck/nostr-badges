"use client";

import theme from "@/app/components/ThemeRegistry/theme";
import debug from "debug";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccountContext } from "../../context/AccountContext";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import MenuIcon from "@mui/icons-material/Menu";
import { CapIcon } from "./items/CapIcon";
import { auth } from "@/firebase-config";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { NavItem, creatorNavItems } from "./NavMenu";

export const AkaAppBar = (props: any) => {
  const appBarDebug = debug("aka:AkaAppBar");
  const router = useRouter();
  const accountContext = useAccountContext();
  const profile = accountContext.state.currentProfile;

  const { loading, account, creatorMode, currentProfile } =
    accountContext.state;

  const signOut = accountContext.signOut;

  let name = "AKA Profiles";
  let username = profile?.displayName;
  if (!username || username == "") username = profile?.name;
  if (!username || username == "") username = account?.uid;
  if (!username || username == "") username = "My Profile";

  let iconColor = theme.palette.orange.main;
  let bgColor = theme.palette.grey[800];

  const hasAccount = account && account.uid != "";

  const provider = new GoogleAuthProvider();
  const isDev = process.env.NODE_ENV == "development";

  const homeClicked = () => {
    if (hasAccount) {
      router.push("/creator");
    }
  };

  // menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClickLogout = () => {
    signOut();
    handleClose();
  };

  const signedInMenuItems = () => {
    return (
      <>
        {creatorNavItems.map((item: NavItem) =>
          item.name == "divider" ? (
            <Divider key={"divider"} />
          ) : (
            <MenuItem
              key={item.name}
              onClick={() => {
                router.push(item.path);
              }}
              sx={{
                display: { xs: "flex", sm: "none" },
              }}
            >
              {item.name}
            </MenuItem>
          )
        )}
        {creatorNavItems.length > 0 && (
          <Divider
            sx={{
              display: { xs: "flex", sm: "none" },
            }}
          />
        )}

        <MenuItem onClick={handleClickLogout}>log out</MenuItem>
      </>
    );
  };

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
          <CapIcon
            fontSize="medium"
            onClick={homeClicked}
            sx={{ color: iconColor }}
          />
          {/* display at sm and smaller */}
          <Box
            sx={{
              display: { xs: "block", sm: "none" },
            }}
          >
            {hasAccount && (
              <Typography
                sx={{
                  color: "white",
                }}
              >
                {username}
              </Typography>
            )}
            {!hasAccount && (
              <Typography
                sx={{
                  color: "white",
                }}
              >
                {name}
              </Typography>
            )}
          </Box>
          {/* display at md and larger */}
          <Box
            sx={{
              display: { xs: "none", sm: "block" },
            }}
          >
            <Typography
              sx={{
                color: theme.palette.grey[300],
              }}
            >
              {name}
            </Typography>
          </Box>
        </Stack>

        {hasAccount && (
          <>
            <IconButton
              size="large"
              edge="start"
              id="menu-button"
              aria-label="menu"
              aria-controls={open ? "basic-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open ? "true" : undefined}
              onClick={handleClick}
              sx={{ color: theme.palette.common.white }}
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              disableScrollLock={true}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                "aria-labelledby": "menu-button",
              }}
            >
              {signedInMenuItems().props.children}
            </Menu>
          </>
        )}
      </Box>
    </Stack>
  );
};
