"use client";

import { getFunctions, httpsCallable } from "firebase/functions";
import { loadApiKey } from "@/data/apiKeyLib";
import { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { DocLink } from "@/app/components/items/DocLink";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { CardHeading } from "@/app/components/items/CardHeadings";
import { useAccountContext } from "@/context/AccountContext";

export const ApiKeyEdit = () => {
  const accountContext = useAccountContext();
  const { account } = accountContext.state;
  const [apiKey, setApiKey] = useState("");

  const functions = getFunctions();
  const regenerateApiKey = httpsCallable(functions, "regenerateApiKey");

  const load = async (uid: string) => {
    const loadedKey = await loadApiKey(uid);
    if (loadedKey != undefined) {
      setApiKey(loadedKey);
    }
  };

  const onClickHandler = async () => {
    if (account?.uid) {
      const result = await regenerateApiKey(account.uid);
      setApiKey(result.data as string);
    }
  };

  useEffect(() => {
    if (account != null) {
      load(account.uid);
    }
  }, [account]);

  return (
    <Stack direction="column" pl={3} maxWidth={400}>
      <Box>
        {apiKey != "" && (
          <>
            {" "}
            <Typography variant="body1">API Key:</Typography>
            <Box
              sx={{
                whiteSpace: "pre-wrap",
                width: "360px",
                wordBreak: "break-word",
                border: 1,
                p: 0.5,
              }}
            >
              <Typography variant="body1">{apiKey}</Typography>
            </Box>
          </>
        )}

        <Stack width="360px" paddingTop={2} alignItems="center">
          <Button
            variant="contained"
            onClick={() => {
              onClickHandler();
            }}
            sx={{ width: "200px" }}
          >
            Generate New API Key
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
};
