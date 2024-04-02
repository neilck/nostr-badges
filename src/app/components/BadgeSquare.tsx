import theme from "./ThemeRegistry/theme";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Badge } from "@/data/badgeLib";
import MuiNextLink from "./items/MuiNextLink";
export const BadgeSquare = (props: { badge: Badge }) => {
  const badge = props.badge;
  let name = badge.name;
  if (name.length > 24) {
    name = name.substring(0, 21) + "...";
  }

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
      <Avatar
        variant="rounded"
        src={badge.thumbnail}
        sx={{
          width: 80,
          height: 80,
        }}
      ></Avatar>
      <Box width="100%" height="40px" alignItems="center" textAlign="center">
        <Typography
          variant="body1"
          fontWeight={600}
          sx={{
            mt: 1.5,
          }}
        >
          {name}
        </Typography>
      </Box>
      {badge.event && badge.event != null && (
        <Box justifyContent="left">
          <MuiNextLink
            href={`${process.env.NEXT_PUBLIC_AKA_GET}/njump/${badge.event}`}
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
              get badge link
            </Typography>
          </MuiNextLink>
        </Box>
      )}
    </Box>
  );
};

export default BadgeSquare;
