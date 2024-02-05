import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import Link from "next/link";

export const GroupViewSmall = (props: { name: string; image: string }) => {
  const { name, image } = props;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
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

      <Link href="/creator/groups">
        <Box
          sx={{
            whiteSpace: "pre-wrap",
            width: "100%",
            wordBreak: "break-word",
          }}
        >
          <Typography
            variant="h6"
            align="center"
            sx={{
              mt: 1.5,
            }}
          >
            {name}
          </Typography>
        </Box>
        <Typography variant="subtitle2" align="center">
          switch
        </Typography>
      </Link>
    </Box>
  );
};
