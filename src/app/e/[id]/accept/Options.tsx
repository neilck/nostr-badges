"use client";

import { useAccountContext } from "@/context/AccountContext";
import { SessionState } from "@/context/SessionHelper";
import { Profile } from "@/data/profileLib";
import { NostrEvent } from "@/data/ndk-lite";
import { Badge } from "@/data/badgeLib";
import { Accept } from "./Accept";

interface Props {
  id: string;
  type: string;
  pubkey: string;
  nostrEvent: NostrEvent;
  badgeItems: {
    badge: Badge;
    awardData?: { [key: string]: string } | undefined;
  }[];
  sessionState: SessionState;
}

const LoggedIn = ({ profiles }: { profiles: Record<string, Profile> }) => {
  return <>{JSON.stringify(profiles)}</>;
};

const NotLoggedIn = (props: Props) => {
  return (
    <>
      <Accept {...props} />
    </>
  );
};

export const Options = (props: Props) => {
  const accountContext = useAccountContext();
  const loggedIn = accountContext.state.account != null;
  const profiles = accountContext.state.profiles ?? {};

  if (!loggedIn) {
    return LoggedIn({ profiles: profiles });
  } else {
    return NotLoggedIn(props);
  }
};
