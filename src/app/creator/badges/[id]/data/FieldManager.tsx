"use client";

import { useState, useEffect } from "react";

import theme from "../../../../components/ThemeRegistry/theme";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ClearIcon from "@mui/icons-material/Clear";
import { DataField } from "@/data/badgeLib";

function capitalizeWords(phrase: string) {
  let words = phrase.split(" ");
  let capitalizedWords = words.map(
    (word) => word.charAt(0).toUpperCase() + word.slice(1)
  );
  return capitalizedWords.join(" ");
}

export const FieldManager = (props: {
  fields: DataField[];

  onChange?: (fields: DataField[]) => void;
}) => {
  const maxNameWidth = "260px";
  const nameWidth = 4;
  const valueWidth = 7;
  const [fields, setFields] = useState(props.fields);
  const [newField, setNewField] = useState("");

  useEffect(() => {
    if (props.onChange) {
      props.onChange(fields);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields]);

  const updateField = (name: string, label?: string, description?: string) => {
    const updated: DataField[] = [...fields];
    for (let i = 0; i < updated.length; i++) {
      const dataField = updated[i];
      if (dataField.name == name) {
        if (label) dataField.label = label;
        if (description) dataField.description = description;
        break;
      }
    }

    setFields(updated);
  };

  const onAddClicked = () => {
    if (newField == "") return;

    let exists = false;
    for (let i = 0; i < fields.length; i++) {
      if (fields[i].name == newField) {
        exists = true;
        break;
      }
    }

    if (!exists) {
      const field: DataField = {
        name: newField,
        label: capitalizeWords(newField),
        description: "",
      };

      const updated: DataField[] = [...fields];
      updated.push(field);
      setFields(updated);
    } else {
      // clear value if already exists
      updateField(newField, "", "");
    }
    setNewField("");
  };

  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    switch (event.currentTarget.id) {
      case "newField":
        setNewField(event.currentTarget.value);
        break;
    }
  };

  const onLabelChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.currentTarget.id;
    const label = event.currentTarget.value;
    updateField(name, label);
  };

  const onDescriptionChangeHandler = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const name = event.currentTarget.id;
    const description = event.currentTarget.value;
    updateField(name, undefined, description);
  };

  const onDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const name = event.currentTarget.id;
    const updated: DataField[] = [];

    for (let i = 0; i < fields.length; i++) {
      if (fields[i].name != name) {
        updated.push(fields[i]);
      }
    }
    setFields(updated);
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="strech">
      <Box display="flex" flexDirection="row">
        <TextField
          id="newField"
          value={newField}
          onChange={onChangeHandler}
          label="field name"
          size="small"
          fullWidth
          sx={{ maxWidth: maxNameWidth }}
        ></TextField>
        <Button onClick={onAddClicked}>add</Button>
      </Box>

      {fields.length > 0 && (
        <Grid container rowGap={1} spacing={1} pt={2.5} pl={1}>
          {fields.map((dataField) => (
            <Grid container key={dataField.name} spacing={1}>
              <Grid
                item
                xs={11}
                sx={{
                  whiteSpace: "pre-wrap",
                  width: "100%",
                  wordBreak: "break-word",
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  width="100%"
                  height="100%"
                >
                  <Typography variant="body2" fontWeight={600}>
                    {dataField.name}
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={1}>
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  width="100%"
                  height="100%"
                >
                  <IconButton
                    id={dataField.name}
                    size="small"
                    onClick={onDeleteClick}
                    sx={{ color: theme.palette.blue.main }}
                  >
                    <ClearIcon />
                  </IconButton>
                </Box>
              </Grid>
              <Grid item xs={valueWidth}>
                <TextField
                  value={dataField.label}
                  id={dataField.name}
                  label="label"
                  size="small"
                  fullWidth
                  onChange={onLabelChangeHandler}
                  sx={{ maxWidth: maxNameWidth }}
                ></TextField>
              </Grid>
              <Grid item xs={11}>
                <TextField
                  value={dataField.description}
                  id={dataField.name}
                  helperText="Single line description of the field."
                  label="description"
                  size="small"
                  fullWidth
                  onChange={onDescriptionChangeHandler}
                ></TextField>
              </Grid>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};
