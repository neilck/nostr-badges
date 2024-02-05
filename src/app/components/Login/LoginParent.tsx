import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { CardTitle } from "@/app/components/items/CardHeadings";

export const LoginParent = ({
  title,
  instructions,
  signInComponent,
  children,
}: {
  title: string;
  instructions: string;
  signInComponent: React.ReactNode;
  children: React.ReactNode;
}) => {
  return (
    <Stack
      direction="column"
      alignItems="center"
      minWidth={320}
      maxWidth={360}
      pt={2}
      pl={2}
      pr={2}
      pb={4}
    >
      <Box>
        <CardTitle sx={{ width: "auto", paddingBottom: 2 }}>{title}</CardTitle>
      </Box>
      {children}
      <Box>
        <Typography variant="body1" paddingTop={2} paddingBottom={2}>
          {instructions}
        </Typography>
        {signInComponent}
      </Box>
    </Stack>
  );
};
