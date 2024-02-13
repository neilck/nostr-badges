"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePathname } from "next/navigation";
import { useSessionContext } from "@/context/SessionContext";

export const SessionController = (props: {
  badgeId: string;
  naddr: string;
  sessionId?: string;
  state?: string;
  pubkey?: string;
  isGroup?: boolean;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sessionContext = useSessionContext();

  const { badgeId, naddr, sessionId, state, pubkey, isGroup } = props;
  const session = sessionContext.state.session;

  const effectRan = useRef(false);
  useEffect(() => {
    // prevent 2nd session creation due to Next.js React.Strict in dev mode
    if (
      !effectRan.current ||
      (effectRan.current && process.env.NODE_ENV !== "development")
    ) {
      if (sessionId) {
        console.log("loading sessionId: " + sessionId);
        try {
          const clientToken = sessionStorage.getItem(sessionId);
          if (clientToken) {
            sessionContext.loadSession(sessionId, clientToken);
          } else {
            start();
          }
        } catch {
          console.log(
            "Error loading session from session storage, starting new session"
          );
          start();
        }
      } else {
        start();
      }

      return () => {
        effectRan.current = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const start = async () => {
    if (session == null) {
      console.log("starting session");
      const result = await sessionContext.startSession({
        type: isGroup ? "GROUP" : "BADGE",
        docId: badgeId,
        naddr: naddr,
        state: state,
        pubkey: pubkey,
      });
      // add sessionId to URL
      if (result?.sessionId) {
        const current = new URLSearchParams(Array.from(searchParams.entries()));
        current.set("session", result?.sessionId);
        const search = `?${current.toString()}`;
        router.replace(`${pathname}${search}`);
      }
    }
  };

  // Since there's no UI to return, you can return null
  return null;
};
