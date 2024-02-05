"use client";

import { useContext, useReducer, createContext, useEffect } from "react";
import { useAccountContext } from "./AccountContext";
import {
  Offer,
  loadOffer as fsLoadOffer,
  saveOffer as fsSaveOffer,
} from "@/data/offerLib";
import { loadBadge } from "@/data/badgeLib";
import { RequiredBadge } from "./RequiredBadge";
import {
  createOfferEvent,
  deleteOfferEvent,
  toNostrEvent,
} from "@/data/eventLib";
import { publishEvent } from "@/data/publishEvent";

// <---------- REDUCER ---------->
type Action =
  | { type: "setOfferId"; offerId: string | null }
  | { type: "setOffer"; offer: Offer | null }
  | { type: "setRequiredBadges"; requiredBadges: RequiredBadge[] | null };

type Dispatch = (action: Action) => void;
type State = {
  offerId: string | null;
  offer: Offer | null;
  requiredBadges: RequiredBadge[] | null;
};

type OfferProviderProps = {
  children: React.ReactNode;
};

const OfferContext = createContext<
  | {
      state: State;
      dispatch: Dispatch;
      loadOffer: (offerId: string, reload?: boolean) => Promise<Offer | null>;
      saveOffer: (
        offerId: string,
        offer: Offer
      ) => Promise<{
        success: boolean;
        offer?: Offer;
        error?: string;
      }>;
      setOffer: (offerId: string, offer: Offer) => void;
    }
  | undefined
>(undefined);

function reducer(state: State, action: Action) {
  switch (action.type) {
    case "setOfferId": {
      return { ...state, offerId: action.offerId };
    }
    case "setOffer": {
      return { ...state, offer: action.offer };
    }
    case "setRequiredBadges": {
      return { ...state, requiredBadges: action.requiredBadges };
    }
  }
}

function OfferProvider(props: OfferProviderProps) {
  const { children } = props;
  const accountContext = useAccountContext();

  const [state, dispatch] = useReducer(reducer, {
    offerId: null,
    offer: null,
    requiredBadges: null,
  });

  // load required badges
  useEffect(() => {
    if (state.offer) {
      loadRequiredBadges(state.offer);
    } else {
      dispatch({ type: "setRequiredBadges", requiredBadges: null });
    }
  }, [state.offer]);

  // load session from DB
  const loadOffer = async (offerId: string, reload?: boolean) => {
    if (state.offerId == offerId && state.offer && !reload) {
      return state.offer;
    }

    const offer = await fsLoadOffer(offerId);
    if (offer) {
      dispatch({ type: "setOfferId", offerId: offerId });
      dispatch({ type: "setOffer", offer: offer });

      return offer;
    } else {
      dispatch({ type: "setOfferId", offerId: null });
      dispatch({ type: "setOffer", offer: null });
      return null;
    }
  };

  const saveOffer = async (
    offerId: string,
    offer: Offer
  ): Promise<{ success: boolean; offer?: Offer; error?: string }> => {
    // save badge to database
    const saveResult = await fsSaveOffer(offerId, offer);
    if (saveResult.success) {
      const savedOffer = (saveResult as { success: boolean; offer: Offer })
        .offer;
      setOffer(offerId, savedOffer);

      // call server-side event creation with callback
      const createEvent = async (offerId: string, offer: Offer) => {
        await deleteOfferEvent(offer.uid, offerId);
        const event = await createOfferEvent(offerId);
        if (event) {
          // reload offer from db to pickup .event field
          loadOffer(offerId, true);
          const nostrEvent = toNostrEvent(event);
          const account = accountContext.state.account;
          if (account) {
            const relays = accountContext.getRelays();
            // publish event
            publishEvent(nostrEvent, relays);
          }
        }
      };

      // async call with callback to return event for publishing
      createEvent(offerId, savedOffer);
    }

    return saveResult;
  };

  const loadRequiredBadges = async (offer: Offer) => {
    const badges: RequiredBadge[] = [];
    for (let i = 0; i < offer.requiredBadges.length; i++) {
      const badgeId = offer.requiredBadges[i].badgeId;
      const configParams = offer.requiredBadges[i].configParams;
      const badge = await loadBadge(badgeId, "badges");
      badges.push({
        badgeId: badgeId,
        badge: badge,
        configParams: configParams,
      });
    }
    dispatch({ type: "setRequiredBadges", requiredBadges: badges });
  };

  const setOffer = (offerId: string, offer: Offer) => {
    if (offerId == state.offerId) {
      dispatch({ type: "setOffer", offer: offer });
      loadRequiredBadges(offer);
    }
  };

  const contextValue = {
    state,
    dispatch,
    loadOffer: loadOffer,
    saveOffer: saveOffer,
    setOffer: setOffer,
  };

  return (
    <OfferContext.Provider value={contextValue}>
      {children}
    </OfferContext.Provider>
  );
}

// use Context methods
const useOfferContext = () => {
  const context = useContext(OfferContext);
  if (context === undefined) {
    throw new Error("useOfferContext must be used within a OfferProvider");
  }
  return context;
};

export { useOfferContext };
export default OfferProvider;
