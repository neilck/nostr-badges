import allRelays from "./relays.json";

const relaysRecord: Record<
  string,
  { isPaid?: boolean; isDefault?: boolean; isProfile?: boolean }
> = allRelays;

export const getAllRelays = () => {
  const relays: string[] = [];
  Object.keys(relaysRecord).forEach((name) => {
    const data = relaysRecord[name];
    relays.push(name);
  });
  return relays;
};

export const getDefaultRelays = () => {
  const relays: string[] = [];
  Object.keys(relaysRecord).forEach((name) => {
    const data = relaysRecord[name];
    if (data.isDefault) relays.push(name);
  });
  return relays;
};

export const getProfileRelays = () => {
  const relays: string[] = [];
  Object.keys(relaysRecord).forEach((name) => {
    const data = relaysRecord[name];
    if (data.isProfile) relays.push(name);
  });
  return relays;
};
