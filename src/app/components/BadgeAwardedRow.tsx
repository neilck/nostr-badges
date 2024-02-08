import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import Image from "next/image";
import ChecBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import { shortenDesc } from "@/app/utils/utils";

export const BadgeAwardedRow = (props: {
  name: string;
  description: string;
  image: string;
  awarded?: boolean;
}) => {
  const { name, description, image, awarded } = props;
  const shortDesc = shortenDesc(description, 50);

  const hasSVGExt = (name: string) => {
    const parts = name.split(".");
    return parts[parts.length - 1].startsWith("svg");
  };

  return (
    <Card elevation={2}>
      <Box sx={{ display: "flex" }}>
        <Box sx={{ width: 80, height: 80 }}>
          <Image
            src={image}
            alt="Picture of badge"
            width={128}
            height={128}
            object-fit="contain"
            unoptimized={hasSVGExt(image)}
            style={{
              width: "80px",
              height: "80px",
            }}
          />
        </Box>
        <Box sx={{ width: "180px", ml: 2, maxHeight: 80, pb: 1 }}>
          <Stack direction="column" justifyContent="left" alignItems="left">
            <div
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                width: "16rem",
              }}
            >
              <Typography
                noWrap
                variant="body1"
                fontWeight={600}
                sx={{ minWidth: 0, pt: 0.5 }}
              >
                {name}
              </Typography>
            </div>

            <Typography variant="body2" whiteSpace="pre-wrap">
              {shortDesc}
            </Typography>
          </Stack>
        </Box>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="flex-start"
          width="48px"
        >
          {awarded && (
            <ChecBoxIcon
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "4px",
                boxSizing: "content-box",
                color: "white",
                backgroundColor: "green",
              }}
            />
          )}
          {!awarded && (
            <CheckBoxOutlineBlankIcon
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "4px",
                boxSizing: "content-box",
                color: "black",
                backgroundColor: "white",
              }}
            />
          )}
        </Box>
      </Box>
    </Card>
  );
};
