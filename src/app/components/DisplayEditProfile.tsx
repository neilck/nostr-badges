"use client";

import theme from "@/app/components/ThemeRegistry/theme";
import { useEffect, useState } from "react";
import * as nip19 from "@/nostr-tools/nip19";
import { getPublicKey } from "nostr-tools";
import grey from "@mui/material/colors/grey";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import TextField from "@mui/material/TextField";
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
  addPrivateKey?: boolean;
  onChangeName: (id: string, name: string) => void;
  onChangeDisplayName: (id: string, displayName: string) => void;
  onChangeAbout: (id: string, about: string) => void;
  onChangeImage: (id: string, file: File) => void;
  onDeleteImage: (id: string) => void;
  onChangePrivateKey: (id: string, privatekey: string) => void;
};

function isKeyValid(privatekey: string, publickey: string): string | null {
  try {
    const decoded = nip19.decode(privatekey);
    if (decoded.type === "nsec") {
      const privateKHex = decoded.data;
      const publicHex = getPublicKey(privateKHex);
      if (publicHex != publickey) {
        return null;
      }

      return privateKHex;
    }
  } catch (_) {}
  return null;
}

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
    onChangePrivateKey,
    onDeleteImage,
  } = props;

  const [nsec, setNsec] = useState("");
  const [hex, setHex] = useState("");
  const [error, setError] = useState("");
  const [showKey, setShowKey] = useState(false);

  const addPrivateKey =
    props.addPrivateKey == undefined ? false : props.addPrivateKey;

  useEffect(() => {
    setNsec("");
    setHex("");
    setError("");
    setShowKey(false);
  }, []);

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

  const handleNsecChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    setNsec(value);
    if (value != "") {
      const hex = isKeyValid(value, id);

      if (hex == null) {
        setError("Invalid nsec key or doesn't match public key.");
      } else {
        setHex(hex);
        onChangePrivateKey(id, hex);
        setError("");
      }
    } else {
      setError("");
    }
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
            variant="body1"
            fontWeight={500}
          />
        </Box>
      </Box>
      {addPrivateKey && (
        <Box pl={1}>
          <Button
            onClick={() => {
              setShowKey(!showKey);
            }}
          >
            Set private key
          </Button>
          <Collapse in={showKey}>
            <Box sx={{ border: 1, p: 1, borderColor: grey[300] }}>
              <Typography variant="body2" fontWeight="600">
                public key
              </Typography>
              <Box
                sx={{
                  whiteSpace: "pre-wrap",
                  width: "360px",
                  wordBreak: "break-word",
                  pt: 0.5,
                  pb: 0.5,
                  pr: 2,
                }}
              >
                <Typography variant="body2" fontWeight="400">
                  {nip19.npubEncode(id)}
                </Typography>
              </Box>
              <Typography variant="body2" fontWeight="600">
                save private key
              </Typography>
              <TextField
                label="Private key (nsec)"
                multiline
                rows={2}
                fullWidth
                sx={{ mt: 1 }}
                value={nsec}
                onChange={handleNsecChange}
                error={error !== ""}
                helperText={error}
              ></TextField>
            </Box>
          </Collapse>
        </Box>
      )}
    </Box>
  );
};
