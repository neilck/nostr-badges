"use client";

import debug from "debug";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { NostrEvent } from "@/data/ndk-lite";
import { GenericButton } from "@/app/components/items/GenericButton";
import { useEffect, useState } from "react";
import { getPublicKey } from "nostr-tools";
import * as nip19 from "@/nostr-tools/nip19";

const loginDebug = debug("aka:Login");

export const PrivateKeyButton = (props: {
  disabled: boolean;
  onStart: () => void;
  onEnd: () => void;
  onPubkey: (pubkey: string) => void;
}) => {
  const { disabled, onStart, onEnd, onPubkey } = props;

  const [edit, setEdit] = useState(false);
  const [nsec, setNsec] = useState("");
  const [error, setError] = useState(false);
  const [errorMesg, setErrorMesg] = useState("");
  const [helperText, setHelperText] = useState("");

  useEffect(() => {
    if (errorMesg == "") {
      setError(false);
      setHelperText("Paste in an nsec...");
    } else {
      setError(true);
      setHelperText(errorMesg);
    }
  }, [errorMesg]);

  const clickHandler = () => {
    onStart();
    setEdit(true);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNsec(event.target.value);
  };

  const focusHandler = () => {
    setErrorMesg("");
  };

  const blurHandler = () => {
    try {
      const privatekey = nsec;
      const decode = nip19.decode(nsec);
      if (decode.type == "nsec") {
        const pubkey = getPublicKey(decode.data);
        if (pubkey != "") {
          setEdit(false);
          onPubkey(pubkey);
          onEnd();
          return;
        }
      }
    } catch {}

    setErrorMesg("Not a valid nsec.");
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter") {
      (event.target as HTMLInputElement).blur(); // Manually trigger blur event
    }
  };

  return (
    <>
      {!edit && (
        <GenericButton
          buttonLabel="Private Key"
          color="secondary"
          disabled={disabled}
          onClick={clickHandler}
        />
      )}
      {edit && (
        <Box display="flex" flexDirection="column">
          <TextField
            error={errorMesg != ""}
            id="outlined-basic"
            label="nsec private key"
            variant="outlined"
            size="small"
            helperText={helperText}
            value={nsec}
            onChange={handleChange}
            onFocus={focusHandler}
            onBlur={blurHandler}
            onKeyUp={handleKeyPress}
          />
          <Box display="flex" flexDirection="row" justifyContent="space-evenly">
            <Button id="submit" onClick={blurHandler}>
              submit
            </Button>
            <Button
              id="cancel"
              onClick={() => {
                setNsec("");
                setEdit(false);
                onEnd();
              }}
            >
              cancel
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
};
