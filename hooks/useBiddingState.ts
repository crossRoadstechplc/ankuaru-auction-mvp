import { useCallback, useMemo, useState } from "react";
import {
  loadBidDraftFromUiStorage,
  loadPlacedBidFlagFromUiStorage,
  saveBidDraftToUiStorage,
  savePlacedBidFlagToUiStorage,
} from "@/src/features/bids/ui/bid-local-persistence";
import { useMyBidQuery } from "@/src/features/bids/queries/hooks";
import { useAuthStore } from "../stores/auth.store";

interface BidData {
  amount: string;
  nonce: string;
}

export function useBiddingState(auctionId: string) {
  const userId = useAuthStore((state) => state.userId);
  const { data: myBid, refetch: refetchMyBid } = useMyBidQuery(auctionId);

  const [bidAmount, setBidAmount] = useState("");
  const [bidDraftOverrides, setBidDraftOverrides] = useState<
    Record<string, BidData>
  >({});
  const [placedBidOverrides, setPlacedBidOverrides] = useState<
    Record<string, boolean>
  >({});

  const identityKey = userId ? `${auctionId}:${userId}` : "";

  // Helper to save bid details
  const saveBidLocally = useCallback(
    (amount: string, nonce: string) => {
      if (!userId) return;

      saveBidDraftToUiStorage(
        {
          auctionId,
          userId,
        },
        { amount, nonce },
      );
      setBidDraftOverrides((previous) => ({
        ...previous,
        [identityKey]: { amount, nonce },
      }));
    },
    [auctionId, identityKey, userId],
  );

  // Helper to load bid details
  const loadBidLocally = useCallback(() => {
    if (!userId) {
      return null;
    }

    return loadBidDraftFromUiStorage({
      auctionId,
      userId,
    });
  }, [auctionId, userId]);

  const persistedLocalBid = useMemo(() => {
    return loadBidLocally();
  }, [loadBidLocally]);

  const localBid = identityKey
    ? (bidDraftOverrides[identityKey] ?? persistedLocalBid)
    : null;

  const persistedHasPlacedBid = useMemo(() => {
    if (!userId) {
      return false;
    }

    return loadPlacedBidFlagFromUiStorage({
      auctionId,
      userId,
    });
  }, [auctionId, userId]);

  const overriddenHasPlacedBid = identityKey
    ? placedBidOverrides[identityKey]
    : undefined;

  const hasPlacedBid =
    !!myBid || (overriddenHasPlacedBid ?? persistedHasPlacedBid);

  const setHasPlacedBid = useCallback(
    (value: boolean) => {
      if (!userId || !identityKey) return;

      savePlacedBidFlagToUiStorage(
        {
          auctionId,
          userId,
        },
        value,
      );
      setPlacedBidOverrides((previous) => ({
        ...previous,
        [identityKey]: value,
      }));
    },
    [auctionId, identityKey, userId],
  );

  return {
    bidAmount,
    setBidAmount,
    localBid,
    hasPlacedBid,
    setHasPlacedBid,
    saveBidLocally,
    loadBidLocally,
    refetchMyBid,
    myBid,
  };
}
