"use client";

import { EditCardFrame } from "@/app/components/EditCardFrame";
import { MemberEdit } from "./MemberEdit";

export default function GroupMembers({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <EditCardFrame instructions="Members of this group.">
      {id && <MemberEdit groupId={id} />}
    </EditCardFrame>
  );
}
