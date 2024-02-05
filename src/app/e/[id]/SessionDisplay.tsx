"use client";
import { useSessionContext } from "@/context/SessionContext";

export const SessionDisplay = () => {
  const sessionContext = useSessionContext();
  const session = sessionContext.state.sessionId;
  const currentBadge = sessionContext.state.currentBadge?.id;
  const clientToken = sessionContext.state.clientToken;

  const isDev = process.env.NODE_ENV == "development";

  return (
    <>
      {isDev && (
        <>
          <p>Server Session</p>
          <p>{`CurrentBadge: ${currentBadge}`}</p>
          <p>{`Session: ${session}`}</p>
          <p>{`ClientToken: ${clientToken}`}</p>
          <p>{`All Awarded: ${sessionContext.allBadgesAwarded()}`}</p>
        </>
      )}
    </>
  );
};
