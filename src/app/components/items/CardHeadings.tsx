import { ReactNode } from "react";

import { SxProps } from "@mui/material";
import { Theme } from "@mui/material";
import Typography from "@mui/material/Typography";

export type CardHeadingProps = {
  children: ReactNode;
  sx?: SxProps<Theme> | undefined;
};

export const CardTitle = (props: CardHeadingProps) => {
  const { children, sx } = props;
  return (
    <Typography
      variant="h5"
      align="left"
      width="100%"
      fontWeight={600}
      sx={sx ? sx : { pt: 0.5 }}
    >
      {children}
    </Typography>
  );
};

export const CardHeading = (props: CardHeadingProps) => {
  const { children, sx } = props;
  return (
    <Typography
      variant="body1"
      align="left"
      width="100%"
      fontWeight={600}
      sx={sx ? sx : { pt: 0.5 }}
    >
      {children}
    </Typography>
  );
};

export const CardSubHeading = (props: CardHeadingProps) => {
  const { children, sx } = props;
  return (
    <Typography
      variant="body1"
      align="left"
      width="100%"
      fontWeight={500}
      sx={sx ? sx : { pt: 0.5 }}
    >
      {children}
    </Typography>
  );
};
