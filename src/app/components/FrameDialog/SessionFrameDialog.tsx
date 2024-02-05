"use client";

import { FrameDialog } from "./FrameDialog";
import { useSessionContext } from "@/context/SessionContext";

export const SessionFrameDialog = () => {
  const sessionContext = useSessionContext();

  const badge = sessionContext.state.currentBadge;
  const sessionId = sessionContext.state.sessionId
    ? sessionContext.state.sessionId
    : "";
  const updateCurrentBadgeById = sessionContext.updateCurrentBadgeById;
  const reload = sessionContext.reload;

  const onClose = () => {
    // frameDialog closes when no currentbadge detected
    if (updateCurrentBadgeById) updateCurrentBadgeById("");
    // refresh sesison from DB in case iframe app has awarded badge
    if (reload) reload();
  };

  if (badge) {
    return (
      <FrameDialog
        identifier={badge.identifier}
        title={badge.name}
        description={badge.description}
        image={badge.image}
        applyURL={badge.applyURL}
        sessionId={sessionId}
        awardtoken={badge.awardtoken}
        onClose={onClose}
        show={badge != null}
      />
    );
  } else {
    return <></>;
  }
};
