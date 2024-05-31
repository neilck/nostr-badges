import theme from "@/app/components/ThemeRegistry/theme";
import Box from "@mui/material/Box";

export default function Section(props: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        mt: 2,
        p: 2,
        width: "100%",
        minHeight: "100px",
        borderColor: theme.palette.grey[500],
        borderRadius: "10px",
        backgroundColor: theme.palette.background.paper,
      }}
    >
      {props.children}
    </Box>
  );
}
