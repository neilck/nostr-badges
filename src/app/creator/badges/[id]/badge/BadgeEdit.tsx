"use client";

import { useEffect, useState } from "react";
import { useBadgeContext } from "@/context/BadgeContext";
import { useRouter } from "next/navigation";
import { useAccountContext } from "@/context/AccountContext";
import { Badge, getEmptyBadge } from "@/data/badgeLib";
import { saveImageToCloud } from "@/data/firestoreLib";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

import { DisplayEdit } from "@/app/components/DisplayEdit";
import { Loading } from "@/app/components/items/Loading";
import { SaveButtonEx } from "@/app/components/items/SaveButtonEx";

export const BadgeEdit = (props: { docId: string }) => {
  const badgeContext = useBadgeContext();
  const accountContext = useAccountContext();
  const router = useRouter();

  const { docId } = props;
  const uid = accountContext.state.account?.uid;

  const [loading, setLoading] = useState(true);
  const [badge, setBadge] = useState<Badge>(getEmptyBadge());

  const [imageFile, setImageFile] = useState<File | undefined>(undefined);

  useEffect(() => {
    async function loadBadge() {
      const badge = await badgeContext.loadBadge(docId);
      if (badge) {
        setBadge(badge);
        setLoading(false);
      }
    }

    loadBadge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId]);

  const onSaveClick = async () => {
    if (!badge) {
      return { success: false, mesg: "No badge loaded to save." };
    }

    if (badge.name == "" || badge.description == "") {
      return { success: false, mesg: "Required field is missing." };
    }

    if (uid == undefined) {
      return {
        success: false,
        mesg: "Error occured accessing badge. Please log out and back in.",
      };
    }

    // try save image first
    if (imageFile) {
      const saveImageResult = await saveImageToCloud(docId, imageFile);
      if (!saveImageResult.success) {
        return { success: false, mesg: saveImageResult.error };
      } else {
        badge.image = saveImageResult.imageURL;
        badge.thumbnail = saveImageResult.imageURL;
      }
    }

    const saveResult = await badgeContext.saveBadge(docId, badge);

    if (!saveResult.success) {
      return { success: false, mesg: saveResult.error };
    } else {
      badgeContext.setBadge(docId, badge);
      return { success: true };
    }
  };

  // DislayEdit handlers
  const handleNameChange = (id: string, name: string) => {
    if (!badge) return;
    const updated = { ...badge };
    updated.name = name;
    setBadge(updated);
  };

  const handleDescriptionChange = (id: string, description: string) => {
    if (!badge) return;
    const updated = { ...badge };
    updated.description = description;
    setBadge(updated);
  };

  const handleImageChange = (id: string, file: File) => {
    if (!badge) return;
    const url = URL.createObjectURL(file);
    setImageFile(file);
    const updated = { ...badge };
    updated.image = url;
    setBadge(updated);
  };

  const handleImageDelete = (id: string) => {
    if (!badge) return;
    const url = "";
    setImageFile(undefined);
    const updated = { ...badge };
    updated.image = url;
    setBadge(updated);
  };

  return (
    <>
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
        width="100%"
      >
        <Loading display={loading}></Loading>
        {!loading && badge && (
          <>
            <Box width="100%" p={1}>
              <DisplayEdit
                id={docId}
                name={badge.name}
                description={badge.description}
                image={badge.image}
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
    </>
  );
};
