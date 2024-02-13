"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePathname } from "next/navigation";
import { useSessionContext } from "@/context/SessionContext";

export const ApplySessionController = (props: { sessionId?: string }) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sessionContext = useSessionContext();

  const { sessionId } = props;
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

        const clientToken = sessionStorage.getItem(sessionId);
        if (clientToken) {
          sessionContext.loadSession(sessionId, clientToken);
        }
      }
      return () => {
        effectRan.current = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Since there's no UI to return, you can return null
  return null;
};
