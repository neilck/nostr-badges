"use client";

import { useEffect } from "react";
import { useAccountContext } from "@/context/AccountContext";
import { useRouter } from "next/navigation";

export default function Home() {
  const accountContext = useAccountContext();
  const router = useRouter();

  const account = accountContext.state.account;

  // redirect is logged in
  useEffect(() => {
    if (account) {
      router.push("/profile");
    }
  }, [account]);

  return <></>;
}
