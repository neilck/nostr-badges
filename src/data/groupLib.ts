import { getFunctions, httpsCallable } from "firebase/functions";
import {
  AddResult,
  SaveResult,
  loadItems,
  loadItem,
  saveItem,
  deleteItem,
  addItem,
} from "./firestoreLib";
import { BadgeParamsList } from "./badgeLib";

const origin = process.env.NEXT_PUBLIC_APP_ORIGIN;

export type Group = {
  uid: string;
  name: string;
  image: string;
  description: string;
  badges: string[];
  event: string;
  requiredBadges: BadgeParamsList;
};

const emptyGroup: Group = {
  uid: "",
  name: "",
  image: "",
  description: "",
  event: "",
  badges: [],
  requiredBadges: [],
};

export const getEmptyGroup = (): Group => {
  return { ...emptyGroup };
};

export const loadGroups = async (
  uid: string,
  colPath: string = "groups"
): Promise<Record<string, Group>> => {
  const loadedItems = await loadItems<Group>(uid, colPath, true);
  const groups: Record<string, Group> = {};
  Object.keys(loadedItems).forEach((key) => {
    let group = getEmptyGroup();
    let loadedGroup: object = loadedItems[key];
    groups[key] = { ...group, ...loadedGroup };
  });
  return groups;
};

export const loadGroup = async (
  id: string,
  colPath: string = "groups"
): Promise<Group | undefined> => {
  let group = getEmptyGroup();
  const loadedGroup = await loadItem<Group>(id, colPath);
  group = { ...group, ...loadedGroup };
  return group;
};

export const saveGroup = async (
  docId: string,
  group: Group,
  colPath: string = "groups"
) => {
  const oldGroup = await loadGroup(docId, colPath);
  const saveResult: SaveResult = await saveItem<Group>(docId, group, colPath);

  if (saveResult.success) {
    return { success: true, group: group };
  }
  return { success: false, error: saveResult.error };
};

export const addGroup = async (
  group: Group,
  colPath: string = "groups"
): Promise<AddResult> => {
  const addResult: AddResult = await addItem<Group>(group, colPath);

  const functions = getFunctions();
  const createGroupEvent = httpsCallable(functions, "createGroupEvent");
  const createGroupResult = await createGroupEvent({
    groupId: addResult.id,
    group: group,
  });

  // @ts-ignore
  const { naddr, addressPointer, event, attestation } = createGroupResult.data;
  addResult.event = event;
  addResult.attestation = attestation;
  return addResult;
};

export const deleteGroup = async (
  docId: string,
  colPath: string = "groups"
): Promise<{ success: boolean; error: string }> => {
  return deleteItem<Group>(docId, colPath);
};
