import Typography from "@mui/material/Typography";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export interface NavItem {
  name: string;
  path: string;
}

export const creatorNavItems: NavItem[] = [
  { name: "Groups", path: "/creator/groups" },
  { name: "Hosted Badges", path: "/creator/badges" },
  { name: "Nostr Settings", path: "/creator/developer/keypair" },
];

export const CreatorNavMenu = () => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      <MenuList>
        {creatorNavItems.map((item) =>
          item.name == "divider" ? (
            <Divider key={"divider"} />
          ) : (
            <MenuItem
              key={item.name}
              selected={pathname.startsWith(item.path)}
              onClick={() => {
                router.push(item.path);
              }}
            >
              <Typography variant="body2">{item.name}</Typography>
            </MenuItem>
          )
        )}
      </MenuList>
    </>
  );
};
