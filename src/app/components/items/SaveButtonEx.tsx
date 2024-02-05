"use client";

import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Collapse from "@mui/material/Collapse";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { SxProps, Theme } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";

export const SaveButtonEx = (props: {
  onClick: () => Promise<{ success: boolean; mesg?: string }>;
  buttonLabel?: string;
  sx?: SxProps<Theme> | undefined;
  disabled?: boolean;
}) => {
  const { onClick } = props;
  const [isDisabled, setIsDisabled] = useState(false);
  const [buttonLabel, setButtonLabel] = useState(
    props.buttonLabel ? props.buttonLabel : "Save"
  );
  const [isSaving, setIsSaving] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [isSaveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [alertMesg, setAlertMesg] = useState<string>("");

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    callOnSaving();
  };

  const callOnSaving = async () => {
    setShowAlert(false);
    setIsSaving(true);
    setIsDisabled(true);
    setButtonLabel("saving...");
    const result = await onClick();
    let mesg = "";
    if (result.success) {
      setAlertMesg(result.mesg ? result.mesg : "Save successful");
      setSaveSuccess(true);
    } else {
      setAlertMesg(result.mesg ? result.mesg : "Unable to save");
      setSaveSuccess(false);
    }
    setButtonLabel(props.buttonLabel ? props.buttonLabel : "Save");
    setIsDisabled(false);
    setIsSaving(false);
    setShowAlert(true);
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
    >
      <Button
        onClick={handleClick}
        variant="contained"
        color="secondary"
        disabled={
          isDisabled && props.disabled == undefined ? true : props.disabled
        }
        startIcon={isSaving ? <CircularProgress size={15} /> : <SaveIcon />}
        sx={{ width: "140px", ...props.sx }}
      >
        {buttonLabel}
      </Button>

      <Collapse in={showAlert} sx={{ pt: 2 }}>
        <Alert
          severity={isSaveSuccess ? "success" : "error"}
          onClose={() => {
            setShowAlert(false);
          }}
          sx={{ minWidth: "100px", width: "fit-content" }}
        >
          {alertMesg}
        </Alert>
      </Collapse>
    </Box>
  );
};
