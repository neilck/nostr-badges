export enum SocialsType {
  youtube = "youtube",
  twitter = "twitter",
}

export enum SocialsState {
  verified = "verified",
  available = "add..",
  comingsoon = "coming soon...",
}

import { Typography } from "@mui/material";
import Box from "@mui/material/Box";
export const SocialsButton = ({
  type,
  state,
}: {
  type: SocialsType;
  state: SocialsState;
}) => {
  const imageSrc = `/socials/${type}.svg`;
  let hoverOpacity = 1;
  switch (state) {
    case SocialsState.verified:
      hoverOpacity = 1;
      break;
    case SocialsState.available:
      hoverOpacity = 0.75;
      break;
    case SocialsState.comingsoon:
      hoverOpacity = 0.5;
  }

  return (
    <Box
      component="img"
      src={imageSrc}
      alt={type}
      sx={{
        width: "80px",
        height: "80px",
        opacity: state == SocialsState.verified ? 1 : 0.5,
        pointerEvents: "auto",
        transition: "opacity 0.3s",
        "&:hover": {
          opacity: hoverOpacity,
        },
      }}
    />
  );
};
