"use client";

import { useEffect, useRef } from "react";
import { useSessionContext } from "@/context/SessionContext";

export const SessionController = (props: {
  badgeId: string;
  naddr: string;
  state?: string;
  pubkey?: string;
  isGroup?: boolean;
}) => {
  const sessionContext = useSessionContext();

  const { badgeId, naddr, state, pubkey, isGroup } = props;

  const effectRan = useRef(false);
  useEffect(() => {
    // prevent 2nd session creation due to Next.js React.Strict in dev mode
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
    const exists = await sessionContext.resumeSession(naddr);
    if (!exists) {
      const result = await sessionContext.startSession(naddr, {
        type: isGroup ? "GROUP" : "BADGE",
        docId: badgeId,
        state: state,
        pubkey: pubkey,
      });
    }
  };

  // Since there's no UI to return, you can return null
  return null;
};
