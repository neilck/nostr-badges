import theme from "../ThemeRegistry/theme";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export const AddOutline = (props: {
  name: string;
  onClick: (name: string) => void;
}) => {
  return (
    <Box
      component="button"
      onClick={() => {
        props.onClick(props.name);
      }}
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        border: 1,
        borderStyle: "dashed",
        borderColor: "rgb(23, 68, 150)",
        width: "260px",
        height: "50px",
        backgroundColor: "transparent",
        "&:hover": {
          backgroundColor: theme.palette.grey[200],
          fontWeight: 600,
          cursor: "pointer",
        },
      }}
    >
      <Typography variant="body2" textAlign="center" color="rgb(23, 68, 150)">
        {props.name}
      </Typography>
    </Box>
  );
};
