import * as nip19 from "@/nostr-tools/nip19";
import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Image from "next/image";

export const BadgeView = (props: {
  name: string;
  description: string;
  image: string;
  pubkey?: string;
  issuerName?: string;
}) => {
  const { name, description, image, pubkey, issuerName } = props;
  const isImageUrl = image != "";
  let issuerLink = "";
  if (pubkey && issuerName) {
    const npub = nip19.npubEncode(pubkey);
    issuerLink = `${process.env.NEXT_PUBLIC_NJUMP_HOST}${npub}`;
  }

  const hasSVGExt = (name: string) => {
    const parts = name.split(".");
    return parts[parts.length - 1].startsWith("svg");
  };

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
        {issuerLink != "" && (
          <Box>
            <Typography variant="body2" sx={{ display: "inline" }}>
              Issued by
            </Typography>
            <Link href={issuerLink} underline="none">
              <Typography
                variant="body2"
                fontWeight="600"
                sx={{ display: "inline" }}
              >
                {" " + issuerName}
              </Typography>
            </Link>
          </Box>
        )}
      </Stack>
    </Box>
  );
};
