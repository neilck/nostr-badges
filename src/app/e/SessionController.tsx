"use client";

import { useState, useEffect, useRef } from "react";
import {
  useRouter,
  useParams,
  useSearchParams,
  usePathname,
} from "next/navigation";
import { useSessionContext } from "@/context/SessionContext";
import { SessionState } from "@/context/SessionHelper";
import { Session } from "inspector";

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

  const startUrl = `/e/${naddr}`;
  const [progressUrl, setProgressUrl] = useState(startUrl);
  const [acceptUrl, setAcceptUrl] = useState("");
  const [publishedUrl, setPublishedUrl] = useState("");

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
    let sessionId = sessionStorage.getItem(naddr);

    let needsLoad = true;
    if (
      sessionContext.state.sessionId == sessionId &&
      sessionContext.state.sessionState != SessionState.start
    ) {
      needsLoad = false;
    }

    if (needsLoad) {
      if (sessionId) {
        exists = await sessionContext.resumeSession(sessionId);
      }

      if (!exists && pathname.startsWith(startUrl)) {
        if (badgeId) {
          const result = await sessionContext.startSession(naddr, {
            type: isGroup ? "GROUP" : "BADGE",
            docId: badgeId,
            state: state,
          });
          if (result) {
            // save session Id to sessionStorage
            sessionStorage.setItem(naddr, result.sessionId);
            sessionId = result.sessionId;
          }
        }
      }
    }

    const sParams = new URLSearchParams();
    sParams.set("session", sessionId ?? "error");
    setAcceptUrl(`/e/${naddr}/accept?${sParams.toString()}`);
    setPublishedUrl(`/e/${naddr}/awarded?${sParams.toString()}`);
  };

  useEffect(() => {
    const state = sessionContext.state.sessionState;
    switch (state) {
      case SessionState.loaded:
        router.push(progressUrl);
        break;
      case SessionState.filled:
      case SessionState.identified: {
        if (!pathname.startsWith(acceptUrl)) {
          router.push(acceptUrl);
          break;
        }
      }

      case SessionState.published: {
        if (!pathname.startsWith(publishedUrl)) {
          router.push(publishedUrl);
        }
      }
    }
  }, [sessionContext.state]);

  // Since there's no UI to return, you can return null
  return null;
};
