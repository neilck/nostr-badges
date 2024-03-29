"use client";

import { useEffect, useState } from "react";
import { useGroupContext } from "@/context/GroupContext";
import { useAccountContext } from "@/context/AccountContext";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { SaveButtonEx } from "@/app/components/items/SaveButtonEx";
import { AddOutline } from "@/app/components/items/AddOutline";
import { BadgeSelectDialog } from "@/app/components/BadgeSelectDialog";
import { BadgeRowSmallEdit } from "@/app/components/BadgeRowSmallEdit";

import { loadBadge } from "@/data/badgeLib";
import { RequiredBadge } from "@/context/RequiredBadge";
import { Group } from "@/data/groupLib";
import { CardHeading } from "@/app/components/items/CardHeadings";
import { TextField } from "@mui/material";

export const GroupEligibilityEdit = (props: { groupId: string }) => {
  const accountContext = useAccountContext();
  const groupContext = useGroupContext();

  const uid = accountContext.state.account?.uid;
  const groupId = props.groupId;
  const [group, setGroup] = useState<Group | null>(null);
  const [requiredBadges, setRequiredBadges] = useState<RequiredBadge[] | null>(
    null
  );
  const [selectedValue, setSelectedValue] = useState<string>("badges");
  const [badgeSelectOpen, setBadgeSelectOpen] = useState(false);

  useEffect(() => {
    loadGroup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupId]);

  // initial laod
  useEffect(() => {
    setRequiredBadges(groupContext.state.requiredBadges);
  }, [groupContext.state.requiredBadges]);

  // on update
  useEffect(() => {
    if (group) {
      updateRequiredBadges(group);
    } else {
      setRequiredBadges(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group]);

  async function loadGroup() {
    const group = await groupContext.loadGroup(groupId);
    setGroup(group);
  }

  // update context in-memory required badges from offer with loaded badges
  const updateRequiredBadges = async (group: Group) => {
    const badges: RequiredBadge[] = [];
    for (let i = 0; i < group.badges.length; i++) {
      const badgeId = group.badges[i];
      let badge = null;
      if (requiredBadges) {
        for (let x = 0; x < requiredBadges.length; x++) {
          if (badgeId == requiredBadges[x].badgeId) {
            badge = requiredBadges[x].badge;
            break;
          }
        }
      }

      badge = await loadBadge(badgeId, "badges");
      badges.push({
        badgeId: badgeId,
        badge: badge,
      });
    }
    setRequiredBadges(badges);
  };

  const addOnClickHandler = (name: string) => {
    if (name == "+ badge") {
      setBadgeSelectOpen(true);
      return;
    }
  };

  const onSaveClick = async () => {
    if (uid == undefined) {
      return {
        success: false,
        mesg: "Error occured accessing group. Please log out and back in.",
      };
    }

    if (!group) {
      return {
        success: false,
        mesg: "Error occured accessing group. Please log out and back in.",
      };
    }

    const saveResult = await groupContext.saveGroup(groupId, group);
    if (!saveResult.success) {
      return { success: false, mesg: saveResult.error };
    } else {
      groupContext.setGroup(groupId, group);
      return { success: true };
    }
  };

  const badgeSelectOnCloseHandler = async (badgeId: string) => {
    setBadgeSelectOpen(false);
    if (!group || badgeId == "") return;

    // skip if exists
    for (let i = 0; i < group.badges.length; i++) {
      if (group.badges[i] == badgeId) {
        return;
      }
    }

    const updated = { ...group };
    updated.badges.push(badgeId);
    setGroup(updated);
  };

  const deleteClickEventHandler = (badgeId: string) => {
    if (!group || badgeId == "") return;

    const newList = [];

    // skip if match found
    for (let i = 0; i < group.badges.length; i++) {
      if (group.badges[i] != badgeId) {
        newList.push(group.badges[i]);
      }
    }

    const updated = { ...group, badges: newList };
    setGroup(updated);
  };

  const onChangeHandler = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!group) return;

    const updated = { ...group };
    switch (event.currentTarget.id) {
      case "redirect":
        updated.redirect = event.currentTarget.value;
        break;
    }
    setGroup(updated);
  };

  return (
    <Stack
      direction="column"
      justifyContent="center"
      alignItems="left"
      spacing={1}
      pl={2}
      pr={2}
      minWidth="392px"
    >
      <Box>
        <h3>Group Eligibility</h3>
      </Box>
      <Box sx={{ width: "100%" }}>
        <Typography textAlign="left" variant="body1">
          Required badges to join
        </Typography>
      </Box>

      {requiredBadges && selectedValue == "badges" && (
        <Stack spacing={1} alignItems="stretch">
          {requiredBadges.map((requiredBadge) => {
            let imageUrl = requiredBadge.badge
              ? requiredBadge.badge.thumbnail
              : "";
            if (imageUrl == "")
              imageUrl = requiredBadge.badge ? requiredBadge.badge.image : "";
            return (
              <BadgeRowSmallEdit
                key={requiredBadge.badgeId}
                name={requiredBadge.badge ? requiredBadge.badge.name : ""}
                image={imageUrl}
                onDeleteClick={() => {
                  deleteClickEventHandler(requiredBadge.badgeId);
                }}
              ></BadgeRowSmallEdit>
            );
          })}
          <Box display="flex" flexDirection="column" alignItems="center">
            <AddOutline name="+ badge" onClick={addOnClickHandler} />
          </Box>
        </Stack>
      )}
      {group && (
        <Box id="redirectURL">
          <CardHeading>Redirect URL</CardHeading>
          <Box sx={{ width: "100%" }}>
            <Typography textAlign="left" variant="body1">
              Optional redirect URL after approval
            </Typography>
            <Box pt={1.5}>
              <TextField
                id="redirect"
                label="Redirect URL"
                helperText="Redirect user on approval"
                value={group?.redirect}
                onChange={onChangeHandler}
                size="small"
                fullWidth
              />
            </Box>
          </Box>
        </Box>
      )}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-evenly",
          width: "100%",
          pt: 2,
        }}
      >
        <SaveButtonEx onClick={onSaveClick}></SaveButtonEx>
      </Box>
      <BadgeSelectDialog
        open={badgeSelectOpen}
        excludeBadgeIds={[]}
        onClose={badgeSelectOnCloseHandler}
      />
    </Stack>
  );
};
