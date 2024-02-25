"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { usePathname } from "next/navigation";
import { useSessionContext } from "@/context/SessionContext";

export const SessionController = (props: {
  badgeId: string;
  naddr: string;
  state?: string;
  pubkey?: string;
  isGroup?: boolean;
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
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
      init();

      return () => {
        effectRan.current = true;
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const init = async () => {
    const exists = await sessionContext.resumeSession();
    if (!exists) {
      console.log("starting session");
      const result = await sessionContext.startSession({
        type: isGroup ? "GROUP" : "BADGE",
        docId: badgeId,
        state: state,
        pubkey: pubkey,
      });
      console.log(`start session result ${JSON.stringify(result)}`);
    }
  };

  // Since there's no UI to return, you can return null
  return null;
};
