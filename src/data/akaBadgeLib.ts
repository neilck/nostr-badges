import getErrorMessage from "@/errors";
import { loadItem } from "./firestoreLib";
import {
  getFirestore,
  doc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore/lite";

const db = getFirestore();

export enum Socials {
  YouTube = "youtube",
  Twitter = "twitter",
  Facebook = "facebook",
  Instagram = "instagram",
}

export type AkaBadge = {
  id: string;
  name: string;
  category: string;
  sort: number;
};

const emptyAkaBadge: AkaBadge = {
  id: "",
  name: "",
  category: "",
  sort: 0,
};

export const getEmptyAkaBadge = (): AkaBadge => {
  return { ...emptyAkaBadge };
};

// must match uid and publickey
export const loadAkaBadge = async <Type>(
  name: string
): Promise<AkaBadge | undefined> => {
  const colRef = collection(db, "akabadges");

  const q = query(colRef, where("name", "==", name));

  const querySnapshot = await getDocs(q);
  if (querySnapshot.docs.length <= 0) {
    return undefined;
  }

  let badge = getEmptyAkaBadge();
  const loadedBadge = querySnapshot.docs[0].data();
  badge.id = querySnapshot.docs[0].id;
  badge = { ...badge, ...loadedBadge };
  return badge;
};
