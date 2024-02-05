import Link from "@mui/material/Link";
import { LinkProps } from "@mui/material";
import NextLink from "next/link";

export default function MuiNextLink(props: LinkProps<"a">) {
  return <Link component={NextLink} underline="none" {...props} />;
}
