"use client";

import { useRef, ChangeEvent, useState, useEffect } from "react";

import CardActionArea from "@mui/material/CardActionArea";
import CardMedia from "@mui/material/CardMedia";
import Box from "@mui/material/Box";

import AddAPhotoOutlined from "@mui/icons-material/AddAPhotoOutlined";
import { useAccountContext } from "@/context/AccountContext";
import { grey } from "@mui/material/colors";
import { Typography } from "@mui/material";

export const ImageUpload2 = (props: {
  url: string;
  onChange?: (file: File) => void;
  onDelete?: () => void;
}) => {
  let url = props.url;
  const context = useAccountContext();
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);

  const [hasImage, setHasImage] = useState(false);

  useEffect(() => {
    setHasImage(url != "");
  }, [url]);

  const uid = context.state.account?.uid;

  const { onChange, onDelete } = props;
  const hiddenFileInput = useRef(null);

  // triggers file select dialog
  const onClick = () => {
    if (hiddenFileInput.current) {
      // @ts-ignore
      hiddenFileInput.current.click();
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      if (onChange) onChange(file);
    }
  };

  return (
    <>
      <input
        accept="image/*"
        style={{ display: "none" }}
        id="inputUpload"
        ref={hiddenFileInput}
        type="file"
        onChange={handleChange}
      />

      <Box
        id="imageUploadBox"
        padding={0}
        margin={0}
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          border: url != "" ? 1 : 0,
          borderColor: grey[300],
        }}
      >
        {hasImage && (
          <Box
            display="flex"
            flexDirection="column"
            width="100%"
            alignItems="center"
          >
            <CardActionArea
              onClick={onClick}
              sx={{
                position: "relative",
                width: "100%",
                paddingTop: "100%",
              }}
            >
              <CardMedia
                component="img"
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                image={url}
                alt="badge image"
              />
            </CardActionArea>
            <Box
              component="button"
              onClick={() => {
                if (onDelete) onDelete();
              }}
              sx={{
                border: 0,
                "&:hover": {
                  fontWeight: 800,
                  cursor: "pointer",
                },
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ color: "blue", "&:hover": { fontWeight: 600 } }}
              >
                delete
              </Typography>
            </Box>
          </Box>
        )}

        {!hasImage && (
          <CardActionArea
            onClick={onClick}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.7)",
              padding: "16px",
              width: "fit-content",
              textAlign: "center",
              borderRadius: "8px",
              boxShadow: "0 0 10px rgba(0, 0, 0, 0.3)",
            }}
          >
            {/* Content you want to center */}
            <AddAPhotoOutlined color="primary" fontSize="medium" />
            {/* Add more content as needed */}
          </CardActionArea>
        )}
      </Box>
    </>
  );
};
