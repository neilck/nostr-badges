"use client";

import { useState, useEffect, useRef } from "react";
import {
  useRouter,
  useParams,
  useSearchParams,
  usePathname,
} from "next/navigation";
import { useSessionContext } from "@/context/SessionContext";

const PATH_ACCEPT = "/accept";
const PATH_AWARDED = "/awarded";

export const SessionController = (props: {
  badgeId?: string;
  isGroup?: boolean;
}) => {
  const { badgeId, isGroup } = props;

  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const sessionContext = useSessionContext();

  const naddr = params.id;
  const state = searchParams.get("state") ?? undefined;
  let pubkey = searchParams.get("pubkey") ?? undefined;

  const startUrl = `/e/${naddr}`;
  const awardedUrl = `/e/${naddr}/awarded`;
  const [acceptUrl, setAcceptUrl] = useState("");

  console.log({
    badgeId,
    isGroup,
    naddr,
    state,
    pubkey,
    pathname,
    startUrl,
    acceptUrl,
    awardedUrl,
  });

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
    let exists = false;
    const sessionId = sessionStorage.getItem(naddr);
    if (sessionId) {
      exists = await sessionContext.resumeSession(sessionId);
    }

    if (!exists && pathname.startsWith(startUrl)) {
      if (badgeId) {
        const result = await sessionContext.startSession(naddr, {
          type: isGroup ? "GROUP" : "BADGE",
          docId: badgeId,
          state: state,
          pubkey: pubkey,
        });
        if (result) {
          // save session Id to sessionStorage
          sessionStorage.setItem(naddr, result.sessionId);
        }
      }
    }

    const sParams = new URLSearchParams();
    sParams.set("session", sessionContext.state.sessionId ?? "error");
    const acceptUrl = `/e/${naddr}/accept?${searchParams.toString()}`;
    setAcceptUrl(acceptUrl);
  };

  // Since there's no UI to return, you can return null
  return null;
};
