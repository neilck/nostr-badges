"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import TextField from "@mui/material/TextField";
import Checkbox from "@mui/material/Checkbox";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";

import { DocLink } from "@/app/components/items/DocLink";
import { CardHeading } from "@/app/components/items/CardHeadings";
import { ChangeEvent } from "react";
import { useAccountContext } from "@/context/AccountContext";
import { SaveButtonEx } from "@/app/components/items/SaveButtonEx";
import { getDefaultRelays } from "@/data/relays";
import { loadAccount, saveAccount } from "@/data/accountLib";
import { CommonLayout } from "@/app/components/ComonLayout";
import Section from "../../Section";

export default function Relays() {
  const accountContext = useAccountContext();
  const { account } = accountContext.state;
  const dispatch = accountContext.dispatch;

  const [relayValue, setRelayValue] = useState("");
  const [relays, setRelays] = useState<string[]>([]);
  const [useDefaults, setUseDefaults] = useState(true);
  const defaultRelays = getDefaultRelays();

  useEffect(() => {
    if (account != null) {
      if (account.defaultRelays != undefined && !account.defaultRelays) {
        setUseDefaults(false);
      } else {
        setUseDefaults(true);
      }

      if (account.relays != undefined) {
        setRelays(account.relays);
        setRelayValue(account.relays.join("\n"));
      }
    }
  }, [account]);

  const renderDefaultRelays = () => {
    return (
      <Box>
        {defaultRelays.map((relay) => (
          <Typography key={relay} variant="body2">
            {relay}
          </Typography>
        ))}
      </Box>
    );
  };

  const onCheckChanged = (
    event: ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    setUseDefaults(checked);
    if (checked) {
      setRelays([]);
    }
  };

  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;
    setRelayValue(value);
    setRelays(value.split("\n"));
  };

  const onSaveClicked = async () => {
    if (account == null)
      return {
        success: false,
        mesg: "Account not available. Please re-login.",
      };

    const filtered: string[] = [];
    relays.forEach((relay) => {
      let trimmed = relay.trim();
      if (trimmed != "") {
        trimmed = trimmed.toLowerCase();
        filtered.push(trimmed);
      }
    });
    const fresh = await loadAccount(account.uid);
    if (fresh == null)
      return {
        success: false,
        mesg: "Account not available. Please re-login.",
      };

    fresh.defaultRelays = useDefaults;
    fresh.relays = filtered;

    const result = await saveAccount(account.uid, fresh);

    dispatch({ type: "setAccount", account: fresh });
    return { success: true };
  };

  return (
    <CommonLayout developerMode={true}>
      <Box maxWidth="100%">
        <Section>
          <Stack direction="column" pl={3} width="100%" maxWidth={400}>
            <CardHeading>Relays</CardHeading>
            <Typography variant="body2">
              Relays for publishing badges and badge awards.
            </Typography>
            <DocLink doc="badge-integration/configuration">
              learn more...
            </DocLink>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox checked={useDefaults} onChange={onCheckChanged} />
                }
                label="Include default relays"
              />
            </FormGroup>
            {useDefaults && renderDefaultRelays()}
            <Box paddingTop={2} width="280px">
              <CardHeading>Relays</CardHeading>

              <TextField
                multiline
                fullWidth
                rows={6}
                value={relayValue}
                onChange={onChangeHandler}
                helperText="one relay per line, include 'wss://'"
              ></TextField>
            </Box>
            <Stack width="100%" paddingTop={1} alignItems="center">
              <SaveButtonEx onClick={onSaveClicked} />
            </Stack>
          </Stack>
        </Section>
      </Box>
    </CommonLayout>
  );
}
