import { Badge } from "@/data/badgeLib";

// used by context providers
export type RequiredBadge = {
  badgeId: string;
  badge: Badge | undefined;
};

export type RequiredBadges = RequiredBadge[];
