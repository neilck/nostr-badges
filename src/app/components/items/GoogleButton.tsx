"use client";

import { useState } from "react";
import ButtonBase from "@mui/material/ButtonBase";
import Image from "next/image";

export interface GoogleButtonProps {
  onClick: () => void;
  disabled: boolean;
}

export const GoogleButton = (props: GoogleButtonProps) => {
  const { disabled } = props;
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <ButtonBase
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={props.onClick}
      disabled={props.disabled}
      color="primary"
      sx={{
        width: "191px",
        height: "46px",
      }}
    >
      {disabled ? (
        <Image
          src="/btn_google_signin_dark_disabled_web.png"
          width={191}
          height={46}
          alt="Hovered Image"
        />
      ) : isHovered ? (
        <Image
          src="/btn_google_signin_dark_focus_web.png"
          width={191}
          height={46}
          alt="Hovered Image"
        />
      ) : (
        <Image
          src="/btn_google_signin_dark_normal_web.png"
          width={191}
          height={46}
          alt="Normal Image"
        />
      )}
    </ButtonBase>
  );
};

export default GoogleButton;
