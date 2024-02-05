import { Badge } from "@/data/badgeLib";
import { BadgeParamsList } from "@/data/badgeLib";
import { ConfigParams } from "@/data/badgeConfigLib";

// used by context providers
export type RequiredBadge = {
  badgeId: string;
  badge: Badge | undefined;
  configParams: ConfigParams;
};

export type RequiredBadges = RequiredBadge[];

// conver to BadgeParams { badgeId: string; configParams: ConfigParams } for saving to DB
export const toBadgeParams = (requiredBadges: RequiredBadges) => {
  const list = [] as BadgeParamsList;
  for (let i = 0; i < requiredBadges.length; i++) {
    const badge = requiredBadges[i];
    list.push({ badgeId: badge.badgeId, configParams: badge.configParams });
  }
  return list;
};
