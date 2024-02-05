"use client";

import theme from "@/app/components/ThemeRegistry/theme";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { CardHeading } from "@/app/components/items/CardHeadings";
import { CommonLayout } from "@/app/components/ComonLayout";
import { ItemRow } from "@/app/components/ItemRow";
import { useAccountContext } from "@/context/AccountContext";
import { GroupDialog } from "@/app/components/GroupDialog";
import { AddButtonEx } from "@/app/components/items/AddButtonEx";

import {
  Group,
  addGroup,
  getEmptyGroup,
  loadGroups as fsLoadGroups,
  deleteGroup,
} from "@/data/groupLib";

export default function Groups() {
  const router = useRouter();
  const { loading, account, creatorMode, currentProfile } =
    useAccountContext().state;

  const [groups, setGroups] = useState<Record<string, Group>>({});
  const [selectedGroup, setSelectedGroup] = useState<Group | undefined>(
    undefined
  );
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    if (account?.uid) loadGroups(account.uid);
  }, [account]);

  async function loadGroups(uid: string) {
    const groups = await fsLoadGroups(uid);
    setGroups(groups);
  }
  const onAddHandler = async (name: string) => {
    const uid = account?.uid;
    if (!uid) return;

    const newGroup = getEmptyGroup();
    newGroup.name = name;
    newGroup.uid = uid;
    const addResult = await addGroup(newGroup);
    if (addResult.success) {
      loadGroups(account.uid);
    }
  };

  const onEditClicked = (docId: string) => {
    router.push(`/creator/groups/${docId}/edit`);
  };

  const onDeleteClicked = async (docId: string) => {
    await deleteGroup(docId);
    if (account?.uid) loadGroups(account.uid);
  };

  // Dialog
  const displayGroup = (id: string, group: Group) => {
    setSelectedId(id);
    setSelectedGroup(group);
    setOpen(true);
  };

  const [open, setOpen] = useState(false);

  const onClose = () => {
    setOpen(false);
  };

  return (
    <CommonLayout>
      <Stack direction="column" pl={3} maxWidth={600}>
        <CardHeading>User Groups</CardHeading>
        <Typography variant="body2">Manage users using a group.</Typography>
      </Stack>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          rowGap: 1.5,
          p: 2,
          maxWidth: "400px",
          backgroundColor: theme.palette.grey[100],
          height: "100%",
        }}
      >
        <AddButtonEx placeholder="new group name" onAdd={onAddHandler} />
        {Object.keys(groups).map((key) => {
          const group = groups[key];

          return (
            <ItemRow
              id={key}
              key={key}
              name={group.name}
              description={
                group.description == ""
                  ? "<description not net>"
                  : group.description
              }
              image={group.image == "" ? "/default/group.png" : group.image}
              onClick={() => {
                displayGroup(key, group);
              }}
              onDelete={onDeleteClicked}
              onEdit={onEditClicked}
            ></ItemRow>
          );
        })}
      </Box>
      {selectedGroup && (
        <GroupDialog
          open={open}
          onClose={onClose}
          groupId={selectedId}
          group={selectedGroup}
        />
      )}
    </CommonLayout>
  );
}
