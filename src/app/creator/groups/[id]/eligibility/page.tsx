"use client";

import { EditCardFrame } from "@/app/components/EditCardFrame";
import { GroupEligibilityEdit } from "@/app/creator/groups/[id]/eligibility/GroupEligibilityEdit";

export default function EligibilityGroup({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  return (
    <EditCardFrame instructions="Add the required badges to become a member.">
      {id && <GroupEligibilityEdit groupId={id} />}
    </EditCardFrame>
  );
}
