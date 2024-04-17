import { loadItem, loadItems, saveItem } from "./firestoreLib";
import { NDKUserProfile } from "@nostr-dev-kit/ndk";
// <---------- Profile ---------->
export type Profile = {
  [key: string]: string | boolean | undefined; // allows custom fields
  uid: string;
  publickey: string;
  hasPrivateKey?: boolean;
  name?: string;
  displayName?: string;
  image?: string;
  banner?: string;
  bio?: string;
  nip05?: string;
  lud06?: string;
  lud16?: string;
  about?: string;
  zapService?: string;
  website?: string;
};

export const getEmptyProfile = () => {
  return {
    uid: "",
    publickey: "",
    hasPrivateKey: false,
    name: "",
    displayName: "",
    image: "",
    banner: "",
    bio: "",
    nip05: "",
    lud06: "",
    lud16: "",
    about: "",
    zapService: "",
    website: "",
  } as Profile;
};

export const saveProfile = async (profile: Profile) => {
  const docId = profile.publickey;
  const saveResult = await saveItem(docId, profile, "profiles");
  return saveResult;
};

export const loadProfile = async (id: string): Promise<Profile | null> => {
  let profile = await loadItem<Profile>(id, "profiles");
  if (!profile) return null;

  return profile;
};

export const loadProfiles = async (
  uid: string
): Promise<Record<string, Profile>> => {
  const colPath = "profiles";
  return loadItems(uid, colPath);
};

// update profile based on Nostr events
export const updateProfile = (current: Profile, profile: NDKUserProfile) => {
  let hasChanges = false;
  let full = getEmptyProfile();
  full = { ...full, ...current };
  const keys = Object.keys(profile);
  keys.forEach((key) => {
    if (Object.hasOwn(full, key)) {
      if (full[key] !== profile[key]) {
        full[key] = profile[key];
        hasChanges = true;
      }
    }
  });
  if (hasChanges) {
    saveProfile(full);
  }
  return { updated: hasChanges, profile: full };
};
