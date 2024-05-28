import GroupProvider from "@/context/GroupContext";
import { GroupLayout } from "./GroupLayout";
import { NostrSnackbar } from "@/app/components/items/NostrSnackbar";
import { ProfileSnackbar } from "@/app/components/items/ProfileSnackbar";
export default function Layout({
  params,
  children,
}: {
  params: { id: string };
  children: React.ReactNode;
}) {
  return (
    <GroupProvider>
      <NostrSnackbar />
      <ProfileSnackbar />
      <GroupLayout id={params.id}>{children}</GroupLayout>
    </GroupProvider>
  );
}
