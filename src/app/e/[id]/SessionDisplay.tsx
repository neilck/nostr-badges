"use client";
import { useSessionContext } from "@/context/SessionContext";

export const SessionDisplay = () => {
  const sessionContext = useSessionContext();
  const sessionId = sessionContext.state.sessionId;
  const state = sessionContext.getSessionState();
  const currentBadge = sessionContext.state.currentId;
  const clientToken = sessionContext.state.clientToken;
  const session = JSON.stringify(sessionContext.state.session);

  const isDev = process.env.NODE_ENV == "development";

  return (
    <>
      {isDev && (
        <>
          <p>Session</p>
          <p>{`SessionId: ${session}`}</p>
          <p>{`State: ${state}`}</p>
          <p>{`CurrentBadge: ${currentBadge}`}</p>
          <p>{`ClientToken: ${clientToken}`}</p>
          <p>{`Session: ${session}`}</p>
        </>
      )}
    </>
  );
};
