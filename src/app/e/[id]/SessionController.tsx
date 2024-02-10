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
  const session = sessionContext.state.session;

  const effectRan = useRef(false);
  useEffect(() => {
    // prevent 2nd session creation due to Next.js React.Strict in dev mode
    if (
      !effectRan.current ||
      (effectRan.current && process.env.NODE_ENV !== "development")
    ) {
      load();

      return () => {
        effectRan.current = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const load = async () => {
    if (session == null) {
      console.log("starting session");
      await sessionContext.startSession({
        type: isGroup ? "GROUP" : "BADGE",
        docId: badgeId,
        naddr: naddr,
        state: state,
        pubkey: pubkey,
      });
    }
  };

  // Since there's no UI to return, you can return null
  return null;
};
