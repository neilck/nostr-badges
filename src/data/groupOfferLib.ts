import { getFunctions, httpsCallable } from "firebase/functions";
import {
  AddResult,
  SaveResult,
  loadGroupItems,
  loadItem,
  saveItem,
  deleteItem,
  addItem,
} from "./firestoreLib";

const origin = process.env.NEXT_PUBLIC_APP_ORIGIN;

export enum GroupOfferType {
  link = "LINK",
}

export type GroupOffer = {
  uid: string;
  name: string;
  description: string;
  group: string;
  type: string;
  image: string;
  created?: { seconds: number; nanoseconds: number };
  redeem: string;
  linkText: string;
  linkURL: string;
  code: string;
};

export const loadGroupOffers = async (
  uid: string,
  groupId: string,
  limit?: number
): Promise<Record<string, GroupOffer>> => {
  const colPath = `offers`;
  return loadGroupItems(uid, groupId, colPath, limit);
};

export const loadGroupOffer = async (
  docId: string
): Promise<GroupOffer | undefined> => {
  const colPath = `offers`;
  return loadItem<GroupOffer>(docId, colPath);
};

export const saveGroupOffer = async (
  docId: string,
  groupOffer: GroupOffer
): Promise<SaveResult> => {
  const colPath = `offers`;
  const oldOffer = await loadGroupOffer(docId);
  const saveResult: SaveResult = await saveItem<GroupOffer>(
    docId,
    groupOffer,
    colPath
  );

  const functions = getFunctions();
  const createOfferEvent = httpsCallable(functions, "createOfferEvent");
  const createOfferResult = await createOfferEvent({
    offerId: docId,
    offer: groupOffer,
  });

  return saveResult;
};

export const addGroupOffer = async (
  groupOffer: GroupOffer
): Promise<AddResult> => {
  const colPath = `offers`;
  const addResult: AddResult = await addItem<GroupOffer>(groupOffer, colPath);

  const functions = getFunctions();
  const createOfferEvent = httpsCallable(functions, "createOfferEvent");
  const createOfferResult = await createOfferEvent({
    offerId: addResult.id,
    offer: groupOffer,
  });

  // @ts-ignore
  const { naddr, addressPointer, event, attestation } = createOfferResult.data;
  addResult.event = event;
  addResult.attestation = attestation;
  return addResult;
};

export const deleteGroupOffer = async (
  docId: string,
  groupId: string
): Promise<{ success: boolean; error: string }> => {
  return deleteItem<GroupOffer>(docId, "offers");
};
