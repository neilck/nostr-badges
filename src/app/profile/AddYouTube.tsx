import React from "react";
import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { useAccountContext } from "@/context/AccountContext";
import { PrimaryButton } from "@/app/components/items/PrimaryButton";
import { CopiableText } from "../components/items/CopiableText";

import getChannel from "@/google-api/getChannel";
import { Socials, loadAkaBadge } from "@/data/akaBadgeLib";
import {
  BadgeAward,
  addBadgeAward,
  getEmptyBadgeAward,
} from "@/data/badgeAwardLib";
import { loadBadge } from "@/data/badgeLib";

const helperText = "e.g. https://www.youtube.com/@handle";

function extractHandle(url: string): string | null {
  const regex = /https:\/\/www\.youtube\.\w{2,3}(\.\w{2})?\/(@[^\/]+)/;
  const match = url.match(regex);
  return match ? match[2] : null;
}

interface AddYouTubeProps {
  npub: string;
  open: boolean;
  onClose: () => void;
}

const AddYouTube: React.FC<AddYouTubeProps> = ({ npub, open, onClose }) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [channelUrl, setChannelUrl] = useState("");
  const [handle, setHandle] = useState("");
  const [error, setError] = useState(helperText);
  const [verifyError, setVerifyError] = useState("");
  const [status, setStatus] = useState("");

  const accountContext = useAccountContext();

  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (verifyError != "") {
      setVerifyError("");
    }
    const value = event.currentTarget.value;
    setChannelUrl(value);
  };

  const onBlurHandler = (event: React.FocusEvent<HTMLInputElement>) => {
    if (channelUrl == "") {
      setError(helperText);
      setHandle("");
      return;
    }

    const handle = extractHandle(channelUrl);
    if (!handle) {
      setError("Handle not found in URL");
      setHandle("");
    } else {
      setHandle(handle);
      setError(helperText);
    }
  };

  const doVerify = async () => {
    if (handle == "") {
      return;
    }

    setStatus("verifying...");
    setIsVerifying(true);
    const result = await getChannel(handle);
    if (!result.success) {
      setVerifyError(result.error);
      setIsVerifying(false);
      return;
    }

    if (!result.description.includes(npub)) {
      setVerifyError("npub text not found in description");
      setIsVerifying(false);
      return;
    }

    setStatus("saving...");
    const youTubeBadge = await loadAkaBadge(Socials.YouTube);
    if (youTubeBadge == undefined) {
      setVerifyError("YouTube Channel Owner badge not found.");
      setIsVerifying(false);
      return;
    }

    const badge = await loadBadge(youTubeBadge.id);
    if (badge == undefined) {
      setVerifyError("YouTube Channel Owner badge not found.");
      setIsVerifying(false);
      return;
    }

    let channelUrl = result.customUrl;
    if (channelUrl.startsWith("@")) {
      channelUrl = "https://www.youtube.com/" + channelUrl;
    }
    const data = {
      title: result.title,
      channelUrl: channelUrl,
      subscriberCount: result.subscriberCount,
      videoCount: result.videoCount,
      viewCount: result.viewCount,
    };

    /*
    badgeAward.uid = badge.uid;
    badgeAward.badge = youTubeBadge.id;
    badgeAward.awardedTo = accountContext.currentProfile.uid;
    badgeAward.publickey = badge.publickey;
    badgeAward.data = data;
    */

    // to do: add createBadgeAward function to data/serverActions (like sessionCreateBadgeAwards)
    // create events like sessionContext.publishEvents();

    console.log(youTubeBadge);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "400px",
          height: "460px",
          rowGap: 2,
          pt: 3,
          pl: 4,
          pr: 4,
          pb: 4,
        }}
      >
        <Typography variant="body1" fontWeight={600}>
          Add your YouTube Channel
        </Typography>
        <Box>
          <Typography variant="body1" paddingBottom={1}>
            1. Enter your Channel URL
          </Typography>
          <TextField
            size="small"
            label="Channel URL"
            helperText={error}
            disabled={isVerifying}
            value={channelUrl}
            onChange={onChangeHandler}
            onBlur={onBlurHandler}
            error={error !== helperText}
            fullWidth
          ></TextField>
        </Box>
        <Box maxWidth="300px">
          <Typography variant="body1" paddingBottom={1}>
            2. Add this text to the channel's description
          </Typography>
          <CopiableText initValue={npub} variant="subtitle1"></CopiableText>
        </Box>

        <Box paddingBottom={1}>
          <Typography variant="body1">
            3. Click Verify below once ready
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            widows: "100%",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {isVerifying && (
            <>
              <CircularProgress />
              <Typography variant="subtitle1" fontStyle="italic">
                {status}
              </Typography>

              <Button
                onClick={() => {
                  setIsVerifying(false);
                }}
              >
                cancel
              </Button>
            </>
          )}
          {!isVerifying && (
            <PrimaryButton
              buttonLabel="Verify"
              disabledLabel=""
              onClick={doVerify}
            ></PrimaryButton>
          )}
        </Box>
        {verifyError != "" && (
          <>
            <Alert severity="error" sx={{ width: "100%" }}>
              {verifyError}
            </Alert>
          </>
        )}
      </Box>
    </Dialog>
  );
};

export default AddYouTube;
