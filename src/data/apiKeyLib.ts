import { getFirestore, doc, getDoc } from "firebase/firestore/lite";

// <---------- KeyPairs ---------->
export enum KeyPairType {
  Issuer = "ISSUER",
  Profile = "PROFILE",
}

export const loadApiKey = async (uid: string): Promise<string | undefined> => {
  const db = getFirestore();

  const docRef = doc(db, `apikeys/${uid}`);
  const docSnap = await getDoc(docRef).catch((error) => {
    if (error.code == "permission-denied") {
      // swallow error because key might not yet exist
      return;
    }
  });
  if (docSnap && docSnap.exists()) {
    return docSnap.data().key;
  }

  return undefined;
};
