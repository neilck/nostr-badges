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
  description: string;
  image: string;
  onChangeName: (id: string, name: string) => void;
  onChangeDescription: (id: string, description: string) => void;
  onChangeImage: (id: string, file: File) => void;
  onDeleteImage: (id: string) => void;
};

export const DisplayEdit = (props: Item) => {
  const {
    id,
    name,
    description,
    image,
    onChangeName,
    onChangeDescription,
    onChangeImage,
    onDeleteImage,
  } = props;

  const handleNameBlur = (value: string) => {
    onChangeName(id, value);
  };

  const handleDescriptionBlur = (value: string) => {
    onChangeDescription(id, value);
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
        <Box width="320px" pb={1}>
          <ImageUpload2
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
            placeHolder="click to edit title..."
            onBlur={handleNameBlur}
            variant="body1"
            fontWeight={600}
          />

          <EditableTextArea
            initValue={description}
            placeHolder="click to edit description..."
            onBlur={handleDescriptionBlur}
            variant="body2"
            fontWeight={500}
          />
        </Box>
      </Box>
    </Box>
  );
};
