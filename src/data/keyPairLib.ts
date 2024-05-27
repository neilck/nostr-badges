import { loadItem, saveItem } from "./firestoreLib";
import { getPublicKey } from "nostr-tools";
import {
  getFirestore,
  doc,
  collection,
  getDocs,
  query,
  where,
  limit,
} from "firebase/firestore/lite";

// <---------- KeyPairs ---------->
export enum KeyPairType {
  Issuer = "ISSUER",
  Profile = "PROFILE",
}

type KeyPair = {
  privatekey: string;
  type: KeyPairType;
  uid: string;
};

export const getPrivateKey = async (publickey: string) => {
  try {
    const item = await loadItem(publickey, "keypairs");
    const keypair = item as KeyPair;
    return keypair.privatekey;
  } catch (error) {
    return "";
  }
};

export const savePrivateKey = async (privatekey: string) => {
  const publickey = getPublicKey(privatekey);
  const item = await loadItem(publickey, "keypairs");
  if (!item) return undefined;

  const keypair = item as KeyPair;
  keypair.privatekey = privatekey;
  try {
    await saveItem(publickey, keypair, "keypairs");
    return keypair;
  } catch (error) {
    return undefined;
  }
};
