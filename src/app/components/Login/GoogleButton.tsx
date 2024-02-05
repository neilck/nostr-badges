"use client";

import { useState } from "react";
import ButtonBase from "@mui/material/ButtonBase";
import debug from "debug";
import Image from "next/image";
import { useAccountContext } from "@/context/AccountContext";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "@/firebase-config";

const loginDebug = debug("aka:Login");
const provider = new GoogleAuthProvider();

export interface GoogleButtonProps {
  disabled: boolean;
}

export const GoogleButton = (props: GoogleButtonProps) => {
  const accountContext = useAccountContext();
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  const clickHandler = () => {
    accountContext.signOut();
    provider.setCustomParameters({
      prompt: "select_account",
    });
    signInWithPopup(auth, provider).catch((error) => {
      loginDebug("signInWithPopup error: %o", error);
    });
  };

  return (
    <ButtonBase
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={clickHandler}
      disabled={props.disabled}
      color="primary"
      sx={{
        width: "191px",
        height: "46px",
      }}
    >
      {isHovered ? (
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
