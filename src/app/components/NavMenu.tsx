import Typography from "@mui/material/Typography";
import MenuList from "@mui/material/MenuList";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

export interface NavItem {
  name: string;
  path: string;
  isSelected: boolean;
}

export const creatorNavItems: NavItem[] = [
  { name: "Group Badges", path: "/creator/groups", isSelected: false },
  { name: "Hosted Badges", path: "/creator/badges", isSelected: false },
  {
    name: "Nostr Settings",
    path: "/creator/developer/keypair",
    isSelected: false,
  },
];

export const CreatorNavMenu = () => {
  const router = useRouter();
  const pathname = usePathname();

  const length = creatorNavItems.map((item) => {
    item.isSelected = pathname.startsWith(item.path);
  });

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
              <Typography
                variant="body2"
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
