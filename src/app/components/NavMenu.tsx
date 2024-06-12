import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

import Typography from "@mui/material/Typography";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";

export interface NavItem {
  name: string;
  path: string;
  isSelected: boolean;
}

export const userNavItems: NavItem[] = [
  { name: "My Profile", path: "/profile", isSelected: false },
  { name: "divider", path: "", isSelected: false },
  { name: "Developer Mode", path: "/creator", isSelected: false },
];

export const creatorNavItems: NavItem[] = [
  { name: "Home", path: "/creator", isSelected: false },
  { name: "Auto Badges", path: "/creator/badges", isSelected: false },
  { name: "Group Badges", path: "/creator/groups", isSelected: false },

  {
    name: "Nostr Relays",
    path: "/creator/developer/relays",
    isSelected: false,
  },
  { name: "divider", path: "", isSelected: false },
  { name: "Exit Developer Mode", path: "/profile", isSelected: false },
];

export const NavMenu = ({
  developerMode = false,
}: {
  developerMode: boolean;
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const navItems = developerMode ? creatorNavItems : userNavItems;

  const length = navItems.map((item) => {
    if (item.path == "/creator") {
      item.isSelected = pathname == item.path;
    } else {
      item.isSelected = pathname.startsWith(item.path);
    }
  });

  return (
    <>
      <MenuList>
        {navItems.map((item) =>
          item.name == "divider" ? (
            <Divider key={"divider"} />
          ) : (
            <MenuItem
              key={item.name}
              selected={item.isSelected}
              onClick={() => {
                router.push(item.path);
              }}
            >
              <Typography
                variant="body1"
                fontWeight={item.isSelected ? 800 : 500}
              >
                {item.name}
              </Typography>
            </MenuItem>
          )
        )}
      </MenuList>
    </>
  );
};
