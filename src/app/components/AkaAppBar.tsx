"use client";

import theme from "@/app/components/ThemeRegistry/theme";
import debug from "debug";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccountContext } from "../../context/AccountContext";

import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import MenuIcon from "@mui/icons-material/Menu";
import { CapIcon } from "./items/CapIcon";
import { GoogleAuthProvider } from "firebase/auth";
import { NavItem, creatorNavItems, userNavItems } from "./NavMenu";

export const AkaAppBar = ({
  developerMode = false,
}: {
  developerMode: boolean;
}) => {
  const appBarDebug = debug("aka:AkaAppBar");
  const router = useRouter();
  const accountContext = useAccountContext();

  const profile = accountContext.state.currentProfile;
  const navItems = developerMode ? creatorNavItems : userNavItems;
  const homePath = developerMode ? "/creator" : "/profile";

  const { loading, account, currentProfile } = accountContext.state;

  const signOut = accountContext.signOut;

  let name = "AKA Profiles (beta v0.3.0)";
  if (developerMode) {
    name = "Developer Mode (beta v0.3.0)";
  }
  let username = profile?.displayName;
  if (!username || username == "") username = profile?.name;
  if (!username || username == "") username = account?.uid;
  if (!username || username == "") username = "My Profile";

  let iconColor = theme.palette.orange.main;
  let bgColor = developerMode
    ? theme.palette.blue.dark
    : theme.palette.grey[800];

  const hasAccount = account && account.uid != "";

  const provider = new GoogleAuthProvider();
  const isDev = process.env.NODE_ENV == "development";

  const homeClicked = () => {
    if (hasAccount) {
      router.push(homePath);
    }
  };

  // menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [anchorEl2, setAnchorEl2] = useState<null | HTMLElement>(null);

  const open = Boolean(anchorEl);
  const open2 = Boolean(anchorEl2);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleClick2 = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const handleClickLogout = () => {
    signOut();
    handleClose();
  };

  const leftMenuItems = () => {
    return (
      <>
        {navItems.map((item: NavItem) =>
          item.name == "divider" ? (
            <Divider key={"divider"} />
          ) : (
            <MenuItem
              key={item.name}
              onClick={() => {
                router.push(item.path);
              }}
            >
              <Typography variant="subtitle2"> {item.name}</Typography>
            </MenuItem>
          )
        )}
      </>
    );
  };

  const rightMenuItems = () => {
    return (
      <>
        <MenuItem key="addprofile" onClick={() => {}}>
          <Typography variant="subtitle2">Add profile</Typography>
        </MenuItem>
        <MenuItem key="signout" onClick={handleClickLogout}>
          <Typography variant="subtitle2">Sign out</Typography>
        </MenuItem>
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
        <Stack direction="row" alignItems="center" columnGap="2px">
          {hasAccount && (
            <Box
              sx={{
                display: { xs: "flex", sm: "none" },
              }}
            >
              <IconButton
                size="large"
                edge="start"
                id="menu-button"
                aria-label="leftMenu"
                aria-controls={open ? "basic-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={open ? "true" : undefined}
                onClick={handleClick}
                sx={{ color: theme.palette.common.white }}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="leftMenu"
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
                {leftMenuItems().props.children}
              </Menu>
            </Box>
          )}
          <CapIcon
            fontSize="medium"
            onClick={homeClicked}
            sx={{ color: iconColor, mr: "6px" }}
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
        {profile && (
          <>
            <IconButton
              size="large"
              edge="start"
              id="menu-button"
              aria-label="rightMenu"
              aria-controls={open2 ? "basic-menu" : undefined}
              aria-haspopup="true"
              aria-expanded={open2 ? "true" : undefined}
              onClick={handleClick2}
              sx={{ color: theme.palette.common.white }}
            >
              <Avatar
                src={profile.image}
                sx={{
                  width: 34,
                  height: 34,
                }}
              ></Avatar>
            </IconButton>
            <Menu
              id="rightMenu"
              anchorEl={anchorEl2}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              disableScrollLock={true}
              open={open2}
              onClose={handleClose2}
              MenuListProps={{
                "aria-labelledby": "menu-button",
              }}
            >
              {rightMenuItems().props.children}
            </Menu>
          </>
        )}
      </Box>
    </Stack>
  );
};
