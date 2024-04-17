"use client";

import { useState, useEffect } from "react";
import { Profile, loadProfile, getEmptyProfile } from "@/data/profileLib";
// import { useAccountContext } from "@/context/AccountContext";

export default function ProfilePage({ params }: { params: { id: string } }) {
  // const accountContext = useAccountContext();

  const { id } = params;
  const [profile, setProfile] = useState(getEmptyProfile());

  useEffect(() => {
    const load = async (id: string) => {
      const profile = await loadProfile(id);
      if (profile) {
        setProfile(profile);
      }
      return;
    };

    load(id);
  }, [id]);
  return <div>{JSON.stringify(profile)}</div>;
}
