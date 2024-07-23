import React from "react";
import theme from "../components/ThemeRegistry/theme";
import { Box, Typography } from "@mui/material";
import AddCircleOutline from "@mui/icons-material/AddCircleOutline";

interface AddProps {
  label: string; // Object containing data
  onClick?: () => void;
}

export const Add: React.FC<AddProps> = ({ label, onClick }) => {
  return (
    <Box
      sx={{
        display: "flex",
        columnGap: 1,
        color: theme.palette.blue.main,
        pt: 1,
        pb: 1,
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      <AddCircleOutline />
      <Typography variant="body1" fontWeight={600}>
        {label}
      </Typography>
    </Box>
  );
};
