"use client";

import theme from "../ThemeRegistry/theme";
import { Variant } from "@mui/material/styles/createTypography";
import { TypographyStyle } from "@mui/material/styles/createTypography";

import React, { useState } from "react";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";

interface EditableTextProps {
  initValue: string;
  variant: Variant;
  fontWeight?: number;
  placeHolder?: string;
  onBlur: (value: string) => void;
}

const getCssProperties = (variant: Variant) => {
  return (theme.typography as Record<Variant, TypographyStyle>)[variant];
};

export const EditableTextArea: React.FC<EditableTextProps> = ({
  initValue,
  variant,
  fontWeight,
  placeHolder,
  onBlur,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(initValue);
  let sx = getCssProperties(variant);
  if (fontWeight) {
    sx = { ...sx, fontWeight: fontWeight };
  }

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onBlur(editedText);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEditedText(event.target.value);
    const element = event.currentTarget;
  };

  const handleMouseLeave = () => {
    if (isEditing) {
      // If the user is editing, blur the input when the mouse leaves
      if (document) {
        const element = document.getElementById("editableTextAreaField");
        if (element) {
          element.blur();
        }
      }
    }
  };

  return (
    <>
      {isEditing ? (
        <TextField
          id="editableTextAreaField"
          value={editedText}
          onChange={handleChange}
          onBlur={handleBlur}
          onMouseLeave={handleMouseLeave}
          variant="standard"
          multiline
          minRows={2}
          fullWidth
          autoFocus
          sx={{
            "& textarea": {
              ...sx,
            },
          }}
        />
      ) : (
        <Typography
          display="block"
          onClick={handleEditClick}
          sx={{
            pt: "3px",
            ...sx,
            whiteSpace: "pre-wrap",
            "&:hover": {
              borderBottomColor: "rgb(23, 68, 150)",
              borderBottomStyle: "solid",
              borderBottomWidth: "2px",
            },
          }}
        >
          {editedText == "" && placeHolder ? placeHolder : editedText}
        </Typography>
      )}
    </>
  );
};
