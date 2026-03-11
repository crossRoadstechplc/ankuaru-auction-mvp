import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "../stores/auth.store";
import { useMyBid } from "./useAuctions";

interface BidData {
  amount: string;
  nonce: string;
}

export function useBiddingState(auctionId: string) {
  const { user } = useAuthStore();
  const { data: myBid, refetch: refetchMyBid } = useMyBid(auctionId);

  const [bidAmount, setBidAmount] = useState("");
  const [localBid, setLocalBid] = useState<BidData | null>(null);
  const [hasPlacedBid, setHasPlacedBid] = useState(false);

  // Helper to save bid details
  const saveBidLocally = (amount: string, nonce: string) => {
    if (typeof window !== "undefined" && user?.id) {
      const storageKey = `bid_${auctionId}_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify({ amount, nonce }));
    }
  };

  // Helper to load bid details
  const loadBidLocally = useCallback(() => {
    if (typeof window !== "undefined" && user?.id) {
      const storageKey = `bid_${auctionId}_${user.id}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error("Failed to parse saved bid:", e);
          return null;
        }
      }
    }
    return null;
  }, [auctionId, user?.id]);

  // Check for local bid on mount or when user changes
  useEffect(() => {
    if (user?.id) {
      const saved = loadBidLocally();
      setLocalBid(saved);

      // Also check if we have a placed bid flag in localStorage
      const placedBidKey = `placedBid_${auctionId}_${user.id}`;
      const hasPlaced = localStorage.getItem(placedBidKey) === "true";
      if (hasPlaced) {
        setHasPlacedBid(true);
      }
    }
  }, [user?.id, auctionId, loadBidLocally]);

  // Save hasPlacedBid to localStorage when it changes
  useEffect(() => {
    if (user?.id) {
      const placedBidKey = `placedBid_${auctionId}_${user.id}`;
      localStorage.setItem(placedBidKey, hasPlacedBid.toString());
    }
  }, [hasPlacedBid, user?.id, auctionId]);

  // Sync hasPlacedBid with server data, but don't override if we already have it set
  useEffect(() => {
    if (myBid && !hasPlacedBid) {
      setHasPlacedBid(true);
    }
  }, [myBid, hasPlacedBid]);

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
