"use client";

import theme from "../ThemeRegistry/theme";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import { useState, useRef } from "react";

export const AddButtonEx = (props: {
  placeholder: string;
  onAdd: (name: string) => Promise<void>;
}) => {
  const textRef = useRef<HTMLInputElement | null>(null);

  const { placeholder, onAdd } = props;
  const [name, setName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    switch (event.currentTarget.id) {
      case "name":
        setName(event.currentTarget.value);
        break;
    }
  };

  const onAddClicked = async () => {
    setIsAdding(true);
    await onAdd(name);

    if (textRef.current) {
      textRef.current.value = "";
    }

    setIsAdding(false);
  };

  return (
    <Box display="flex">
      <Box width="100%">
        <TextField
          id="name"
          size="small"
          inputRef={textRef}
          fullWidth
          placeholder={placeholder}
          onChange={onChangeHandler}
          sx={{
            backgroundColor: theme.palette.grey[200],
          }}
        ></TextField>
      </Box>
      <Box width="100px" paddingLeft={2}>
        {!isAdding && (
          <Button
            variant="contained"
            color="secondary"
            onClick={() => {
              if (name != "") {
                onAddClicked();
              }
            }}
          >
            Add
          </Button>
        )}
        {isAdding && (
          <Box>
            <CircularProgress size={32} />
          </Box>
        )}
      </Box>
    </Box>
  );
};
