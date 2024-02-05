import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";

import { CardTitle } from "@/app/components/items/CardHeadings";
import { SaveButtonEx } from "./items/SaveButtonEx";
import { useState } from "react";
import * as nip19 from "@/nostr-tools/nip19";
import { getFunctions, httpsCallable } from "firebase/functions";

// takes in nsec
// returns hex privatekey is valid, null if not
function isKeyValid(key: string): string | null {
  try {
    const decoded = nip19.decode(key);
    if (decoded.type === "nsec") return decoded.data;
  } catch (_) {}
  return null;
}

export interface KeypairDialogProps {
  open: boolean;
  onClose: (hexpubkey: string) => void;
}

export function KeypairDialog(props: KeypairDialogProps) {
  const { onClose, open } = props;
  const [nsec, setNsec] = useState("");
  const [hex, setHex] = useState("");
  const [error, setError] = useState("");

  const onSaveClick = async () => {
    const functions = getFunctions();
    const setIssuerPrivateKey = httpsCallable(functions, "setIssuerPrivateKey");
    const result = await setIssuerPrivateKey({ hexPrivateKey: hex });
    setNsec("");
    onClose(result.data as string);
    return { success: true };
  };

  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    setNsec(value);
    if (value != "") {
      const hex = isKeyValid(value);

      if (hex == null) {
        setError("Invalid nsec key");
      } else {
        setHex(hex);
        setError("");
      }
    } else {
      setError("");
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose("")}>
      <Box sx={{ width: "320px", p: 2 }}>
        <CardTitle>Change Issuer Key</CardTitle>
        <TextField
          label="Private key (nsec)"
          multiline
          rows={3}
          fullWidth
          sx={{ mt: 2 }}
          value={nsec}
          onChange={onChangeHandler}
          error={error !== ""}
          helperText={error}
        ></TextField>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-evenly",
          width: "100%",
          pb: 4,
        }}
      >
        <SaveButtonEx
          disabled={nsec == "" || error !== ""}
          onClick={onSaveClick}
        />

        <Button
          onClick={() => {
            onClose("");
          }}
        >
          cancel
        </Button>
      </Box>
    </Dialog>
  );
}
