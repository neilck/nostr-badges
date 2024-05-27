import { BadgeLayout } from "@/app/components/BadgeLayout";
import { NostrSnackbar } from "@/app/components/items/NostrSnackbar";
import BadgeProvider from "@/context/BadgeContext";

export default function Layout({
  params,
  children,
}: {
  params: { id: string };
  children: React.ReactNode;
}) {
  return (
    <BadgeProvider>
      <NostrSnackbar />
      <BadgeLayout id={params.id}>{children}</BadgeLayout>
    </BadgeProvider>
  );
}
