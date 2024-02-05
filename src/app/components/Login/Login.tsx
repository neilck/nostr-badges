import { ReactNode } from "react";
import Stack from "@mui/material/Stack";
import GoogleButton from "./GoogleButton";
import { NostrButton } from "./NostrButton";
import { LoginParent } from "./LoginParent";

export type LoginProps = {
  title: string;
  instructions: string;
  children: ReactNode;
};

export const Login = (props: LoginProps) => {
  const { title, instructions, children } = props;
  const signInComponent: ReactNode = (
    <Stack alignItems="center" spacing={2}>
      <GoogleButton disabled={false} />
      <NostrButton />
    </Stack>
  );

  return (
    <LoginParent
      title={title}
      instructions={instructions}
      signInComponent={signInComponent}
    >
      {children}
    </LoginParent>
  );
};
