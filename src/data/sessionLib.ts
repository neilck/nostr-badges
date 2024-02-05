import { GroupOffer } from "./groupOfferLib";

// <---------- SESSION ---------->

export type SessionBadge = {
  id: string;
  identifier: string;
  publisherUid: string;
  eventId: string;
  applyURL: string;
  name: string;
  description: string;
  image: string;
  thumbnail: string;
  awardtoken: string;
  isAwarded: boolean;
};

export type Session = {
  uid: string;
  offer?: GroupOffer;
  isOfferEligible?: boolean;
  group?: SessionBadge;
  isGroupMember?: boolean;
  badge?: SessionBadge;
  requiredBadges?: SessionBadge[];
};
