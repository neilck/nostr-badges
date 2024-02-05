import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export interface Tab {
  name: string;
  path: string;
}

export const TabNav = (props: { tabs: Tab[] }) => {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Box
      id="tabs"
      sx={{
        display: "flex",
        justifyContent: "flex-start",
        maxWidth: "400px",
        columnGap: 3,
        pt: 1.5,
        pb: 1.5,
      }}
    >
      {props.tabs.map((tab) => (
        <Box
          id={tab.name}
          key={tab.name}
          sx={{
            borderBottom: pathname.startsWith(tab.path) ? 2 : 0,
            "&:hover": { borderBottom: 1 },
          }}
        >
          <Link href={tab.path}>
            <Typography
              fontSize={14}
              fontWeight={pathname.startsWith(tab.path) ? 600 : 500}
              color="black"
            >
              {tab.name}
            </Typography>
          </Link>
        </Box>
      ))}
    </Box>
  );
};
