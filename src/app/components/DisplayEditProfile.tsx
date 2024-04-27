"use client";

import theme from "@/app/components/ThemeRegistry/theme";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";

import { EditableText } from "@/app/components/items/EditableText";
import { EditableTextArea } from "@/app/components/items/EditableTextArea";
import { ImageUpload2 } from "@/app/components/items/ImageUpload2";

export type Item = {
  id: string;
  name: string;
  displayName: string;
  about: string;
  image: string;
  onChangeName: (id: string, name: string) => void;
  onChangeDisplayName: (id: string, displayName: string) => void;
  onChangeAbout: (id: string, about: string) => void;
  onChangeImage: (id: string, file: File) => void;
  onDeleteImage: (id: string) => void;
};

export const DisplayEditProfile = (props: Item) => {
  const {
    id,
    name,
    displayName,
    about,
    image,
    onChangeName,
    onChangeDisplayName,
    onChangeAbout,
    onChangeImage,
    onDeleteImage,
  } = props;

  const handleNameBlur = (value: string) => {
    onChangeName(id, value);
  };

  const handleDisplayNameBlur = (value: string) => {
    onChangeDisplayName(id, value);
  };

  const handleAboutBlur = (value: string) => {
    onChangeAbout(id, value);
  };

  const handleImageChange = (file: File) => {
    onChangeImage(id, file);
  };

  const handleImageDelete = () => {
    onDeleteImage(id);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        border: 0,
        pt: 2,
        pl: 0,
        pr: 0,
        width: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box width="120px" pb={1}>
          <ImageUpload2
            avatar={true}
            url={image}
            onChange={handleImageChange}
            onDelete={handleImageDelete}
          />
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "left",
          alignItems: "left",

          pb: 1,
          pl: 2,
          pr: 2,
        }}
      >
        <Box pt="0.5" pl="4" pr="4">
          <EditableText
            initValue={name}
            placeHolder="Username"
            onBlur={handleNameBlur}
            variant="body1"
            fontWeight={600}
          />

          <EditableText
            initValue={displayName}
            placeHolder="Display name (optional)"
            onBlur={handleDisplayNameBlur}
            variant="body1"
            fontWeight={500}
          />

          <EditableTextArea
            initValue={about}
            placeHolder="About me (optional)"
            onBlur={handleAboutBlur}
            variant="body2"
            fontWeight={500}
          />
        </Box>
      </Box>
    </Box>
  );
};
