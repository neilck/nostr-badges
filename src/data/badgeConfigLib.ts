import {
  AddResult,
  SaveResult,
  loadItem,
  saveItem,
  addItem,
} from "./firestoreLib";

export type ConfigParam = { name: string; value: string };
export type ConfigParams = ConfigParam[];

export type BadgeConfig = {
  configParams: ConfigParam[];
};

export const getEmptyBadgeConfig = (): BadgeConfig => {
  return { configParams: [] as ConfigParams };
};

export const loadBadgeConfig = async (
  uid: string,
  badgeId: string
): Promise<BadgeConfig | undefined> => {
  const colPath = `badges/${badgeId}/config`;
  let badgeConfig = getEmptyBadgeConfig();
  const loaded = await loadItem<BadgeConfig>(uid, colPath);
  if (loaded) badgeConfig = { ...badgeConfig, ...loaded };
  return badgeConfig;
};

export const saveBadgeConfig = async (
  uid: string,
  badgeId: string,
  badgeConfig: BadgeConfig
): Promise<SaveResult> => {
  const colPath = `badges/${badgeId}/config`;

  const saveResult: SaveResult = await saveItem<BadgeConfig>(
    uid,
    badgeConfig,
    colPath
  );
  return saveResult;
};

export const addBadgeConfig = async (
  uid: string,
  badgeId: string,
  badgeConfig: BadgeConfig
): Promise<AddResult> => {
  const colPath = `badges/${badgeId}/config`;

  const addResult: AddResult = await addItem<BadgeConfig>(
    badgeConfig,
    colPath,
    uid
  );

  return addResult;
};
