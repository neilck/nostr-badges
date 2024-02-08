"use client";

import { FrameDialog } from "./FrameDialog";
import { Badge } from "@/data/badgeLib";
import { useSessionContext } from "@/context/SessionContext";
import { useEffect } from "react";

export const SessionFrameDialog = () => {
  const sessionContext = useSessionContext();

  const current = sessionContext.state.current;
  const sessionId = sessionContext.state.sessionId
    ? sessionContext.state.sessionId
    : "";

  const onClose = () => {
    // frameDialog closes when no currentbadge detected
    sessionContext.dispatch({ type: "setCurrentId", currentId: "" });
    sessionContext.reload();
  };

  if (current) {
    return (
      <FrameDialog
        identifier={current.identifier}
        title={current.title}
        description={current.description}
        image={current.image}
        applyURL={current.applyURL}
        sessionId={current.sessionId}
        awardtoken={current.awardtoken}
        onClose={onClose}
        show={current != null}
      />
    );
  } else {
    return <></>;
  }
};
