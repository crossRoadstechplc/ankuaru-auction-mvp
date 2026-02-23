"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../../../contexts/AuthContext";
import apiClient from "../../../../lib/api";
import { Bid } from "../../../../lib/types";
import { CloseEarlyModal } from "./CloseEarlyModal";
import { FinalReportModal } from "./FinalReportModal";
import router from "next/router";

interface BiddingSidebarProps {
  data: {
    id: string;
    title: string;
    auctionCategory: string;
    itemDescription: string;
    reservePrice: string;
    minBid: string;
    auctionType: "SELL" | "BUY";
    visibility: "PUBLIC" | "FOLLOWERS" | "SELECTED";
    startAt: string;
    endAt: string;
    status: "SCHEDULED" | "OPEN" | "REVEAL" | "CLOSED";
    createdBy: string;
    createdAt: string;
    bidCount?: number;
    currentBid?: string;
  };
  isCreator: boolean;
  onAuctionUpdate?: () => void;
}

// Helper function to generate SHA256 hash
async function generateSHA256Hash(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

// Helper to calculate time remaining and determine auction status
function getTimeRemaining(
  startAt: string,
  endAt: string,
  status: string,
): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isClosed: boolean;
  shouldReveal: boolean;
  isScheduled: boolean;
  timeUntilStart?: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
} {
  const now = new Date().getTime();
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();

  // If auction is SCHEDULED, calculate time until start
  if (status === "SCHEDULED") {
    const startDiff = start - now;

    if (startDiff <= 0) {
      // Should transition to OPEN, but still return as scheduled for safety
      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isClosed: false,
        shouldReveal: false,
        isScheduled: true,
        timeUntilStart: { days: 0, hours: 0, minutes: 0, seconds: 0 },
      };
    }

    const days = Math.floor(startDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (startDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );
    const minutes = Math.floor((startDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((startDiff % (1000 * 60)) / 1000);

    return {
      days: 0, // Not relevant for scheduled
      hours: 0,
      minutes: 0,
      seconds: 0,
      isClosed: false,
      shouldReveal: false,
      isScheduled: true,
      timeUntilStart: { days, hours, minutes, seconds },
    };
  }

  // For OPEN, REVEAL, CLOSED status, calculate time until end
  const diff = end - now;

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isClosed: true,
      shouldReveal: true,
      isScheduled: false,
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return {
    days,
    hours,
    minutes,
    seconds,
    isClosed: false,
    shouldReveal: false,
    isScheduled: false,
  };
}

export function BiddingSidebar({
  data,
  isCreator,
  onAuctionUpdate,
}: BiddingSidebarProps) {
  const isSell = data.auctionType === "SELL";
  const { user } = useAuth();

  // --- Live countdown timer ---
  const [timeLeft, setTimeLeft] = useState(() =>
    getTimeRemaining(data.startAt, data.endAt, data.status),
  );

  useEffect(() => {
    // Only tick for OPEN (countdown to end) or SCHEDULED (countdown to start)
    if (data.status !== "OPEN" && data.status !== "SCHEDULED") return;
    // Also stop if already resolved
    if (timeLeft.isClosed) return;

    const timer = setInterval(() => {
      const remaining = getTimeRemaining(data.startAt, data.endAt, data.status);
      setTimeLeft(remaining);
      if (remaining.isClosed) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [data.startAt, data.endAt, data.status]);

  const { days, hours, minutes, seconds, isClosed, shouldReveal, timeUntilStart } = timeLeft;

  const [bidAmount, setBidAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myBid, setMyBid] = useState<Bid | null>(null);
  const [localBid, setLocalBid] = useState<{
    amount: string;
    nonce: string;
  } | null>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Helper to save bid details
  const saveBidLocally = (amount: string, nonce: string) => {
    if (typeof window !== "undefined" && user?.id) {
      const storageKey = `bid_${data.id}_${user.id}`;
      localStorage.setItem(storageKey, JSON.stringify({ amount, nonce }));
    }
  };

  // Helper to load bid details
  const loadBidLocally = useCallback(() => {
    if (typeof window !== "undefined" && user?.id) {
      const storageKey = `bid_${data.id}_${user.id}`;
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
  }, [data.id, user?.id]);

  // Check for local bid on mount or when user changes
  useEffect(() => {
    if (user?.id) {
      const saved = loadBidLocally();
      setLocalBid(saved);
    }
  }, [user?.id, data.id, loadBidLocally]);

  // Determine actual auction status based on time and backend status
  const actualStatus =
    data.status === "SCHEDULED"
      ? "SCHEDULED"
      : shouldReveal && data.status === "OPEN"
        ? "REVEAL"
        : data.status;
  const isScheduledPhase = actualStatus === "SCHEDULED";
  const isRevealPhase = actualStatus === "REVEAL";
  const isClosedPhase = actualStatus === "CLOSED";

  // Fetch user's current bid
  useEffect(() => {
    const fetchMyBid = async () => {
      try {
        const bid = await apiClient.getMyBid(data.id);
        setMyBid(bid);
      } catch (error) {
        console.error("Failed to fetch my bid:", error);
      }
    };

    if (!isCreator && !isClosedPhase && !isScheduledPhase) {
      fetchMyBid();
    }
  }, [data.id, isCreator, isClosedPhase, isScheduledPhase]);

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      toast.warning("Please enter a valid bid amount");
      return;
    }

    if (!user?.id) {
      toast.error("Please login to place a bid");
      return;
    }

    try {
      setIsSubmitting(true);

      // Generate proper commit hash using SHA256
      const nonce = Math.random().toString(36).substring(2, 11);
      const raw = `${data.id}:${user.id}:${bidAmount}:${nonce}`;
      const commitHash = await generateSHA256Hash(raw);

      // Save bid details locally BEFORE submitting
      saveBidLocally(bidAmount, nonce);
      setLocalBid({ amount: bidAmount, nonce });

      await apiClient.placeBid(data.id, commitHash);

      toast.success(
        "Bid submitted! Your bid is hidden until the reveal phase.",
      );
      setBidAmount("");

      // Refresh my bid status from API
      const updatedBid = await apiClient.getMyBid(data.id);
      setMyBid(updatedBid);
    } catch (error) {
      console.error("Bid submission failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to submit bid",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevealBid = async () => {
    if (!myBid) return;

    // Retrieve saved amount and nonce
    const saved = localBid || loadBidLocally();

    if (!saved) {
      toast.warning(
        "Could not find matching bid data in this browser. Please enter your original amount and nonce manually.",
      );
      // Fallback for manual entry if needed, but for now just prompt for amount
      const manualAmount = prompt("Enter your original bid amount:") || "";
      const manualNonce = prompt("Enter your secret nonce:") || "";
      if (!manualAmount || !manualNonce) return;

      try {
        setIsSubmitting(true);
        await apiClient.revealBid(data.id, manualAmount, manualNonce);
        toast.success("Bid revealed successfully!");
        const updatedBid = await apiClient.getMyBid(data.id);
        setMyBid(updatedBid);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Reveal failed");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.revealBid(data.id, saved.amount, saved.nonce);

      toast.success("Bid revealed successfully!");

      // Refresh status
      const updatedBid = await apiClient.getMyBid(data.id);
      setMyBid(updatedBid);

      // Optionally clear local storage after successful reveal
      // localStorage.removeItem(`bid_${data.id}_${user?.id}`);
    } catch (error) {
      console.error("Bid reveal failed:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to reveal bid",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lg:col-span-4 flex flex-col gap-6">
      {/* Countdown Card */}
      <div
        className={`${isClosedPhase
          ? "bg-slate-700"
          : isRevealPhase
            ? "bg-orange-600 dark:bg-orange-600/90"
            : isScheduledPhase
              ? "bg-blue-600 dark:bg-blue-600/90"
              : "bg-primary dark:bg-primary/90"
          } rounded-xl p-6 text-white shadow-lg shadow-primary/20`}
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4 opacity-80">
          {isClosedPhase
            ? "Auction Closed"
            : isRevealPhase
              ? "Reveal Phase"
              : isScheduledPhase
                ? "Auction Starts In"
                : "Auction Ends In"}
        </p>
        {!isClosedPhase && !isScheduledPhase ? (
          <div className="flex justify-between items-center text-center">
            <div>
              <p className="text-2xl font-black">
                {String(days).padStart(2, "0")}
              </p>
              <p className="text-[10px] font-bold uppercase">Days</p>
            </div>
            <div className="text-2xl opacity-50 font-light">:</div>
            <div>
              <p className="text-2xl font-black">
                {String(hours).padStart(2, "0")}
              </p>
              <p className="text-[10px] font-bold uppercase">Hours</p>
            </div>
            <div className="text-2xl opacity-50 font-light">:</div>
            <div>
              <p className="text-2xl font-black">
                {String(minutes).padStart(2, "0")}
              </p>
              <p className="text-[10px] font-bold uppercase">Mins</p>
            </div>
            <div className="text-2xl opacity-50 font-light">:</div>
            <div>
              <p className="text-2xl font-black">
                {String(seconds).padStart(2, "0")}
              </p>
              <p className="text-[10px] font-bold uppercase">Secs</p>
            </div>
          </div>
        ) : isScheduledPhase && timeUntilStart ? (
          <div className="flex justify-between items-center text-center">
            <div>
              <p className="text-2xl font-black">
                {String(timeUntilStart.days).padStart(2, "0")}
              </p>
              <p className="text-[10px] font-bold uppercase">Days</p>
            </div>
            <div className="text-2xl opacity-50 font-light">:</div>
            <div>
              <p className="text-2xl font-black">
                {String(timeUntilStart.hours).padStart(2, "0")}
              </p>
              <p className="text-[10px] font-bold uppercase">Hours</p>
            </div>
            <div className="text-2xl opacity-50 font-light">:</div>
            <div>
              <p className="text-2xl font-black">
                {String(timeUntilStart.minutes).padStart(2, "0")}
              </p>
              <p className="text-[10px] font-bold uppercase">Mins</p>
            </div>
            <div className="text-2xl opacity-50 font-light">:</div>
            <div>
              <p className="text-2xl font-black">
                {String(timeUntilStart.seconds).padStart(2, "0")}
              </p>
              <p className="text-[10px] font-bold uppercase">Secs</p>
            </div>
          </div>
        ) : null}
        {isScheduledPhase && (
          <div className="text-center">
            <span className="material-symbols-outlined text-3xl mb-2">
              schedule
            </span>
            <p className="text-sm">Auction has not started yet</p>
          </div>
        )}
        {isRevealPhase && (
          <div className="text-center">
            <span className="material-symbols-outlined text-3xl mb-2">
              visibility
            </span>
            <p className="text-sm">Bidders can now reveal their bids</p>
          </div>
        )}
        {isClosedPhase && (
          <div className="text-center">
            <span className="material-symbols-outlined text-3xl mb-2">
              lock
            </span>
            <p className="text-sm">Auction has ended</p>
          </div>
        )}
      </div>

      {!isCreator ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          {isScheduledPhase ? (
            <div className="text-center py-4">
              <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-blue-500 text-3xl">
                  schedule
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">Auction Scheduled</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
                This auction has not started yet. Bidding will be available when
                the auction begins.
              </p>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <p className="text-[10px] text-blue-600 dark:text-blue-300 font-bold uppercase mb-1">
                  Starting Bid
                </p>
                <p className="text-2xl font-black text-blue-900 dark:text-white">
                  {data.minBid}
                </p>
              </div>
              <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                <p>Auction starts: {new Date(data.startAt).toLocaleString()}</p>
              </div>
            </div>
          ) : isClosedPhase ? (
            <div className="text-center py-4">
              <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-slate-400 text-3xl">
                  event_busy
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">Auction Closed</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
                This auction has officially concluded. No further bids are being
                accepted.
              </p>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                  Winning Bid
                </p>
                <p className="text-2xl font-black text-primary">
                  {data.currentBid}
                </p>
              </div>
              <button
                onClick={() => setShowReportModal(true)}
                className="w-full mt-4 bg-primary hover:opacity-90 text-white py-3 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">
                  description
                </span>
                View Final Report
              </button>
            </div>
          ) : isRevealPhase ? (
            <div className="text-center py-4">
              <div className="h-16 w-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-orange-500 text-3xl">
                  visibility
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">Reveal Phase</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
                Bidding has ended. You can now reveal your bid to participate in
                the final selection.
              </p>
              {myBid && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                  <p className="text-[10px] text-blue-600 dark:text-blue-300 font-bold uppercase mb-1">
                    My Bid
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-blue-900 dark:text-white">
                      {myBid.amount || localBid?.amount || "Pending"}
                    </p>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-300 uppercase">
                      USD
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-200">
                    {myBid.revealed ? (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-green-500">
                          check_circle
                        </span>
                        Your bid has been revealed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-orange-500">
                          hourglass_top
                        </span>
                        Reveal your bid to participate
                      </span>
                    )}
                  </div>
                </div>
              )}
              {myBid && !myBid.revealed && (
                <button
                  onClick={handleRevealBid}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">
                        refresh
                      </span>
                      Revealing...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">
                        visibility
                      </span>
                      Reveal Bid
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => setShowReportModal(true)}
                className="w-full mt-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">
                  description
                </span>
                View Auction Report
              </button>
            </div>
          ) : (
            <>
              {/* My Bid Status */}
              {myBid && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                  <p className="text-[10px] text-blue-600 dark:text-blue-300 font-bold uppercase mb-1">
                    My Bid
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-blue-900 dark:text-white">
                      {myBid.amount || localBid?.amount || "Pending"}
                    </p>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-300 uppercase">
                      USD
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-blue-700 dark:text-blue-200">
                    {myBid.revealed ? (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-green-500">
                          check_circle
                        </span>
                        Your bid has been revealed
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-orange-500">
                          hourglass_top
                        </span>
                        Waiting for reveal phase
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="mb-8">
                <p className="text-sm text-slate-400 font-bold uppercase mb-1">
                  {myBid ? "Current Bid" : "Current Bid"}
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                    {data.currentBid}
                  </p>
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    USD
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {!myBid ? (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 font-display">
                      {isSell ? "Your New Bid" : "Your Lower Offer"}
                    </label>
                    <form onSubmit={handleBidSubmit}>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                          $
                        </span>
                        <input
                          className="w-full pl-8 pr-4 py-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:border-primary focus:ring-0 text-xl font-bold transition-all"
                          type="number"
                          placeholder="Enter amount"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>
                      <button
                        type="submit"
                        className="w-full bg-primary hover:bg-primary-dark text-white py-5 rounded-xl font-black text-lg shadow-xl shadow-primary/30 transition-all uppercase tracking-widest active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="material-symbols-outlined animate-spin">
                              refresh
                            </span>
                            Submitting...
                          </>
                        ) : (
                          <>
                            {isSell
                              ? "Submit Higher Bid"
                              : "Submit Better Offer"}
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 font-display">
                      Reveal Your Bid
                    </label>
                    <button
                      onClick={handleRevealBid}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmitting || !myBid}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="material-symbols-outlined animate-spin">
                            refresh
                          </span>
                          Revealing...
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined">
                            visibility
                          </span>
                          Reveal Bid
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <div className="mb-6 p-4 bg-primary/5 rounded-xl border border-primary/10">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-widest">
              Administrator Notice
            </p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {isClosedPhase
                ? "This auction is closed. You can view the final reports or relist the item."
                : isRevealPhase
                  ? "Bidding has ended and reveal phase is active. You can view current reports or close the auction."
                  : isScheduledPhase
                    ? "This auction is scheduled and has not started yet. Users cannot bid until the auction begins."
                    : "Bidding is disabled for creators. Use the actions below to manage your listing."}
            </p>
          </div>
          <div className="space-y-3">
            {isScheduledPhase ? (
              <div className="text-center py-4">
                <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-blue-500 text-3xl">
                    schedule
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2">Auction Scheduled</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  This auction is scheduled to start at:
                </p>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-300 mb-4">
                  {new Date(data.startAt).toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No actions available until the auction starts.
                </p>
              </div>
            ) : !isClosedPhase && !isRevealPhase ? (
              <button
                onClick={() => setShowCloseModal(true)}
                className="w-full py-4 border-2 border-red-500/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">block</span>
                Close Early
              </button>
            ) : isRevealPhase ? (
              <>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="w-full py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">
                    visibility
                  </span>
                  View Current Report
                </button>
                <button
                  onClick={() => setShowCloseModal(true)}
                  className="w-full py-4 border-2 border-red-500/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">
                    block
                  </span>
                  Close Auction Now
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="w-full py-4 bg-primary hover:opacity-90 text-white rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">
                    description
                  </span>
                  View Final Report
                </button>
                <button
                  onClick={() => {
                    const params = new URLSearchParams({
                      title: data.title,
                      category: data.auctionCategory,
                      description: data.itemDescription,
                      minBid: data.minBid,
                      type: data.auctionType,
                      visibility: data.visibility,
                    });
                    router.push(
                      `/auction/new?relist=true&${params.toString()}`,
                    );
                  }}
                  className="w-full py-4 border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">
                    refresh
                  </span>
                  Relist Item
                </button>
              </>
            )}
          </div>

          {/* Modals */}
          <CloseEarlyModal
            auctionId={data.id}
            auctionTitle={data.title}
            isOpen={showCloseModal}
            onClose={() => setShowCloseModal(false)}
            onClosed={() => {
              setShowCloseModal(false);
              if (onAuctionUpdate) onAuctionUpdate();
            }}
          />
          <FinalReportModal
            auction={data}
            isOpen={showReportModal}
            onClose={() => setShowReportModal(false)}
          />
        </div>
      )}
    </div>
  );
}
