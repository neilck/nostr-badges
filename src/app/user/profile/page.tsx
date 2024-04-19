"use client";

import theme from "@/app/components/ThemeRegistry/theme";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAccountContext } from "@/context/AccountContext";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

import { CommonLayout } from "@/app/components/ComonLayout";
import { AddProfileDialog } from "@/app/components/AddProfileDialog";
import Profile from "@/app/components/Profile";

export default function ProfilePage() {
  const accountContext = useAccountContext();
  const router = useRouter();
  const searchParams = useSearchParams();

  const addParam = searchParams.get("add");
  const [openAdd, setOpenAdd] = useState(false);

  const profile = accountContext.state.currentProfile;
  const loading = accountContext.state.loading;

  useEffect(() => {
    setOpenAdd(addParam === "true" ? true : false);
  }, [addParam]);

  const handleAddClose = () => {
    setOpenAdd(false);
    router.push("/user/profile");
  };

  return (
    <CommonLayout developerMode={false}>
      {loading && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <CircularProgress />
        </Box>
      )}
      {!loading && (
        <Box display="flex" flexDirection="column">
          <Profile />
          <Button>Manage Accounts</Button>
        </Box>
      )}
      <AddProfileDialog open={openAdd} onClose={handleAddClose} />
    </CommonLayout>
  );
}
