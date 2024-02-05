import { NDKEvent, NostrEvent } from "@nostr-dev-kit/ndk";
import {
  getFirestore,
  doc,
  collection,
  getDocs,
  query,
  where,
  limit,
  deleteDoc,
} from "firebase/firestore/lite";
import { getFunctions, httpsCallable } from "firebase/functions";
import { loadItem } from "./firestoreLib";

// <---------- Event ---------->
export type ObjectTag = {
  name: string;
  values: string[];
};

export type Event = {
  // nostr event fields
  created_at: number;
  content: string;
  tags: ObjectTag[]; // firebase doesn't support string[][]
  kind: number;
  pubkey: string;
  id: string;
  sig: string;

  // additional fields
  uid: string;
  docRef: any; // DocumentReference
  address: string;
  encodedAddress: string;
  firstP: string; // value of first p tag
  firstA: string; // value of first a tag
  firstE: string; // value of first e tag
};

const emptyEvent: Event = {
  // nostr event fields
  created_at: 0,
  content: "",
  tags: [], // firebase doesn't support string[][]
  kind: -1,
  pubkey: "",
  id: "",
  sig: "",

  // additional fields
  uid: "",
  docRef: "",
  address: "",
  encodedAddress: "",
  firstP: "", // value of first p tag
  firstA: "", // value of first a tag
  firstE: "", // value of first e tag
};

export const getEmptyEvent = (): Event => {
  return { ...emptyEvent };
};

export const createBadgeEvent = async (badgeId: string) => {
  const functions = getFunctions();
  const createBadgeEvent = httpsCallable(functions, "createBadgeEvent");
  const createBadgeResult = await createBadgeEvent({
    badgeId: badgeId,
  });
  const data = createBadgeResult.data;
  if (data == undefined) return undefined;
  else return data as Event;
};

export const loadBadgeEvent = async (id: string) => {
  return await loadItem<Event>(id, "events");
};

export const deleteBadgeEvent = async (uid: string, badgeId: string) => {
  return deleteEvent(uid, badgeId, "badges");
};

/*
export const createOfferEvent = async (offerId: string) => {
  const functions = getFunctions();
  const createOfferEvent = httpsCallable(functions, "createOfferEvent");
  const createOfferResult = await createOfferEvent({
    offerId: offerId,
  });
  const data = createOfferResult.data;
  if (data == undefined) return undefined;
  else return data as Event;
};

export const deleteOfferEvent = async (uid: string, offerId: string) => {
  return deleteEvent(uid, offerId, "offers");
};
*/

export const createGroupEvent = async (groupId: string) => {
  const functions = getFunctions();
  const createGroupEvent = httpsCallable(functions, "createGroupEvent");
  const createGroupResult = await createGroupEvent({
    groupId: groupId,
  });
  const data = createGroupResult.data;
  if (data == undefined) return undefined;
  else return data as Event;
};

export const deleteGroupEvent = async (uid: string, groupId: string) => {
  return deleteEvent(uid, groupId, "groups");
};

export const getEmptyNostrEvent = (): NostrEvent => {
  return {
    created_at: 0,
    content: "",
    tags: [],
    kind: -1,
    pubkey: "",
    id: "",
    sig: "",
  };
};

export const fromNDKEvent = async (event: NDKEvent) => {
  const nostrEvent: NostrEvent = await event.toNostrEvent();
  let saveEvent = getEmptyEvent();

  // copy data from nostr event, converting tags as
  // firebase doesn't support directly nested arrays
  const { tags, ...noTagsEvent } = nostrEvent;
  saveEvent = { ...saveEvent, ...noTagsEvent };

  const objectTags = tags.map((tag) => {
    const [name, ...values] = tag;
    return { name, values };
  });

  saveEvent.tags = objectTags;

  // add additional info
  saveEvent.address = event.tagAddress();
  saveEvent.encodedAddress = event.encode();
  const tagA = event.tagValue("a");
  if (tagA) {
    saveEvent.firstA = tagA;
  }
  const tagE = event.tagValue("e");
  if (tagE) {
    saveEvent.firstE = tagE;
  }
  const tagP = event.tagValue("p");
  if (tagP) {
    saveEvent.firstP = tagP;
  }

  return saveEvent;
};

export const toNostrEvent = (saveEvent: Event): NostrEvent => {
  const nostr = getEmptyNostrEvent();
  nostr.created_at = saveEvent.created_at;
  nostr.content = saveEvent.content;
  nostr.kind = saveEvent.kind;
  nostr.pubkey = saveEvent.pubkey;
  nostr.id = saveEvent.id;
  nostr.sig = saveEvent.sig;
  // Convert array of objects back to array of string arrays
  nostr.tags = saveEvent.tags.map(({ name, values }) => [name, ...values]);
  return nostr;
};

export const deleteEvent = async (
  uid: string,
  docId: string,
  docCollection: string
) => {
  const db = getFirestore();

  const colRef = collection(db, "events");
  const docRef = doc(db, `${docCollection}/${docId}`);

  const q = query(
    colRef,
    where("uid", "==", uid),
    where("docRef", "==", docRef),
    limit(1)
  );

  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    deleteDoc(doc.ref);
  });
};
