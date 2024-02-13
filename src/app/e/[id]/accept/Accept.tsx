"use client";

import { useSessionContext } from "@/context/SessionContext";
import { CardTitle } from "@/app/components/items/CardHeadings";
import { useEffect, useState } from "react";

export const Accept = () => {
  const sessionContext = useSessionContext();
  const [type, setType] = useState<string>("");
  const [title, setTitle] = useState<string>("");

  useEffect(() => {
    console.log(sessionContext.state);
    if (sessionContext.state.session) {
      const type = sessionContext.state.session.type;
      setType(type);
      switch (type) {
        case "BADGE":
          setTitle("Badge earned!");
          break;
        case "GROUP":
          setTitle("Membership approved!");
          break;
        default:
          setTitle("Approved");
      }
    }
  }, [sessionContext.state]);

  return (
    <>
      <CardTitle>{title}</CardTitle>
    </>
  );
};
