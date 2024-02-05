"use client";

import { useContext, useReducer, createContext, useEffect } from "react";
import { useAccountContext } from "./AccountContext";
import {
  Group,
  loadGroup as fsLoadGroup,
  saveGroup as fsSaveGroup,
} from "../data/groupLib";
import { loadBadge } from "@/data/badgeLib";
import { RequiredBadge } from "./RequiredBadge";
import {
  createGroupEvent,
  deleteGroupEvent,
  toNostrEvent,
} from "@/data/eventLib";
import { publishEvent } from "@/data/publishEvent";

// <---------- REDUCER ---------->
type Action =
  | { type: "setGroup"; groupId: string | null; group: Group | null }
  | { type: "setRequiredBadges"; requiredBadges: RequiredBadge[] | null };

type Dispatch = (action: Action) => void;
type State = {
  groupId: string | null;
  group: Group | null;
  requiredBadges: RequiredBadge[] | null;
};

type GroupProviderProps = { children: React.ReactNode };

const GroupContext = createContext<
  | {
      state: State;
      dispatch: Dispatch;
      loadGroup: (groupId: string, reload?: boolean) => Promise<Group | null>;
      saveGroup: (
        groupId: string,
        group: Group
      ) => Promise<{
        success: boolean;
        group?: Group;
        error?: string;
      }>;
      setGroup: (groupId: string, group: Group) => void;
    }
  | undefined
>(undefined);

function reducer(state: State, action: Action) {
  switch (action.type) {
    case "setGroup": {
      return { ...state, group: action.group, groupId: action.groupId };
    }
    case "setRequiredBadges": {
      return { ...state, requiredBadges: action.requiredBadges };
    }
  }
}

function GroupProvider(props: GroupProviderProps) {
  const { children } = props;
  const accountContext = useAccountContext();

  const [state, dispatch] = useReducer(reducer, {
    groupId: null,
    group: null,
    requiredBadges: null,
  });

  // load required badges
  useEffect(() => {
    if (state.group) {
      loadRequiredBadges(state.group);
    } else {
      dispatch({ type: "setRequiredBadges", requiredBadges: null });
    }
  }, [state.group]);

  const loadGroup = async (
    groupId: string,
    reload?: boolean
  ): Promise<Group | null> => {
    if (groupId == state.groupId && state.group && !reload) return state.group;

    const group = await fsLoadGroup(groupId);
    if (group) {
      dispatch({ type: "setGroup", groupId: groupId, group: group });
      return group;
    } else {
      dispatch({ type: "setGroup", groupId: null, group: null });
      return null;
    }
  };

  const saveGroup = async (
    groupId: string,
    group: Group
  ): Promise<{ success: boolean; group?: Group; error?: string }> => {
    // save badge to database
    const saveResult = await fsSaveGroup(groupId, group);
    if (saveResult.success) {
      const savedGroup = (saveResult as { success: boolean; group: Group })
        .group;
      setGroup(groupId, savedGroup);

      // call server-side event creation with callback
      const createEvent = async (groupId: string, group: Group) => {
        await deleteGroupEvent(group.uid, groupId);
        const event = await createGroupEvent(groupId);
        if (event) {
          // reload group from db to pickup .event field
          loadGroup(groupId, true);
          const nostrEvent = toNostrEvent(event);
          const account = accountContext.state.account;
          if (account) {
            const relays = accountContext.getRelays();
            // publish event
            publishEvent(nostrEvent, relays);
          }
        }
      };

      // async call with callback to return event for publishing
      createEvent(groupId, savedGroup);
    }

    return saveResult;
  };

  const loadRequiredBadges = async (group: Group) => {
    const badges: RequiredBadge[] = [];
    for (let i = 0; i < group.requiredBadges.length; i++) {
      const badgeId = group.requiredBadges[i];
      const badge = await loadBadge(badgeId, "badges");
      badges.push({
        badgeId: badgeId,
        badge: badge,
      });
    }
    dispatch({ type: "setRequiredBadges", requiredBadges: badges });
  };

  const setGroup = (groupId: string, group: Group) => {
    if (groupId == state.groupId) {
      dispatch({ type: "setGroup", groupId: groupId, group: group });
    }
  };

  const value = {
    state,
    dispatch,
    loadGroup: loadGroup,
    saveGroup: saveGroup,
    setGroup: setGroup,
  };

  return (
    <GroupContext.Provider value={value}>
      {props.children}
    </GroupContext.Provider>
  );
}

// use Context methods
const useGroupContext = () => {
  const context = useContext(GroupContext);
  if (context === undefined) {
    throw new Error("useGroupContext must be used within a GroupProvider");
  }
  return context;
};

export { useGroupContext };
export default GroupProvider;
