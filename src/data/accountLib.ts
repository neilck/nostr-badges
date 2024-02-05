import debug from "debug";
import { getFirestore } from "firebase/firestore/lite";
import { loadItem, saveItem } from "./firestoreLib";
import allRelays from "./relays.json";

const relaysRecord: Record<string, { isPaid?: boolean; isDefault?: boolean }> =
  allRelays;
export const defaultRelays: string[] = [];
Object.keys(relaysRecord).forEach((name) => {
  const data = relaysRecord[name];
  if (data.isDefault) defaultRelays.push(name);
});

// <---------- Account ---------->
export const CURRENT_VERSION = 1.1;

export type Account = {
  uid: string;
  version: number;
  defaultRelays?: boolean;
  relays?: string[];
};

const libDebug = debug("aka:accountLib");
const db = getFirestore();

export const loadAccount = async (uid: string): Promise<Account | null> => {
  let account = await loadItem<Account>(uid, "accounts");
  if (!account) return null;

  return account;
};

export const saveAccount = async (
  id: string,
  account: Account
): Promise<{ success: boolean; error: string }> => {
  return await saveItem<Account>(id, account, "accounts");
};
