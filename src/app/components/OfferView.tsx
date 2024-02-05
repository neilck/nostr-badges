import Box from "@mui/material/Box";
import CardMedia from "@mui/material/CardMedia";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { ItemRowSmall } from "./ItemRowSmall";
import { CardTitle, CardSubHeading } from "./items/CardHeadings";

export const OfferView = (props: {
  offerName: string;
  offerDescription: string;
  offerImage?: string;
  groupName?: string;
  groupDescription?: string;
  groupImage?: string;
}) => {
  const { groupName, groupDescription, groupImage } = props;
  const hasGroup = groupName != undefined;
  const url = props.offerImage ? props.offerImage : undefined;
  return (
    <Stack direction="column">
      {url && url != "" && (
        <CardMedia
          component="img"
          sx={{
            width: "100%",
            height: "auto",
            objectFit: "cover",
            pb: 2,
          }}
          image={url}
          alt="badge image"
        />
      )}
      <CardTitle>{props.offerName}</CardTitle>
      <Box sx={{ pt: 1, pb: 1 }}>
        <Typography variant="body1">{props.offerDescription}</Typography>
      </Box>
      <CardSubHeading sx={{ pb: 0 }}>Exclusive for</CardSubHeading>

      {hasGroup && (
        <ItemRowSmall
          id="memberBadge"
          key="memberBadge"
          name={groupName}
          description={groupDescription ? groupDescription : ""}
          image={groupImage ? groupImage : ""}
          sx={{ width: "350px" }}
        />
      )}
    </Stack>
  );
};
