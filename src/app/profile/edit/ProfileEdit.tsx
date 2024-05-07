"use client";

import { useEffect, useState } from "react";
import { useAccountContext } from "@/context/AccountContext";
import { useNostrContext } from "@/context/NostrContext";
import { useRouter } from "next/navigation";
import { Profile, getEmptyProfile } from "@/data/profileLib";
import { DEFAULT_PROFILE_THUMB, saveImageToCloud } from "@/data/firestoreLib";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import { DisplayEditProfile } from "@/app/components/DisplayEditProfile";
import { Loading } from "@/app/components/items/Loading";
import { SaveButtonEx } from "@/app/components/items/SaveButtonEx";
import { DeleteButton } from "@/app/components/items/DeleteButton";
import { savePrivateKey } from "@/data/keyPairLib";

export const ProfileEdit = (props: {
  profile: Profile;
  showDelete?: boolean;
  onSave: (profile: Profile) => void;
  onDelete: (profile: Profile) => void;
}) => {
  const accountContext = useAccountContext();
  const nostrContext = useNostrContext();

  const router = useRouter();

  const uid = accountContext.state.account?.uid;
  const onSave = props.onSave;
  const showDelete = props.showDelete == undefined ? true : props.showDelete;

  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [checkingText, setCheckingText] = useState("Update from relays");
  const [profile, setProfile] = useState(getEmptyProfile());
  const [hex, setHex] = useState("");

  const [imageFile, setImageFile] = useState<File | undefined>(undefined);

  useEffect(() => {
    setProfile(props.profile);
    setLoading(false);
  }, [props.profile.publickey]);

  useEffect(() => {
    setCheckingText(
      checking ? "Checking relays for updates..." : "Update from relays"
    );
  }, [checking]);

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

    if (hex != "") {
      if (profile.hasPrivateKey) {
        return {
          success: false,
          mesg: "Profile already has saved private key.",
        };
      }

      // save private key
      await savePrivateKey(hex);

      // update profile
      profile.hasPrivateKey = true;
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

  const handlePrivateKeyChange = (id: string, privateKey: string) => {
    setHex(privateKey);
  };

  const handleImageDelete = (id: string) => {
    if (!profile) return;
    const url = "";
    setImageFile(undefined);
    const updated = { ...profile };
    updated.image = url;
    setProfile(updated);
  };

  const handleCheckRelays = () => {
    setChecking(true);
    doCheck();
  };

  const doCheck = async () => {
    const ndkProfile = await nostrContext.fetchProfile(profile.publickey);
    if (ndkProfile) {
      profile.name = ndkProfile.name;
      profile.displayName = ndkProfile.displayName;
      profile.image = ndkProfile.image;
      profile.about = ndkProfile.about;
    }

    setChecking(false);
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
                addPrivateKey={
                  profile.hasPrivateKey == undefined
                    ? false
                    : !profile.hasPrivateKey
                }
                onChangeName={handleNameChange}
                onChangeDisplayName={handleDisplayNameChange}
                onChangeAbout={handleAboutChange}
                onChangePrivateKey={handlePrivateKeyChange}
                onChangeImage={handleImageChange}
                onDeleteImage={handleImageDelete}
              />
              <Box sx={{ pl: 1 }}>
                <Button onClick={handleCheckRelays}>{checkingText}</Button>
              </Box>
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
                  {showDelete && (
                    <DeleteButton onClick={onDeleteClick} single={true} />
                  )}
                </Box>
              </Box>
            </Box>
          </>
        )}
      </Stack>
    </>
  );
};
