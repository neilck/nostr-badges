"use client";

import { useEffect, useState } from "react";
import { useAccountContext } from "@/context/AccountContext";
import { useRouter } from "next/navigation";
import { Profile, getEmptyProfile } from "@/data/profileLib";
import { DEFAULT_PROFILE_THUMB, saveImageToCloud } from "@/data/firestoreLib";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

import { DisplayEditProfile } from "@/app/components/DisplayEditProfile";
import { Loading } from "@/app/components/items/Loading";
import { SaveButtonEx } from "@/app/components/items/SaveButtonEx";
import { DeleteButton } from "@/app/components/items/DeleteButton";
export const ProfileEdit = (props: {
  profile: Profile;
  onSave: (profile: Profile) => void;
  onDelete: (profile: Profile) => void;
}) => {
  const accountContext = useAccountContext();
  const router = useRouter();

  const uid = accountContext.state.account?.uid;
  const onSave = props.onSave;

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(getEmptyProfile());

  const [imageFile, setImageFile] = useState<File | undefined>(undefined);

  useEffect(() => {
    setProfile(props.profile);
    setLoading(false);
  }, [props.profile.publickey]);

  const onSaveClick = async () => {
    const docId = profile.publickey;

    if (!profile.name || profile.name == "" || profile.docId == "") {
      return { success: false, mesg: "Required field is missing." };
    }

    if (profile.image == "") {
      // use default
      profile.image = DEFAULT_PROFILE_THUMB;
    }

    if (uid == undefined) {
      return {
        success: false,
        mesg: "Error occured accessing profile. Please log out and back in.",
      };
    }

    // try save image first
    if (imageFile) {
      const saveImageResult = await saveImageToCloud(docId, imageFile);
      if (!saveImageResult.success) {
        return { success: false, mesg: saveImageResult.error };
      } else {
        profile.image = saveImageResult.imageURL;
      }
    }

    const saveResult = await accountContext.saveProfile(profile);

    if (!saveResult.success) {
      return { success: false, mesg: saveResult.error };
    } else {
      if (saveResult.profile && onSave) {
        onSave(saveResult.profile);
      }
      return { success: true };
    }
  };

  const onDeleteClick = async () => {
    props.onDelete(profile);
  };

  // DislayEdit handlers
  const handleNameChange = (id: string, name: string) => {
    if (!profile) return;
    const updated = { ...profile };
    updated.name = name;
    setProfile(updated);
  };

  const handleDisplayNameChange = (id: string, displayName: string) => {
    if (!profile) return;
    const updated = { ...profile };
    updated.displayName = displayName;
    setProfile(updated);
  };

  const handleAboutChange = (id: string, about: string) => {
    if (!profile) return;
    const updated = { ...profile };
    updated.about = about;
    setProfile(updated);
  };

  const handleImageChange = (id: string, file: File) => {
    if (!profile) return;
    const url = URL.createObjectURL(file);
    setImageFile(file);
    const updated = { ...profile };
    updated.image = url;
    setProfile(updated);
  };

  const handleImageDelete = (id: string) => {
    if (!profile) return;
    const url = "";
    setImageFile(undefined);
    const updated = { ...profile };
    updated.image = url;
    setProfile(updated);
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
        {!loading && profile && (
          <>
            <Box width="100%" p={1}>
              <DisplayEditProfile
                id={profile.publickey}
                name={profile.name ?? ""}
                displayName={profile.displayName ?? ""}
                about={profile.about ?? ""}
                image={profile.image ?? ""}
                onChangeName={handleNameChange}
                onChangeDisplayName={handleDisplayNameChange}
                onChangeAbout={handleAboutChange}
                onChangeImage={handleImageChange}
                onDeleteImage={handleImageDelete}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                width: "90%",
                pt: 2,
              }}
            >
              <Box width="40px">&nbsp;</Box>
              <SaveButtonEx
                onClick={onSaveClick}
                refId={profile.publickey}
              ></SaveButtonEx>
              <Box width="40px">
                <Box>
                  <DeleteButton onClick={onDeleteClick} single={true} />
                </Box>
              </Box>
            </Box>
          </>
        )}
      </Stack>
    </>
  );
};
