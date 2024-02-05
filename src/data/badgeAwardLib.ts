import { getFunctions, httpsCallable } from "firebase/functions";
import {
  SaveResult,
  AddResult,
  loadItems,
  loadItem,
  saveItem,
  deleteItem,
  addItem,
} from "./firestoreLib";

export enum BadgeAwardType {
  Group = "GROUP",
  Badge = "BADGE",
}

export type BadgeAward = {
  uid: string; // publisher uid
  badge: string; // badge id
  awardedTo: string; // awardee uid
  type: BadgeAwardType;
};

// loads badge awards by publisher
export const loadBadgeAwards = async (
  uid: string,
  colPath: string = "badgeawards"
): Promise<Record<string, BadgeAward>> => {
  return loadItems(uid, colPath, true);
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

  // TODO: create badge award event if awardee not anonymous
  // const functions = getFunctions();
  // const createBadgeAwardEvent = httpsCallable(functions, "createBadgeAwardEvent");
  //   const createBadgeAwardResult = await createBadgeAwardEvent({
  //     badgeId: docId,
  //     badgeAward: badgeAward,
  //   });

  //   // @ts-ignore
  //   const { naddr, addressPointer, event, attestation } = createBadgeResult.data;
  //   saveResult.event = event;
  //   saveResult.attestation = attestation;
  //   return saveResult;
};

export const addBadgeAward = async (
  badgeAward: BadgeAward,
  colPath: string = "badgeawards"
): Promise<AddResult> => {
  const addResult: AddResult = await addItem<BadgeAward>(badgeAward, colPath);

  return addResult;
  // TODO: add badge award event if awardee is not anonymous
  //   const functions = getFunctions();

  //   const createBadgeAwardEvent = httpsCallable(functions, "createBadgeAwardEvent");
  //   const createBadgeResult = await createBadgeAwardEvent({
  //     badgeId: addResult.id,
  //     badgeAward: badgeAward,
  //   });

  //   // @ts-ignore
  //   const { naddr, addressPointer, event } = createBadgeResult.data;
  //   addResult.event = event;
};

export const deleteBadgeAward = async (
  docId: string,
  colPath: string = "badgeaward"
): Promise<{ success: boolean; error: string }> => {
  return deleteItem<BadgeAward>(docId, colPath);
};
