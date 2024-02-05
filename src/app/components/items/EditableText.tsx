"use client";

import theme from "../ThemeRegistry/theme";
import { Variant } from "@mui/material/styles/createTypography";
import { TypographyStyle } from "@mui/material/styles/createTypography";

import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import { Input } from "@mui/material";

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

export const EditableText: React.FC<EditableTextProps> = ({
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
  };

  const handleMouseLeave = () => {
    if (isEditing) {
      // If the user is editing, blur the input when the mouse leaves
      if (document) {
        const element = document.getElementById("editableTextField");
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
          id="editableTextField"
          value={editedText}
          onChange={handleChange}
          onBlur={handleBlur}
          onMouseLeave={handleMouseLeave}
          variant="standard"
          fullWidth
          autoFocus
          sx={{
            "& input": {
              ...sx,
            },
          }}
        />
      ) : (
        <Box width="320px">
          <Typography
            overflow="hidden"
            textOverflow="ellipsis"
            whiteSpace="nowrap"
            onClick={handleEditClick}
            sx={{
              pt: "3px",
              ...sx,
              "&:hover": {
                borderBottomColor: "rgb(23, 68, 150)",
                borderBottomStyle: "solid",
                borderBottomWidth: "2px",
              },
            }}
          >
            {editedText == "" && placeHolder ? placeHolder : editedText}
          </Typography>
        </Box>
      )}
    </>
  );
};
