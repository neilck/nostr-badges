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

export enum OfferType {
  link = "LINK",
}

export type Offer = {
  uid: string;
  name: string;
  description: string;
  group: string;
  type: string;
  image: string;
  created?: { seconds: number; nanoseconds: number };
  redeemTitle: string;
  redeem: string;
  linkText: string;
  linkURL: string;
  code: string;
  event: string;
  requiredBadges: BadgeParamsList;
};

const emptyOffer: Offer = {
  uid: "",
  name: "",
  description: "",
  group: "",
  type: "",
  image: "",
  redeem: "",
  redeemTitle: "",
  linkText: "",
  linkURL: "",
  code: "",
  event: "",
  requiredBadges: [],
};

export const getEmptyOffer = (): Offer => {
  return { ...emptyOffer };
};

export const loadOffers = async (
  uid: string
): Promise<Record<string, Offer>> => {
  const colPath = "offers";
  const loadedItems = await loadItems<Offer>(uid, colPath, true);
  const offers: Record<string, Offer> = {};
  Object.keys(loadedItems).forEach((key) => {
    let offer = getEmptyOffer();
    let loadedOffer: object = loadedItems[key];
    offers[key] = { ...offer, ...loadedOffer };
  });
  return offers;
};

export const loadOffer = async (docId: string): Promise<Offer | undefined> => {
  const colPath = `offers`;
  let offer = getEmptyOffer();
  const loadedOffer = await loadItem<Offer>(docId, colPath);
  offer = { ...offer, ...loadedOffer };
  return offer;
};

export const saveOffer = async (docId: string, offer: Offer) => {
  const colPath = `offers`;
  const oldOffer = await loadOffer(docId);
  const saveResult: SaveResult = await saveItem<Offer>(docId, offer, colPath);
  if (saveResult.success) {
    return { success: true, offer: offer };
  }
  return { success: false, error: saveResult.error };
};

export const addOffer = async (offer: Offer): Promise<AddResult> => {
  const colPath = `offers`;
  const addResult: AddResult = await addItem<Offer>(offer, colPath);
  return addResult;
};

export const deleteOffer = async (
  docId: string
): Promise<{ success: boolean; error: string }> => {
  return deleteItem<Offer>(docId, "offers");
};
