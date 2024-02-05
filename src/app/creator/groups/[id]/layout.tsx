import GroupProvider from "@/context/GroupContext";
import { GroupLayout } from "./GroupLayout";

export default function Layout({
  params,
  children,
}: {
  params: { id: string };
  children: React.ReactNode;
}) {
  return (
    <GroupProvider>
      <GroupLayout id={params.id}>{children}</GroupLayout>
    </GroupProvider>
  );
}
