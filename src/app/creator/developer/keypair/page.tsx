"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import theme from "@/app/components/ThemeRegistry/theme";
import { NostrLayout } from "@/app/components/NostrLayout";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { CardHeading } from "@/app/components/items/CardHeadings";
import { KeypairDialog } from "@/app/components/KeypairDialog";
import { useAccountContext } from "@/context/AccountContext";
import { loadIssuerPublicKey } from "@/data/keyPairLib";
import * as nip19 from "@/nostr-tools/nip19";

export default function Nostr() {
  const { loading, account, creatorMode, currentProfile } =
    useAccountContext().state;
  const [publickey, setPublickey] = useState("");
  // Dialog
  const [open, setOpen] = useState(false);

  const onClose = (pubhex: string) => {
    if (pubhex != "") {
      setPublickey(pubhex);
    }
    setOpen(false);
  };

  const loadPublickey = async (uid: string) => {
    const publickey = await loadIssuerPublicKey(uid);
    setPublickey(publickey);
  };

  useEffect(() => {
    if (account?.uid) {
      loadPublickey(account.uid);
    }
  }, [account]);

  return (
    <NostrLayout>
      <Stack direction="column" pl={3} maxWidth={600}>
        <CardHeading>Issuer Keypair</CardHeading>
        <Typography variant="body2">
          Issuer keypair is used to publish badges and badge awards.
        </Typography>
        <Link
          href="../../help/issuerkeypair"
          rel="noopener noreferrer"
          target="_blank"
        >
          <Typography variant="body2" color={theme.palette.primary.main}>
            learn more...
          </Typography>
        </Link>

        <Box sx={{ mt: 2 }}>
          <Typography variant="body1">Current issuer npub:</Typography>
          <Box
            sx={{
              whiteSpace: "pre-wrap",
              width: "360px",
              wordBreak: "break-word",
              border: 1,
              p: 0.5,
            }}
          >
            <Typography variant="body1">
              {nip19.npubEncode(publickey)}
            </Typography>
          </Box>
          <Stack width="360px" paddingTop={2} alignItems="center">
            <Button
              variant="contained"
              onClick={() => {
                setOpen(true);
              }}
              sx={{ width: "100px" }}
            >
              Change
            </Button>
          </Stack>
        </Box>

        <KeypairDialog open={open} onClose={onClose} />
      </Stack>
    </NostrLayout>
  );
}
