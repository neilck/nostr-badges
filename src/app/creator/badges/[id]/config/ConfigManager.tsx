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
import { ConfigParam } from "@/data/badgeConfigLib";

export const ConfigManager = (props: {
  configParams: ConfigParam[];
  nameLabel?: string;
  valueLabel?: string;
  onChange?: (configParams: ConfigParam[]) => void;
}) => {
  const nameLabel = props.nameLabel ? props.nameLabel : "Name";
  const valueLabel = props.valueLabel ? props.valueLabel : "Value";
  const nameWidth = 4;
  const valueWidth = 7;
  const [configParams, setConfigParams] = useState(props.configParams);
  const [newField, setNewField] = useState("");

  useEffect(() => {
    if (props.onChange) {
      props.onChange(configParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configParams]);

  const updateField = (name: string, value: string) => {
    const updated: ConfigParam[] = [...configParams];
    for (let i = 0; i < updated.length; i++) {
      const configParam = updated[i];
      if (configParam.name == name) {
        configParam.value = value;
        break;
      }
    }

    setConfigParams(updated);
  };

  const onAddClicked = () => {
    if (newField == "") return;

    let prefixedName = newField;

    let exists = false;
    for (let i = 0; i < configParams.length; i++) {
      if (configParams[i].name == newField) {
        exists = true;
        break;
      }
    }

    if (!exists) {
      const configParam: ConfigParam = {
        name: prefixedName,
        value: "",
      };

      const updated: ConfigParam[] = [...configParams];
      updated.push(configParam);
      setConfigParams(updated);
    } else {
      // clear value if already exists
      updateField(prefixedName, "");
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

  const onValueChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const key = event.currentTarget.id;
    const value = event.currentTarget.value;
    updateField(key, value);
  };

  const onDeleteClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const name = event.currentTarget.id;
    const updated: ConfigParam[] = [];

    for (let i = 0; i < configParams.length; i++) {
      if (configParams[i].name != name) {
        updated.push(configParams[i]);
      }
    }
    setConfigParams(updated);
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="strech">
      <Box display="flex" flexDirection="row">
        <TextField
          id="newField"
          value={newField}
          onChange={onChangeHandler}
          label={nameLabel}
          size="small"
          fullWidth
        ></TextField>
        <Button onClick={onAddClicked}>add</Button>
      </Box>

      {configParams.length > 0 && (
        <Grid container rowGap={1} spacing={1} pt={2.5} pl={1}>
          <Grid container>
            <Grid item xs={nameWidth}>
              <Typography variant="body2">{nameLabel}</Typography>
            </Grid>
            <Grid item xs={valueWidth}>
              <Typography variant="body2">{valueLabel}</Typography>
            </Grid>
          </Grid>
          {configParams.map((configParam) => (
            <Grid container key={configParam.name}>
              <Grid
                item
                xs={nameWidth}
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
                  <Typography variant="body2">{configParam.name}</Typography>
                </Box>
              </Grid>
              <Grid item xs={valueWidth}>
                <TextField
                  value={configParam.value}
                  id={configParam.name}
                  size="small"
                  fullWidth
                  onChange={onValueChangeHandler}
                ></TextField>
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
                    id={configParam.name}
                    size="small"
                    onClick={onDeleteClick}
                    sx={{ color: theme.palette.blue.main }}
                  >
                    <ClearIcon />
                  </IconButton>
                </Box>
              </Grid>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};
