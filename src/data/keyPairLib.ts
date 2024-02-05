import {
  getFirestore,
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

export const loadIssuerPublicKey = async (uid: string): Promise<string> => {
  const db = getFirestore();

  const colRef = collection(db, "keypairs");
  const q = query(
    colRef,
    where("uid", "==", uid),
    where("type", "==", KeyPairType.Issuer),
    limit(1)
  );

  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty || querySnapshot.docs.length <= 0) {
    return "";
  }

  return querySnapshot.docs[0].id;
};
