"use client";

import { useEffect, useState } from "react";
import { useGroupContext } from "@/context/GroupContext";
import { useAccountContext } from "@/context/AccountContext";

import { Group } from "@/data/groupLib";
import { saveImageToCloud } from "@/data/firestoreLib";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

import { DisplayEdit } from "@/app/components/DisplayEdit";
import { Loading } from "@/app/components/items/Loading";
import { SaveButtonEx } from "@/app/components/items/SaveButtonEx";

export const GroupEdit = (props: { groupId: string }) => {
  const accountContext = useAccountContext();
  const groupContext = useGroupContext();

  const uid = accountContext.state.account?.uid;
  const groupId = props.groupId;
  const [loading, setLoading] = useState(true);
  const [group, setGroup] = useState<Group | null>(null);
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);

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

    if (group.uid == "" || group.name == "" || group.description == "") {
      return { success: false, mesg: "Required field is missing" };
    }

    // try save image first
    if (imageFile) {
      const saveImageResult = await saveImageToCloud(groupId, imageFile);
      if (!saveImageResult.success) {
        return { success: false, mesg: saveImageResult.error };
      } else {
        const url = saveImageResult.imageURL;
        if (url) {
          group.image = url;
        }
      }
    }

    const saveResult = await groupContext.saveGroup(groupId, group);

    if (!saveResult.success) {
      return { success: false, mesg: saveResult.error };
    } else {
      groupContext.setGroup(groupId, group);
      return { success: true };
    }
  };

  // DisplayEdit handlers
  const handleNameChange = (id: string, name: string) => {
    if (!group) return;
    const updated = { ...group };
    updated.name = name;
    setGroup(updated);
  };

  const handleDescriptionChange = (id: string, description: string) => {
    if (!group) return;
    const updated = { ...group };
    updated.description = description;
    setGroup(updated);
  };

  const handleImageChange = (id: string, file: File) => {
    if (!group) return;
    const url = URL.createObjectURL(file);
    setImageFile(file);
    const updated = { ...group };
    updated.image = url;
    setGroup(updated);
  };

  const handleImageDelete = (id: string) => {
    if (!group) return;
    const url = "";
    setImageFile(undefined);
    const updated = { ...group };
    updated.image = url;
    setGroup(updated);
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
          <Box width="100%" p={1}>
            <DisplayEdit
              id={groupId}
              name={group.name}
              description={group.description}
              image={group.image}
              onChangeName={handleNameChange}
              onChangeDescription={handleDescriptionChange}
              onChangeImage={handleImageChange}
              onDeleteImage={handleImageDelete}
            />
          </Box>

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
