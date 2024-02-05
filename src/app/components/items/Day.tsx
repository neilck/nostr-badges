import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import theme from "@/app/components/ThemeRegistry/theme";

export const Day = ({ seconds }: { seconds: number | undefined }) => {
  let date: Date | undefined = undefined;
  let line1 = "no date";
  let line2 = "";
  if (seconds) {
    date = new Date(seconds * 1000);
    line1 = date.toLocaleDateString("en-us", {
      month: "short",
      day: "numeric",
    });
    line2 = date.getFullYear().toString();
  }

  return (
    <Card variant="outlined" sx={{ p: 0.5, minWidth: "56px" }}>
      <Stack direction="column">
        <Typography fontSize={12} textAlign="center">
          {line1}
        </Typography>
        <Typography fontSize={12} textAlign="center">
          {line2}
        </Typography>
      </Stack>
    </Card>
  );
};
