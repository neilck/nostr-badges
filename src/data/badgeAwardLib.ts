import { FieldValue } from "firebase/firestore";
import {
  SaveResult,
  AddResult,
  loadItems,
  loadItem,
  saveItem,
  deleteItem,
  addItem,
  loadPubkeyItems,
  serverTimestamp,
} from "./firestoreLib";

export enum BadgeAwardType {
  Group = "GROUP",
  Badge = "BADGE",
}

export type BadgeAward = {
  created: FieldValue;
  uid: string; // publisher uid
  badge: string; // badge id
  awardedTo: string; // awardee uid
  publickey: string;
  type: BadgeAwardType;
  event: string;
  data?: object;
};

export const getEmptyBadgeAward = (): BadgeAward => {
  return {
    created: serverTimestamp(),
    uid: "",
    badge: "",
    awardedTo: "",
    publickey: "",
    type: BadgeAwardType.Badge,
    event: "",
    data: {},
  };
};

// loads badge awards by publisher
export const loadBadgeAwards = async (
  uid: string,
  colPath: string = "badgeawards"
): Promise<Record<string, BadgeAward>> => {
  return loadItems(uid, colPath, true);
};

// loads badge awards by publisher
export const loadBadgeAwardsByPubkey = async (
  publickey: string,
  colPath: string = "badgeawards"
): Promise<Record<string, BadgeAward>> => {
  return loadPubkeyItems(publickey, colPath, true);
};

// load badge award by id
export const loadBadgeAward = async (
  id: string,
  colPath: string = "badgeawards"
): Promise<BadgeAward | undefined> => {
  return loadItem<BadgeAward>(id, colPath);
};

export const saveBadgeAward = async (
  docId: string,
  badgeAward: BadgeAward,
  colPath: string = "badgeawards"
): Promise<SaveResult> => {
  const saveResult: SaveResult = await saveItem<BadgeAward>(
    docId,
    badgeAward,
    colPath
  );
  return saveResult;
};

export const addBadgeAward = async (
  badgeAward: BadgeAward,
  colPath: string = "badgeawards"
): Promise<AddResult> => {
  const addResult: AddResult = await addItem<BadgeAward>(badgeAward, colPath);

  return addResult;
};

export const deleteBadgeAward = async (
  docId: string,
  colPath: string = "badgeaward"
): Promise<{ success: boolean; error: string }> => {
  return deleteItem<BadgeAward>(docId, colPath);
};
