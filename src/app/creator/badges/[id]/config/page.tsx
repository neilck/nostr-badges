import { EditCardFrame } from "@/app/components/EditCardFrame";
import { ConfigEdit } from "@/app/creator/badges/[id]/config/ConfigEdit";

export default function ConfigPage({ params }: { params: { id: string } }) {
  const { id } = params;

  return (
    <EditCardFrame
      instructions="Set the options required to integrate your badge with AKA Profiles."
      docLink="hosted-badges/badge-config"
    >
      <ConfigEdit docId={id} />
    </EditCardFrame>
  );
}
