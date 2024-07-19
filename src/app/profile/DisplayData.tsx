import React from "react";
import * as nip19 from "@/nostr-tools/nip19";
import { Grid, Typography } from "@mui/material";

interface DisplayDataProps {
  data: Record<string, any>; // Object containing data
  keysToShow: string[]; // List of keys to display
}

export const DisplayData: React.FC<DisplayDataProps> = ({
  data,
  keysToShow,
}) => {
  const npub = nip19.npubEncode(data["publickey"]);
  return (
    <Grid container spacing={2} maxWidth="400px">
      <Grid item xs={4}>
        <Typography
          variant="body2"
          color="textSecondary"
          sx={{ overflowWrap: "break-word" }}
        >
          npub
        </Typography>
      </Grid>
      <Grid item xs={8}>
        <Typography variant="body2" sx={{ overflowWrap: "break-word" }}>
          {npub}
        </Typography>
      </Grid>
      {keysToShow.map(
        (key) =>
          data[key] &&
          data[key] !== "" && (
            <React.Fragment key={key}>
              {/* First column: Label */}
              <Grid item xs={4}>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{ overflowWrap: "break-word" }}
                >
                  {key}
                </Typography>
              </Grid>
              {/* Second column: Value */}
              <Grid item xs={8}>
                <Typography variant="body2" sx={{ overflowWrap: "break-word" }}>
                  {data[key]}
                </Typography>
              </Grid>
            </React.Fragment>
          )
      )}
    </Grid>
  );
};
