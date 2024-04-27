import {
  getFirestore,
  doc,
  getDoc,
  deleteDoc,
  collection,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore/lite";
import { storage } from "@/firebase-config";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  UploadResult,
} from "firebase/storage";
import { CloudFile, urlToCloudFile } from "./cloudFile";
import debug from "debug";
import getErrorMessage from "@/errors";

const contextDebug = debug("aka:firestorelib");

const db = getFirestore();

export const DEFAULT_BADGE_IMAGE =
  process.env.NEXT_PUBLIC_AKA_DEFAULT_IMG_URL +
  "%2Fbadge%2Fresized%2Fbadge_1080x1080.png?alt=media";
export const DEFAULT_BADGE_THUMB =
  process.env.NEXT_PUBLIC_AKA_DEFAULT_IMG_URL +
  "%2Fbadge%2Fresized%2Fbadge_128x128.png?alt=media";
export const DEFAULT_GROUP_IMAGE =
  process.env.NEXT_PUBLIC_AKA_DEFAULT_IMG_URL +
  "%2Fgroup%2Fresized%2Fgroup_1080x1080.png?alt=media";
export const DEFAULT_GROUP_THUMB =
  process.env.NEXT_PUBLIC_AKA_DEFAULT_IMG_URL +
  "%2Fgroup%2Fresized%2Fgroup_128x128.png?alt=media";
export const DEFAULT_PROFILE_IMAGE =
  process.env.NEXT_PUBLIC_AKA_DEFAULT_IMG_URL +
  "%2Fprofile%2Fresized%2Fprofile_1080x1080.png?alt=media";
export const DEFAULT_PROFILE_THUMB =
  process.env.NEXT_PUBLIC_AKA_DEFAULT_IMG_URL +
  "%2Fprofile%2Fresized%2Fprofile_128x128.png?alt=media";

export type SaveResult = {
  success: boolean;
  error: string;
};

export type AddResult = {
  success: boolean;
  error: string;
  id: string;
  event?: object;
  attestation?: object;
};

// must match uid
export const loadItems = async <Type>(
  uid: string,
  colPath: string,
  orderByCreated?: boolean,
  asc?: boolean
): Promise<Record<string, Type>> => {
  const items: Record<string, Type> = {};
  const colRef = collection(db, colPath);
  let q: any = undefined;
  if (orderByCreated != undefined && orderByCreated == true)
    q = query(
      colRef,
      where("uid", "==", uid),
      orderBy("created", asc ? "asc" : "desc")
    );
  else q = query(colRef, where("uid", "==", uid));

  const querySnapshot = await getDocs(q);

  querySnapshot.docs.forEach((doc) => {
    items[doc.id] = doc.data() as Type;
  });
  return items;
};

export const loadSharedItems = async <Type>(
  colPath: string
): Promise<Record<string, Type>> => {
  const colRef = collection(db, colPath);
  let q = query(colRef, where("shared", "==", true), orderBy("created"));
  const querySnapshot = await getDocs(q);

  const items: Record<string, Type> = {};

  querySnapshot.docs.forEach((doc) => {
    items[doc.id] = doc.data() as Type;
  });
  return items;
};

export const loadGroupItems = async <Type>(
  uid: string,
  groupId: string,
  colPath: string,
  setLimit?: number
): Promise<Record<string, Type>> => {
  const items: Record<string, Type> = {};
  const colRef = collection(db, colPath);
  let q: any = undefined;
  if (setLimit == undefined) {
    q = query(
      colRef,
      where("uid", "==", uid),
      where("group", "==", groupId),
      orderBy("created", "desc")
    );
  } else {
    q = query(
      colRef,
      where("uid", "==", uid),
      where("group", "==", groupId),
      orderBy("created", "desc"),
      limit(setLimit)
    );
  }

  const querySnapshot = await getDocs(q);

  querySnapshot.docs.forEach((doc) => {
    items[doc.id] = doc.data() as Type;
  });
  return items;
};

export const loadItem = async <Type>(
  id: string,
  colPath: string
): Promise<Type | undefined> => {
  const badge: Record<string, Type> = {};
  const docRef = doc(db, `${colPath}/${id}`);
  const docSnap = await getDoc(docRef).catch((error) => {
    contextDebug(`loadItem(id: ${id}, colPath: ${colPath}) returned error:`);
    contextDebug(error);
    return undefined;
  });
  if (docSnap && docSnap.exists()) {
    contextDebug(`loadItem: ${JSON.stringify(docSnap.data())}`);
    return docSnap.data() as Type;
  }

  return undefined;
};

export const saveItem = async <Type extends { [x: string]: any }>(
  docId: string,
  item: Type,
  colPath: string
): Promise<{ success: boolean; error: string }> => {
  if (docId == "" || item.uid == "") {
    return { success: false, error: "missing docId or item.uid" };
  }

  const updateResult = await updateDoc(doc(db, colPath, docId), item).catch(
    (error) => {
      return { success: false, error: getErrorMessage(error) };
    }
  );

  if (!updateResult) {
    // updateDoc returns just void when successful
    return { success: true, error: "" };
  } else {
    return updateResult;
  }
};

export const getNewItemId = (colPath: string) => {
  const newItem = doc(collection(db, colPath));
  return newItem.id;
};

export const addItem = async <Type extends { [x: string]: any }>(
  item: Type,
  colPath: string,
  id?: string
): Promise<{ success: boolean; id: string; error: string }> => {
  // @ts-ignore
  item.created = serverTimestamp();
  let docId = id;
  if (!docId) {
    const newItem = doc(collection(db, colPath));
    docId = newItem.id;
  }

  const setResult = await setDoc(doc(db, colPath, docId), item).catch(
    (error) => {
      return { success: false, id: "", error: getErrorMessage(error) };
    }
  );

  return { success: true, id: docId, error: "" };
};

export const deleteItem = async <Type>(
  docId: string,
  colPath: string
): Promise<{ success: boolean; error: string }> => {
  await deleteDoc(doc(db, colPath, docId)).catch((error) => {
    return { success: false, error: getErrorMessage(error) };
  });

  return { success: true, error: "" };
};

export const saveImageToCloud = async (uid: string, file: File) => {
  const uploadsRef = ref(storage, `images/${uid}/${file.name}`);
  const result = {
    success: false,
    error: "",
    imageURL: "",
  };

  let uploadResult: UploadResult | undefined = undefined;
  try {
    uploadResult = await uploadBytes(uploadsRef, file);
  } catch (error) {
    // assume size limit error (firestore rules)
    result.success = false;
    result.error = "Image must be 5 MB or smaller.";
    return result;
  }

  let imageURL = await getDownloadURL(uploadResult.ref);

  // strip "&token=" from URL
  imageURL = imageURL.split("&token=")[0];

  return {
    success: true,
    error: "",
    imageURL: imageURL,
  };
};
