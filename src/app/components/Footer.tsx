import theme from "./ThemeRegistry/theme";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import MuiNextLink from "./items/MuiNextLink";
export const Footer = (props: any) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        width: "auto",
      }}
    >
      <Box>
        <MuiNextLink
          href="https://coracle.social/groups/naddr1qvzqqqyx7cpzp8ypk43npavn7z853ufmp8lhzclnyhg3aez0sw99jh9saf736g3kqqgrwvpexgmrwvf5xqmrydfnxyurgq7yjfj/notes"
          rel="noopener noreferrer"
          target="_blank"
        >
          <Typography
            variant="subtitle2"
            fontWeight="500"
            pl={0.7}
            sx={{
              "&:hover": { color: { color: theme.palette.blue.dark } },
            }}
          >
            Support
          </Typography>
        </MuiNextLink>
      </Box>
      <Box ml={3}>
        <MuiNextLink
          href="https://github.com/neilck/nostr-badges"
          rel="noopener noreferrer"
          target="_blank"
        >
          <Typography
            variant="subtitle2"
            fontWeight="500"
            pl={0.7}
            sx={{
              "&:hover": { color: { color: theme.palette.blue.dark } },
            }}
          >
            GitHub
          </Typography>
        </MuiNextLink>
      </Box>
      <Box ml={3}>
        <MuiNextLink href="mailto:neil@chong-kit.com">
          <Typography
            variant="subtitle2"
            fontWeight="500"
            pl={0.7}
            sx={{
              "&:hover": { color: { color: theme.palette.blue.dark } },
            }}
          >
            Email Author
          </Typography>
        </MuiNextLink>
      </Box>
    </Box>
  );
};
