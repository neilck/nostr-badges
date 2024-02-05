"use client";

import theme from "@/app/components/ThemeRegistry/theme";
import Link from "next/link";
import Typography from "@mui/material/Typography";

export const DocLink = (props: { doc: string; children: React.ReactNode }) => {
  const host = process.env.NEXT_PUBLIC_AKA_DOCHOST;

  return (
    <Link
      href={`${host}/${props.doc}`}
      rel="noopener noreferrer"
      target="_blank"
    >
      <Typography variant="body2" color={theme.palette.primary.main}>
        {props.children}
      </Typography>
    </Link>
  );
};
