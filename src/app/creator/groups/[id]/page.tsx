"use client";

import theme from "@/app/components/ThemeRegistry/theme";
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

import Box from "@mui/material/Box";
import { GroupLayout } from "@/app/creator/groups/[id]/GroupLayout";
import { GroupOffers } from "@/app/components/GroupOffers";

import { Group } from "@/data/groupLib";
import { useGroupContext } from "@/context/GroupContext";

export default function Group() {
  const groupContext = useGroupContext();
  const groupId = groupContext.state.groupId;
  const group = groupContext.state.group;
  const loadGroup = groupContext.loadGroup;

  const router = useRouter();
  const params = useParams();
  let id: string = "";
  if (params && params["id"] && typeof params["id"] == "string") {
    id = params["id"];
  }

  useEffect(() => {
    loadGroup(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <GroupLayout id={id}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          rowGap: 2,
          p: 2,
          maxWidth: "400px",
          backgroundColor: theme.palette.grey[100],
          height: "100%",
        }}
      >
        {group && (
          <GroupOffers
            groupId={groupId ? groupId : ""}
            group={group}
          ></GroupOffers>
        )}
      </Box>
    </GroupLayout>
  );
}
