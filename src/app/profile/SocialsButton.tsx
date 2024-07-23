import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Socials } from "@/data/akaBadgeLib";

const SocialsName: { [key in Socials]: string } = {
  [Socials.YouTube]: "YouTube",
  [Socials.Twitter]: "coming soon...",
  [Socials.Facebook]: "coming soon...",
  [Socials.Instagram]: "coming soon...",
};

interface SocialsButtonProps {
  type: Socials; // Object containing data
  onClick?: () => void;
}

export const SocialsButton: React.FC<SocialsButtonProps> = ({
  type,
  onClick,
}) => {
  const imageSrc = `/socials/${type}.svg`;
  let hoverOpacity = onClick ? 1 : 0.75;
  let label = "";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: 0.75,
        pointerEvents: onClick ? "auto" : "none",
        transition: "opacity 0.3s",
        "&:hover": {
          opacity: hoverOpacity,
        },
      }}
      onClick={onClick}
    >
      <Box
        component="img"
        src={imageSrc}
        alt={type}
        sx={{
          border: 0,
          width: "80px",
          height: "80px",
        }}
      />
      <Typography variant="subtitle2" fontWeight={600} lineHeight={1.5}>
        {SocialsName[type]}
      </Typography>
    </Box>
  );
};
