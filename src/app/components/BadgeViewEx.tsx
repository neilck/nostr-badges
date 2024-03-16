import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Image from "next/image";
import { BadgeTestLinks } from "./BadgeTestLinks";
import { Event, loadBadgeEvent } from "@/data/eventLib";

export const BadgeViewEx = (props: {
  name: string;
  description: string;
  image: string;
  eventId: string;
}) => {
  const { name, description, image, eventId } = props;
  const isImageUrl = image != "";
  const [event, setEvent] = useState<Event | undefined>(undefined);

  const hasSVGExt = (name: string) => {
    const parts = name.split(".");
    return parts[parts.length - 1].startsWith("svg");
  };

  useEffect(() => {
    const loadEvent = async (id: string) => {
      const event = await loadBadgeEvent(id);
      setEvent(event);
    };

    loadEvent(eventId);
  }, [eventId]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
        mt: 1,
        maxWidth: "380px",
      }}
    >
      <Stack
        direction="column"
        justifyContent="center"
        alignItems="center"
        spacing={1}
        pl={2}
        pr={2}
      >
        {isImageUrl && (
          <Image
            src={image}
            alt="Picture of badge"
            width={1080}
            height={1080}
            object-fit="contain"
            unoptimized={hasSVGExt(image)}
            style={{
              width: "240px",
              height: "240px",
            }}
          />
        )}
        <Typography
          variant="h6"
          fontWeight="400"
          align="center"
          color="grey.900"
          sx={{ pt: 1 }}
        >
          {name}
        </Typography>
        <Box
          sx={{
            whiteSpace: "pre-wrap",
            width: "100%",
            wordBreak: "break-word",
          }}
        >
          <Typography variant="body1" align="left" color="grey.700">
            {description}
          </Typography>
        </Box>
        {event && <BadgeTestLinks event={event} type="BADGE" />}
      </Stack>
    </Box>
  );
};
