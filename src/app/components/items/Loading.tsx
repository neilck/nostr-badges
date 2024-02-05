import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

export const Loading = (props: { display: boolean }) => {
  return (
    <>
      {props.display && (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          width="100%"
          height="100px"
        >
          <CircularProgress />
        </Box>
      )}
    </>
  );
};
