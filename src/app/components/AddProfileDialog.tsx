"use client";

import theme from "./ThemeRegistry/theme";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import * as nip19 from "@/nostr-tools/nip19";
import { getPublicKey } from "nostr-tools";

import { loadProfile } from "@/data/profileLib";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import RefreshIcon from "@mui/icons-material/Refresh";
import { randomName } from "@/data/randomName";
import { CardTitle } from "@/app/components/items/CardHeadings";
import { IconButton } from "@mui/material";

export interface Props {
  onClose: (data: { username?: string; privatekey?: string } | null) => void;
}

function isNameValid(name: string): boolean {
  return true;
}

// takes in nsec
// returns hex privatekey is valid, null if not
function isKeyValid(key: string): string | null {
  try {
    const decoded = nip19.decode(key);
    if (decoded.type === "nsec") return decoded.data;
  } catch (_) {}
  return null;
}

export function AddProfileDialog(props: Props) {
  const searchParams = useSearchParams();
  const addParam = searchParams.get("add");

  const open = addParam === "true" ? true : false;
  const { onClose } = props;

  const [isNsec, setIsNsec] = useState(false);
  const [labelname, setLabelname] = useState("username");
  const [username, setUsername] = useState(randomName());
  const [privatekey, setPrivateKey] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showNostr, setShowNostr] = useState(false);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (open) {
      setShowNostr(false);
      setAdding(false);
      setPrivateKey(null);
      setUsername(randomName());
      setError("");
      setIsNsec(false);
    }
  }, [open]);

  useEffect(() => {
    if (isNsec) {
      setLabelname("nsec private key");
    } else {
      setLabelname("username");
    }
  }, [isNsec]);

  const onSaveClick = async () => {
    const value = await onBlurHandler();
    if (value == "") {
      return;
    }

    setAdding(true);
    if (isNsec && value) {
      onClose({ privatekey: value });
    } else {
      onClose({ username: value });
    }

    return { success: true };
  };

  const onBlurHandler = async () => {
    if (isNsec) {
      const privateKey = isKeyValid(username);
      if (!privateKey) {
        setError("Not a valid nsec private key");
        setPrivateKey(null);
        return "";
      } else {
        const publickey = getPublicKey(privateKey);
        const existing = await loadProfile(publickey);
        if (existing) {
          setError("Private key already associated with an existing account.");
          setPrivateKey(null);
          return "";
        } else {
          setPrivateKey(privateKey);
          return privateKey;
        }
      }
    } else {
      if (username.length > 30) {
        setError("Username must be less than 30 characters.");
        return "";
      } else {
        setError("");
        return username;
      }
    }
  };

  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const value = event.currentTarget.value;
    setIsNsec(value.startsWith("nsec") || value.startsWith("NSEC"));

    if (isNameValid(value)) {
      setUsername(value);
      setError("");
    } else {
      setError("Invalid username.");
    }
  };

  const handleRandom = () => {
    setError("");
    setUsername(randomName());
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <Box
        sx={{ width: "320px", display: "flex", flexDirection: "column", p: 2 }}
      >
        <CardTitle>Create New Profile</CardTitle>

        <Box margin="10px">
          <Typography>Please choose an anonymous username.</Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <TextField
            label={labelname}
            size="small"
            fullWidth
            sx={{ mt: 2 }}
            value={username}
            onChange={onChangeHandler}
            onBlur={onBlurHandler}
            error={error !== ""}
            helperText={error}
          ></TextField>
          {!isNsec && (
            <Box pl="4px" pt="18px" onClick={() => {}}>
              <IconButton
                onClick={handleRandom}
                sx={{ color: theme.palette.blue.main }}
              >
                <RefreshIcon />
              </IconButton>
            </Box>
          )}
        </Box>
        {!adding && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-evenly",
              alignItems: "center",
              width: "100%",
              pt: 3,
            }}
          >
            <Button
              variant="contained"
              disabled={username == "" || error !== ""}
              onClick={onSaveClick}
              sx={{ width: "100px" }}
            >
              Add
            </Button>

            <Button
              onClick={() => {
                onClose(null);
              }}
              sx={{ pb: 2 }}
            >
              cancel
            </Button>
          </Box>
        )}
        <Box pt={1}>
          {adding && (
            <Typography variant="body1" fontStyle="italic" textAlign="center">
              Adding...
            </Typography>
          )}
        </Box>
        <Box>
          <Button
            size="small"
            sx={{ textAlign: "left", pt: 2 }}
            onClick={() => {
              setShowNostr(!showNostr);
            }}
          >
            Use Nostr key...
          </Button>
          <Collapse in={showNostr} sx={{ pl: 0.5, pr: 0.5 }}>
            <Typography variant="subtitle2">
              To link an existing Nostr profile, paste a nsec private key into
              the username field above.
            </Typography>
            <Typography variant="subtitle2">
              WARNING: Owners of this private key will be able to log into this
              account.
            </Typography>
          </Collapse>
        </Box>
      </Box>
    </Dialog>
  );
}
