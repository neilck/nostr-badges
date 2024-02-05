import { DataEdit } from "@/app/creator/badges/[id]/data/DataEdit";
import { EditCardFrame } from "@/app/components/EditCardFrame";

export default function DataPage({ params }: { params: { id: string } }) {
  const { id } = params;
  return (
    <EditCardFrame
      instructions="If you badge return data when awarded, describe it here."
      docLink="hosted-badges/badge-data"
    >
      <DataEdit docId={id} />
    </EditCardFrame>
  );
}
