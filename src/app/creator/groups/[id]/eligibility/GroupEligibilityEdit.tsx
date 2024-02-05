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

import { loadBadge, BadgeParamsList } from "@/data/badgeLib";
import { RequiredBadge } from "@/context/RequiredBadge";
import { Group } from "@/data/groupLib";

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
    for (let i = 0; i < group.requiredBadges.length; i++) {
      const badgeId = group.requiredBadges[i].badgeId;
      const configParams = group.requiredBadges[i].configParams;
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
        configParams: configParams,
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
    for (let i = 0; i < group.requiredBadges.length; i++) {
      if (group.requiredBadges[i].badgeId == badgeId) {
        return;
      }
    }

    const updated = { ...group };
    updated.requiredBadges.push({ badgeId: badgeId, configParams: [] });
    setGroup(updated);
  };

  const deleteClickEventHandler = (badgeId: string) => {
    if (!group || badgeId == "") return;

    const newList: BadgeParamsList = [];

    // skip if match found
    for (let i = 0; i < group.requiredBadges.length; i++) {
      if (group.requiredBadges[i].badgeId != badgeId) {
        newList.push(group.requiredBadges[i]);
      }
    }

    const updated = { ...group, requiredBadges: newList };
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
