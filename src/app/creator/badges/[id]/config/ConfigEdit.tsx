"use client";

import { useEffect, useState } from "react";
import theme from "@/app/components/ThemeRegistry/theme";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

import { SaveButtonEx } from "@/app/components/items/SaveButtonEx";
import { ConfigManager } from "./ConfigManager";
import { Badge } from "@/data/badgeLib";
import {
  BadgeConfig,
  ConfigParam,
  saveBadgeConfig,
  addBadgeConfig,
} from "@/data/badgeConfigLib";
import { useBadgeContext } from "@/context/BadgeContext";
import { CopiableTextSmall } from "@/app/components/items/CopiableTextSmall";

export const ConfigEdit = (props: { docId: string }) => {
  const { docId } = props;
  const badgeContext = useBadgeContext();

  const [badge, setBadge] = useState<Badge | null>(null);
  const [config, setConfig] = useState<BadgeConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasConfig, setHasConfig] = useState(false);

  useEffect(() => {
    badgeContext.loadBadge(docId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [docId]);

  useEffect(() => {
    if (badgeContext.state.badge) setBadge(badgeContext.state.badge);
  }, [badgeContext.state.badge]);

  useEffect(() => {
    if (badgeContext.state.config) {
      setConfig(badgeContext.state.config);
      setIsLoading(false);
    }
  }, [badgeContext.state.config]);

  const onSaveClick = async () => {
    if (!badge) return { success: false };

    let saveResult = await badgeContext.saveBadge(docId, badge);

    if (!saveResult.success) {
      return { success: false, mesg: saveResult.error };
    } else {
      badgeContext.setBadge(docId, badge);
    }

    if (config) {
      if (hasConfig) {
        saveResult = await saveBadgeConfig(badge.uid, docId, config);
      } else {
        saveResult = await addBadgeConfig(badge.uid, docId, config);
      }

      if (!saveResult.success) {
        return { success: false, mesg: saveResult.error };
      } else {
        badgeContext.setConfig(docId, config);
        setHasConfig(true);
      }
    }

    return { success: true };
  };

  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!badge) return;

    const updated = { ...badge };
    switch (event.currentTarget.id) {
      case "identifier":
        updated.identifier = event.currentTarget.value;
        break;
      case "applyURL":
        updated.applyURL = event.currentTarget.value;
        break;
      case "shared":
        updated.shared = event.currentTarget.checked;
        break;
    }
    setBadge(updated);
  };

  const onUserParamsChangedHandler = (configParams: ConfigParam[]) => {
    if (!config) return;
    const updated = { ...config };
    updated.configParams = configParams;
    setConfig(updated);
  };

  return (
    <>
      {!isLoading && badge && config && (
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="center"
          spacing={2.5}
          pl={2}
          pr={2}
        >
          <Box>
            <h3>Integration Configuration</h3>
          </Box>

          <Box sx={{ width: "100%" }}>
            <TextField
              id="identifier"
              label="Badge Identifier"
              helperText="unique identifier as per NIP-58"
              value={badge.identifier}
              onChange={onChangeHandler}
              size="small"
              fullWidth
              sx={{
                input: {
                  background: theme.palette.common.white,
                },
              }}
            />
          </Box>

          <Box sx={{ width: "100%" }}>
            <Typography textAlign="left" fontWeight={600} variant="body1">
              Badge Award Page
            </Typography>
            <TextField
              id="applyURL"
              label="Redirect URL"
              helperText="e.g. https://domain.com/path/badgeaward"
              value={badge.applyURL}
              onChange={onChangeHandler}
              size="small"
              fullWidth
              sx={{
                mt: 1.5,
                input: {
                  background: theme.palette.common.white,
                },
              }}
            />
          </Box>
          <Box sx={{ width: "100%" }}>
            <Typography textAlign="left" fontWeight={600} variant="body1">
              Get Badge Link
            </Typography>
            <CopiableTextSmall
              copyText={`${process.env.NEXT_PUBLIC_AKA_GET}/njump/${badge.event}`}
            >
              <Typography
                variant="body1"
                sx={{ color: theme.palette.blue.dark }}
              >
                get badge link
              </Typography>
            </CopiableTextSmall>
          </Box>
          <Box sx={{ width: "100%" }}>
            <Typography textAlign="left" fontWeight={600} variant="body1">
              Configuration Parameters
            </Typography>
            <Typography textAlign="left" variant="body1">
              Configuration parameters for this badge.
            </Typography>
          </Box>
          <ConfigManager
            configParams={config.configParams}
            onChange={onUserParamsChangedHandler}
          />

          <Box width="100%">
            <Box sx={{ width: "100%" }}>
              <Typography textAlign="left" fontWeight={600} variant="body1">
                Share in Badge Library
              </Typography>
              <Typography textAlign="left" variant="body1">
                Share as group eligbility criteria.
              </Typography>
            </Box>

            <Box
              id="shared"
              display="flex"
              flexDirection="row"
              alignItems="center"
              mt={0}
            >
              <Checkbox
                id="shared"
                checked={badge.shared}
                onChange={onChangeHandler}
              />
              <Typography>Shared</Typography>
            </Box>
          </Box>
          <Box
            sx={{
              pt: 2.5,
              display: "flex",
              justifyContent: "space-evenly",
              width: "100%",
            }}
          >
            <SaveButtonEx onClick={onSaveClick} />
          </Box>
        </Stack>
      )}
    </>
  );
};
