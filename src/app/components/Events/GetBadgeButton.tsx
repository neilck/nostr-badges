"use client";

import { useRouter } from "next/navigation";
import theme from "../ThemeRegistry/theme";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

export const GetBadgeButton = (props: { buttonLabel: string; url: string }) => {
  const { buttonLabel, url } = props;
  const router = useRouter();
  const onClick = async () => {
    router.push(url);
  };

  return (
    <Button
      onClick={onClick}
      variant="contained"
      color="secondary"
      sx={{
        width: "80%",
        color: theme.palette.grey[200],
        backgroundColor: theme.palette.orange.main,
        "&:hover": {
          color: theme.palette.grey[100],
          backgroundColor: theme.palette.orange.dark,
        },
      }}
    >
      <Typography variant="body2" align="center" fontWeight="800">
        {buttonLabel}
      </Typography>
    </Button>
  );
};
