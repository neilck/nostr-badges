import {
  getFirestore,
  doc,
  collection,
  getDocs,
  query,
  where,
  limit,
  DocumentReference,
} from "firebase/firestore/lite";

// <---------- EventRecord ---------->
export type EventRecord = {
  addressPointer: string;
  docRef: DocumentReference;
  event: string;
  uid: string;
};

export const loadBadgeEventRecord = async (
  uid: string,
  badgeId: string
): Promise<{ event: EventRecord; naddr: string } | undefined> => {
  const db = getFirestore();

  const colRef = collection(db, "nip19s");
  const docRef = doc(db, `badges/${badgeId}`);

  const q = query(
    colRef,
    where("uid", "==", uid),
    where("docRef", "==", docRef),
    limit(1)
  );

  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty || querySnapshot.docs.length <= 0) {
    return undefined;
  }

  const event = querySnapshot.docs[0].data() as EventRecord;
  const naddr = querySnapshot.docs[0].id;

  return { event: event, naddr: naddr };
};
