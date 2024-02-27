"use client";

import { useEffect, useRef } from "react";
import { useSessionContext } from "@/context/SessionContext";

export const SessionController = () => {
  const sessionContext = useSessionContext();

  const session = sessionContext.state.session;

  const effectRan = useRef(false);
  useEffect(() => {
    if (
      !effectRan.current ||
      (effectRan.current && process.env.NODE_ENV !== "development")
    ) {
      init();

      return () => {
        effectRan.current = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const init = async () => {
    await sessionContext.resumeSession();
  };

  // Since there's no UI to return, you can return null
  return null;
};
