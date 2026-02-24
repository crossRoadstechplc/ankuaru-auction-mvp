"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../../../contexts/AuthContext";
import apiClient from "../../../../lib/api";
import { Bid } from "../../../../lib/types";
import { CloseEarlyModal } from "./CloseEarlyModal";
import { FinalReportModal } from "./FinalReportModal";
import { RevealBidsModal } from "./RevealBidsModal";

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
    winningBid?: string;
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

  const {
    days,
    hours,
    minutes,
    seconds,
    isClosed,
    shouldReveal,
    timeUntilStart,
  } = timeLeft;

  const [bidAmount, setBidAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myBid, setMyBid] = useState<Bid | null>(null);
  const [localBid, setLocalBid] = useState<{
    amount: string;
    nonce: string;
  } | null>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showRevealBidsModal, setShowRevealBidsModal] = useState(false);

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
    console.log("Placing bid:", bidAmount);

    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      toast.warning("Please enter a valid bid amount");
      return;
    }

    if (parseFloat(bidAmount) < parseFloat(data.reservePrice)) {
      toast.warning(
        `Your bid cannot be less than the starting price of ETB {data.reservePrice}`,
      );
      return;
    }

    if (!user?.id) {
      toast.error("Please login to place a bid");
      return;
    }

    try {
      setIsSubmitting(true);

      // Generate proper commit hash using SHA256 (Temporarily removed)
      // const nonce = Math.random().toString(36).substring(2, 11);
      // const raw = `${data.id}:${user.id}:${bidAmount}:${nonce}`;
      // const commitHash = await generateSHA256Hash(raw);

      // Save bid details locally BEFORE submitting
      // saveBidLocally(bidAmount, nonce);
      // setLocalBid({ amount: bidAmount, nonce });

      await apiClient.placeBid(data.id, bidAmount);

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

  // Calculate progress percentage for the circular timer
  const getProgressPercentage = () => {
    const now = new Date().getTime();
    const start = new Date(data.startAt).getTime();
    const end = new Date(data.endAt).getTime();

    if (data.status === "SCHEDULED") {
      // For scheduled: progress until start
      const totalDuration = start - new Date(data.createdAt).getTime();
      const elapsed = now - new Date(data.createdAt).getTime();
      if (totalDuration <= 0) return 0;
      return Math.max(0, Math.min(100, (1 - elapsed / totalDuration) * 100));
    }

    // For active auctions: remaining time percentage
    const totalDuration = end - start;
    const remaining = end - now;
    if (totalDuration <= 0) return 0;
    return Math.max(0, Math.min(100, (remaining / totalDuration) * 100));
  };

  const progressPercent = getProgressPercentage();

  // SVG circle calculations
  const circleRadius = 80;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference * (1 - progressPercent / 100);

  return (
    <div className="flex flex-col gap-6">
      {/* Countdown Card */}
      <div
        className={`${
          isClosedPhase
            ? "bg-slate-700"
            : isRevealPhase
              ? "bg-orange-600 dark:bg-orange-600/90"
              : isScheduledPhase
                ? "bg-blue-600 dark:bg-blue-600/90"
                : "bg-primary dark:bg-primary/90"
        } rounded-xl p-6 text-white shadow-lg shadow-primary/20`}
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4 opacity-80 text-center">
          {isClosedPhase
            ? "Auction Closed"
            : isRevealPhase
              ? "Reveal Phase"
              : isScheduledPhase
                ? "Auction Starts In"
                : "Auction Ends In"}
        </p>

        {/* Circular Timer */}
        {!isClosedPhase && !isRevealPhase
          ? (() => {
              const displayDays =
                isScheduledPhase && timeUntilStart ? timeUntilStart.days : days;
              const displayHours =
                isScheduledPhase && timeUntilStart
                  ? timeUntilStart.hours
                  : hours;
              const displayMinutes =
                isScheduledPhase && timeUntilStart
                  ? timeUntilStart.minutes
                  : minutes;
              const displaySeconds =
                isScheduledPhase && timeUntilStart
                  ? timeUntilStart.seconds
                  : seconds;

              return (
                <div className="flex flex-col items-center">
                  {/* Circular Progress Ring */}
                  <div className="relative" style={{ width: 200, height: 200 }}>
                    <svg
                      width="200"
                      height="200"
                      viewBox="0 0 200 200"
                      className="transform -rotate-90"
                    >
                      {/* Background track */}
                      <circle
                        cx="100"
                        cy="100"
                        r={circleRadius}
                        fill="none"
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="8"
                      />
                      {/* Progress arc */}
                      <circle
                        cx="100"
                        cy="100"
                        r={circleRadius}
                        fill="none"
                        stroke="rgba(255,255,255,0.9)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circleCircumference}
                        strokeDashoffset={strokeDashoffset}
                        style={{ transition: "stroke-dashoffset 1s linear" }}
                      />
                      {/* Glowing dot at the tip */}
                      <circle
                        cx="100"
                        cy="100"
                        r={circleRadius}
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`2 ${circleCircumference - 2}`}
                        strokeDashoffset={strokeDashoffset}
                        style={{
                          transition: "stroke-dashoffset 1s linear",
                          filter: "drop-shadow(0 0 6px rgba(255,255,255,0.8))",
                        }}
                      />
                    </svg>

                    {/* Center content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      {/* Days (if any) */}
                      {displayDays > 0 && (
                        <p className="text-[11px] font-bold uppercase tracking-widest opacity-70 mb-0.5">
                          {displayDays}d remaining
                        </p>
                      )}

                      {/* Hours & Minutes — small but visible */}
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-sm font-bold opacity-80">
                          {String(displayHours).padStart(2, "0")}
                        </span>
                        <span className="text-xs opacity-50">h</span>
                        <span className="text-sm font-bold opacity-80">
                          {String(displayMinutes).padStart(2, "0")}
                        </span>
                        <span className="text-xs opacity-50">m</span>
                      </div>

                      {/* Seconds — BIG & distinctive */}
                      <p
                        className="text-5xl font-black tabular-nums leading-none tracking-tight"
                        style={{
                          textShadow: "0 0 20px rgba(255,255,255,0.3)",
                          animation: "secondsPulse 1s ease-in-out infinite",
                        }}
                      >
                        {String(displaySeconds).padStart(2, "0")}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mt-1">
                        Seconds
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()
          : null}

        {isScheduledPhase && (
          <div className="text-center mt-2">
            <span
              className="material-symbols-outlined text-2xl mb-1"
              style={{ opacity: 0.7 }}
            >
              schedule
            </span>
            <p className="text-xs opacity-70">Auction has not started yet</p>
          </div>
        )}
        {isRevealPhase && (
          <div className="text-center">
            <span className="material-symbols-outlined text-3xl mb-2">
              visibility
            </span>
            <p className="text-sm">
              Bids are now closed. Please wait for Creator to reveal bids
            </p>
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
                  {data.winningBid || data.currentBid}
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
                  hourglass_top
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">Auction In Reveal Mode</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-medium">
                Bidding has ended. The auction owner is currently reviewing all
                bids.
              </p>
              {myBid && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 text-left">
                  <p className="text-[10px] text-blue-600 dark:text-blue-300 font-bold uppercase mb-1">
                    Your Submitted Bid
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-black text-blue-900 dark:text-white">
                      {myBid.amount || localBid?.amount || "Submitted"}
                    </p>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-300 uppercase">
                      USD
                    </span>
                  </div>
                </div>
              )}
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3 text-left">
                  <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-xl mt-0.5">
                    info
                  </span>
                  <div>
                    <p className="text-sm font-bold text-amber-900 dark:text-amber-100 mb-1">
                      Waiting for the auction owner
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Please wait for the auction owner to close the auction.
                      You will be notified once the results are finalized.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* My Bid Status */}
              {myBid ? (
                <div className="text-center py-4">
                  <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800 text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-emerald-500 text-lg">
                        check_circle
                      </span>
                      <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                        Bid Submitted Successfully
                      </p>
                    </div>
                    <div className="flex items-baseline gap-2 mt-3">
                      <p className="text-3xl font-black text-emerald-900 dark:text-white">
                        {myBid.amount || localBid?.amount || "Pending"}
                      </p>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-300 uppercase">
                        USD
                      </span>
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-3 text-left">
                      <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl mt-0.5">
                        schedule
                      </span>
                      <div>
                        <p className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-1">
                          Waiting for other bids
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Your bid has been recorded. We will notify you when
                          the auction status updates.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-8">
                    <p className="text-sm text-slate-400 font-bold uppercase mb-1">
                      Current Bid
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
                    <div>
                      <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 font-display">
                        {isSell ? "Your New Bid" : "Your Lower Offer"}
                      </label>
                      <form onSubmit={handleBidSubmit}>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                            ETB
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
                              {isSell ? "Submit Your Bid" : "Submit Your Bid"}
                            </>
                          )}
                        </button>
                      </form>
                    </div>
                  </div>
                </>
              )}
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
                onClick={() => setShowRevealBidsModal(true)}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-lg">
                  visibility
                </span>
                Close Auction Early
              </button>
            ) : isRevealPhase ? (
              <>
                <button
                  onClick={() => setShowRevealBidsModal(true)}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-lg">
                    visibility
                  </span>
                  Reveal Bids
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
                    window.location.href = `/auction/new?relist=true&${params.toString()}`;
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
          <RevealBidsModal
            auction={data}
            isOpen={showRevealBidsModal}
            onClose={() => {
              setShowRevealBidsModal(false);
              if (onAuctionUpdate) onAuctionUpdate();
            }}
          />
        </div>
      )}
    </div>
  );
}
