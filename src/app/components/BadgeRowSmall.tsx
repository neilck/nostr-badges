import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export const BadgeRowSmall = (props: { name: string; image: string }) => {
  const { name, image } = props;

  return (
    <Card variant="outlined">
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pr: 0.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <CardMedia
            component="img"
            sx={{ width: 40, objectFit: "contain" }}
            image={image}
            alt="badge image"
          />

          <Stack
            direction="column"
            justifyContent="center"
            alignItems="left"
            sx={{
              ml: 2,
              maxHeight: 80,
            }}
          >
            <Typography
              variant="body1"
              fontWeight={500}
              sx={{ minWidth: 0, pt: 0.5 }}
            >
              {name}
            </Typography>
          </Stack>
        </Box>
      </Box>
    </Card>
  );
};
