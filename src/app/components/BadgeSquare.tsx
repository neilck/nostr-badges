import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Badge } from "@/data/badgeLib";

export const BadgeSquare = (props: { badge: Badge }) => {
  const badge = props.badge;

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
      <Box width="100%" height="40px">
        <Typography
          variant="h6"
          sx={{
            mt: 1.5,
          }}
        >
          {badge.name}
        </Typography>
      </Box>
    </Box>
  );
};

export default BadgeSquare;
