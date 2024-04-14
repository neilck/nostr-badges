import getErrorMessage from "@/errors";
import {
  SaveResult,
  AddResult,
  loadItems,
  loadItem,
  saveItem,
  deleteItem,
  addItem,
  getNewItemId,
  loadSharedItems,
} from "./firestoreLib";
import { ConfigParams } from "./badgeConfigLib";
import { generate } from "short-uuid";
import { getFirestore, doc, updateDoc } from "firebase/firestore/lite";

// name of parameter, value
export type DataField = { name: string; label?: string; description?: string };

export type Badge = {
  uid: string;
  created_at: number;
  name: string;
  description: string;
  image: string;
  thumbnail: string;
  identifier: string;
  applyURL: string;
  event: string;
  dataFields: DataField[];
  eventUpdated: boolean;
  shared: boolean;
};

const emptyBadge: Badge = {
  uid: "",
  created_at: 0,
  name: "",
  description: "",
  image: "",
  thumbnail: "",
  identifier: "",
  applyURL: "",
  event: "",
  dataFields: [],
  eventUpdated: false,
  shared: false,
};

export const getEmptyBadge = (): Badge => {
  return { ...emptyBadge };
};

export const loadBadges = async (
  uid: string,
  colPath: string = "badges"
): Promise<Record<string, Badge>> => {
  const loadedItems = await loadItems<Badge>(uid, colPath, true);

  const badges: Record<string, Badge> = {};

  Object.keys(loadedItems).forEach((key) => {
    let badge = getEmptyBadge();
    let loadedBadge: object = loadedItems[key];
    badges[key] = { ...badge, ...loadedBadge };
  });
  return badges;
};

export const loadSharedBadges = async (): Promise<Record<string, Badge>> => {
  const colPath = "badges";
  const loadedItems = await loadSharedItems<Badge>(colPath);
  const badges: Record<string, Badge> = {};
  Object.keys(loadedItems).forEach((key) => {
    let badge = getEmptyBadge();
    let loadedBadge: object = loadedItems[key];
    badges[key] = { ...badge, ...loadedBadge };
  });
  return badges;
};

export const loadBadge = async (
  id: string,
  colPath: string = "badges"
): Promise<Badge | undefined> => {
  let badge = getEmptyBadge();
  const loadedBadge = await loadItem<Badge>(id, colPath);
  badge = { ...badge, ...loadedBadge };
  return badge;
};

export const saveBadge = async (
  docId: string,
  badge: Badge,
  colPath: string = "badges"
) => {
  if (badge.created_at == 0) {
    badge.created_at = Math.floor(Date.now() / 1000);
  }

  badge.eventUpdated = false;

  const saveResult = await saveItem<Badge>(docId, badge, colPath);
  if (saveResult.success) {
    return { success: true, badge: badge };
  }
  return { success: false, error: saveResult.error };
};

export const setBadgeEventUpdated = async (
  docId: string,
  colPath: string = "badges",
  updated: boolean
): Promise<SaveResult> => {
  const db = getFirestore();

  await updateDoc(doc(db, colPath, docId), { eventUpdated: updated }).catch(
    (error) => {
      return { success: false, error: getErrorMessage(error) };
    }
  );
  return { success: true, error: "" };
};

export const getNewId = () => {
  return getNewItemId("badges");
};

export const addBadge = async (
  badge: Badge,
  colPath: string = "badges",
  id?: string
): Promise<AddResult> => {
  if (badge.name == "") badge.name = "new badge";

  if (badge.identifier == "") badge.identifier = generate();

  if (badge.created_at == 0) {
    badge.created_at = Math.floor(Date.now() / 1000);
  }

  const addResult: AddResult = await addItem<Badge>(badge, colPath, id);

  return addResult;
};

export const deleteBadge = async (
  docId: string,
  colPath: string = "badges"
): Promise<{ success: boolean; error: string }> => {
  return deleteItem<Badge>(docId, colPath);
};
