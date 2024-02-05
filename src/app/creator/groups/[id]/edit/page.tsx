"use client";

import { EditCardFrame } from "@/app/components/EditCardFrame";
import { GroupEdit } from "./GroupEdit";

export default function EditGroup({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <EditCardFrame instructions="Set the group name, description, and image.">
      {id && <GroupEdit groupId={id} />}
    </EditCardFrame>
  );
}
