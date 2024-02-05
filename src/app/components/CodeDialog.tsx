"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";

export interface Props {
  title: string;
  code: string;
  open: boolean;
  onClose: () => void;
}

export function CodeDialog(props: Props) {
  const { title, code, open, onClose } = props;

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose();
      }}
      maxWidth="md"
    >
      <Box
        display="flex"
        flexDirection="column"
        alignContent={"stretch"}
        padding={2}
      >
        <Box>
          <Typography variant="h6">{title}</Typography>
        </Box>
        <Box overflow="auto">
          <pre
            style={{
              whiteSpace: "pre-wrap",
              overflowWrap: "break-word",
              margin: 0,
            }}
          >
            <code>
              <Typography variant="body1" fontSize={12}>
                {code}
              </Typography>
            </code>
          </pre>
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-evenly",
            width: "100%",
            pt: 2,
          }}
        >
          <Button
            onClick={() => {
              onClose();
            }}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Dialog>
  );
}
