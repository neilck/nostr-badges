import theme from "./ThemeRegistry/theme";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import Link from "next/link";
import MuiNextLink from "./items/MuiNextLink";

export const GroupViewSmall = (props: {
  name: string;
  image: string;
  event: string;
}) => {
  const { image, event } = props;
  let name = props.name;
  if (name.length > 24) {
    name = name.substring(0, 21) + "...";
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        p: 2,
      }}
    >
      {/* Circular avatar */}
      <Box
        component="img"
        src={image}
        sx={{
          width: 80,
          height: 80,
        }}
      ></Box>

      <Box
        sx={{
          whiteSpace: "pre-wrap",
          width: "100%",
          wordBreak: "break-word",
        }}
      >
        <Typography
          variant="body1"
          fontWeight={600}
          align="center"
          sx={{
            mt: 1.5,
          }}
        >
          {name}
        </Typography>
      </Box>
      {event != null && (
        <Box justifyContent="left">
          <MuiNextLink
            href={`${process.env.NEXT_PUBLIC_AKA_GET}/njump/${event}`}
            rel="noopener noreferrer"
            target="_blank"
          >
            <Typography
              variant="subtitle2"
              fontWeight="500"
              pl={0.7}
              sx={{
                "&:hover": { color: { color: theme.palette.blue.dark } },
              }}
            >
              apply link
            </Typography>
          </MuiNextLink>
        </Box>
      )}
    </Box>
  );
};
