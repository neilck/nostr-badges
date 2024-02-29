import { EditCardFrame } from "@/app/components/EditCardFrame";
import { BadgeEdit } from "@/app/creator/badges/[id]/badge/BadgeEdit";

export default function BadgePage({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <EditCardFrame
      instructions="Set the badge name, description, and image."
      docLink="help-pages/basic-badge"
    >
      <BadgeEdit docId={id} />
    </EditCardFrame>
  );
}
