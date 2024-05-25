"use client";

import { useRouter } from "next/navigation";
import { useAccountContext } from "@/context/AccountContext";
import { useEffect } from "react";
export default function ProfileIdPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const router = useRouter();
  const accountContext = useAccountContext();
  const profiles = accountContext.state.profiles;

  useEffect(() => {
    if (profiles && profiles.hasOwnProperty(id)) {
      const profile = accountContext.selectCurrentProfile(id);
      router.push("/profile");
    }
  }, [profiles]);

  return <></>;
}
