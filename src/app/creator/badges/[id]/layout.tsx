import { BadgeLayout } from "@/app/components/BadgeLayout";
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
      <BadgeLayout id={params.id}>{children}</BadgeLayout>
    </BadgeProvider>
  );
}
