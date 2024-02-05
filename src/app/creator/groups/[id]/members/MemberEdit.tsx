"use client";

import { useEffect, useState } from "react";
import { useGroupContext } from "@/context/GroupContext";
import { useAccountContext } from "@/context/AccountContext";

import { Group } from "@/data/groupLib";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

import { Loading } from "@/app/components/items/Loading";
import { SaveButtonEx } from "@/app/components/items/SaveButtonEx";

export const MemberEdit = (props: { groupId: string }) => {
  const accountContext = useAccountContext();
  const groupContext = useGroupContext();

  const uid = accountContext.state.account?.uid;
  const groupId = props.groupId;
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<Group | null>(null);

  useEffect(() => {
    loadGroup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  async function loadGroup() {
    const group = await groupContext.loadGroup(groupId);
    setGroup(group);
    setLoading(false);
  }

  const onSaveClick = async () => {
    if (uid == undefined) {
      return {
        success: false,
        mesg: "Error occured accessing group. Please log out and back in.",
      };
    }

    if (!group) {
      return {
        success: false,
        mesg: "Error occured accessing group. Please log out and back in.",
      };
    }
    return { success: false, mesg: "not implemented" };
  };

  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="left"
      minWidth="392px"
    >
      <Loading display={loading}></Loading>
      {!loading && group && (
        <>
          <Box width="100%" p={1}></Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-evenly",
              width: "100%",
              pt: 2,
            }}
          >
            <SaveButtonEx onClick={onSaveClick}></SaveButtonEx>
          </Box>
        </>
      )}
    </Stack>
  );
};
