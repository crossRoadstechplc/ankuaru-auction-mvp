"use client";

import { useEffect, useState } from "react";
import apiClient from "../../../../lib/api";

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
    status: "OPEN" | "REVEAL" | "CLOSED";
    createdBy: string;
    createdAt: string;
    bidCount?: number;
    currentBid?: string;
  };
  isCreator: boolean;
}

// Helper to calculate time remaining
function getTimeRemaining(endAt: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isClosed: boolean;
} {
  const now = new Date().getTime();
  const end = new Date(endAt).getTime();
  const diff = end - now;

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isClosed: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isClosed: false };
}

export function BiddingSidebar({ data, isCreator }: BiddingSidebarProps) {
  const isSell = data.auctionType === "SELL";
  const { days, hours, minutes, seconds, isClosed } = getTimeRemaining(
    data.endAt,
  );

  const [bidAmount, setBidAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myBid, setMyBid] = useState<Bid | null>(null);
  const [showBidForm, setShowBidForm] = useState(false);

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

    if (!isCreator && !isClosed) {
      fetchMyBid();
    }
  }, [data.id, isCreator, isClosed]);

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      alert("Please enter a valid bid amount");
      return;
    }

    try {
      setIsSubmitting(true);

      // Generate commit hash (in real app, this would be done client-side)
      const commitHash = `hash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await apiClient.placeBid(data.id, commitHash);

      alert(
        "Bid submitted successfully! Your bid is now hidden until the reveal phase.",
      );
      setBidAmount("");
      setShowBidForm(false);

      // Refresh my bid
      const updatedBid = await apiClient.getMyBid(data.id);
      setMyBid(updatedBid);
    } catch (error) {
      console.error("Bid submission failed:", error);
      alert(error instanceof Error ? error.message : "Failed to submit bid");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevealBid = async () => {
    if (!myBid) return;

    try {
      setIsSubmitting(true);

      // In real app, user would enter their original amount and nonce
      const revealAmount =
        bidAmount ||
        prompt("Enter your bid amount for reveal:") ||
        myBid.amount;
      const nonce = `reveal_${Date.now()}`;

      await apiClient.revealBid(data.id, revealAmount, nonce);

      alert("Bid revealed successfully!");
    } catch (error) {
      console.error("Bid reveal failed:", error);
      alert(error instanceof Error ? error.message : "Failed to reveal bid");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lg:col-span-4 flex flex-col gap-6">
      {/* Countdown Card */}
      <div
        className={`${isClosed ? "bg-slate-700" : "bg-primary dark:bg-primary/90"} rounded-xl p-6 text-white shadow-lg shadow-primary/20`}
      >
        <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4 opacity-80">
          {isClosed ? "Auction Ended" : "Auction Ends In"}
        </p>
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
      </div>

      {!isCreator ? (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          {isClosed ? (
            <div className="text-center py-4">
              <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-slate-400 text-3xl">
                  event_busy
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">Bidding Closed</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
                {" "}
                This auction has officially concluded. No further bids are being
                accepted.{" "}
              </p>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                  Winning Bid
                </p>
                <p className="text-2xl font-black text-primary">
                  {data.currentBid}
                </p>
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
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                      $
                    </span>
                    <input
                      className="w-full pl-8 pr-4 py-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:border-primary focus:ring-0 text-xl font-bold transition-all"
                      type="number"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>
                <button className="w-full bg-primary hover:bg-primary-dark text-white py-5 rounded-xl font-black text-lg shadow-xl shadow-primary/30 transition-all uppercase tracking-widest active:scale-[0.98]">
                  {isSell ? "Submit Higher Bid" : "Submit Better Offer"}
                </button>
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
              {isClosed
                ? "This auction is closed. You can view the final reports or relist the item."
                : "Bidding is disabled for creators. Use the actions below to manage your listing."}
            </p>
          </div>
          <div className="space-y-3">
            {!isClosed ? (
              <>
                <button className="w-full py-4 bg-slate-900 dark:bg-slate-800 text-white rounded-xl font-bold text-sm shadow-lg shadow-slate-900/10 hover:opacity-90 transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">
                    edit
                  </span>
                  Modify Auction
                </button>
                <button className="w-full py-4 border-2 border-red-500/20 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">
                    block
                  </span>
                  Close Early
                </button>
              </>
            ) : (
              <>
                <button className="w-full py-4 bg-primary hover:opacity-90 text-white rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">
                    description
                  </span>
                  View Final Report
                </button>
                <button className="w-full py-4 border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                  <span className="material-symbols-outlined text-lg">
                    refresh
                  </span>
                  Relist Item
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
