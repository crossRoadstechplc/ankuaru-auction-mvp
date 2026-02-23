"use client";

import { useState } from "react";
import apiClient from "../../../../lib/api";
import { UserRating } from "../../../../lib/types";

interface AuctionDetailsCardProps {
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
  creatorRating?: UserRating | null;
}

export function AuctionDetailsCard({
  data,
  creatorRating,
}: AuctionDetailsCardProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const handleFollowToggle = async () => {
    if (!data.createdBy || isFollowLoading) return;

    try {
      setIsFollowLoading(true);
      if (isFollowing) {
        await apiClient.unfollowUser(data.createdBy);
      } else {
        await apiClient.followUser(data.createdBy);
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error("Follow toggle failed:", error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="aspect-video relative overflow-hidden group">
        <div className="w-full h-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <span className="material-symbols-outlined text-6xl text-slate-400">
            image
          </span>
        </div>
        <div
          className={`absolute top-4 left-4 ${data.status === "CLOSED" ? "bg-slate-500" : "bg-primary"} text-white px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase`}
        >
          {data.status === "CLOSED" ? "Auction Ended" : "Live Auction"}
        </div>
      </div>
      <div className="p-8">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">
              {data.title}
            </h1>

            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 pb-6 border-b border-slate-100 dark:border-slate-800 mb-6 font-display">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  Min Bid
                </span>
                <span className="text-lg font-bold text-slate-700 dark:text-slate-300">
                  ${data.minBid}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  Current Bid
                </span>
                <span className="text-xl font-black text-primary">
                  {data.currentBid || data.minBid}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  Total Bids
                </span>
                <span className="text-lg font-bold text-slate-700 dark:text-slate-300">
                  {data.bidCount || 0}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 font-bold uppercase">
                  Status
                </span>
                <span
                  className={`text-lg font-bold ${data.status === "CLOSED" ? "text-slate-400" : "text-red-500"}`}
                >
                  {data.status}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-slate-500 dark:text-slate-400 text-sm">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-lg text-primary">
                  category
                </span>{" "}
                {data.auctionCategory}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-lg text-primary">
                  sell
                </span>{" "}
                {data.auctionType}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-lg text-primary">
                  visibility
                </span>{" "}
                {data.visibility}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">
              Auction ID
            </p>
            <p className="text-slate-900 dark:text-white font-mono font-bold">
              ANK-{data.id || "000"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-8">
          <div className="bg-background-light dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
              Category
            </p>
            <p className="text-slate-900 dark:text-white font-bold">
              {data.auctionCategory}
            </p>
          </div>
          <div className="bg-background-light dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
              Type
            </p>
            <p className="text-slate-900 dark:text-white font-bold">
              {data.auctionType}
            </p>
          </div>
          <div className="bg-background-light dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
              Start Date
            </p>
            <p className="text-slate-900 dark:text-white font-bold">
              {new Date(data.startAt).toLocaleDateString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="bg-background-light dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
              End Date
            </p>
            <p className="text-slate-900 dark:text-white font-bold">
              {new Date(data.endAt).toLocaleDateString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="prose dark:prose-invert max-w-none mb-8">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
            Product Description
          </h3>
          <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
            {data.itemDescription}
          </p>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-primary/20">
              <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">
                  person
                </span>
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase">
                Auction Creator
              </p>
              <p className="font-bold text-slate-900 dark:text-white">
                {creatorRating?.user?.username || `User ID: ${data.createdBy}`}
                {creatorRating?.user?.averageRating && (
                  <span className="text-yellow-500 ml-1">
                    ★ {parseFloat(creatorRating.user.averageRating).toFixed(1)}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={handleFollowToggle}
            disabled={isFollowLoading}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              isFollowing
                ? "border border-slate-300 text-slate-600 hover:bg-slate-100"
                : "border border-primary text-primary hover:bg-primary hover:text-white"
            } ${isFollowLoading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isFollowLoading
              ? "Loading..."
              : isFollowing
                ? "Following"
                : "Follow"}
          </button>
        </div>
      </div>
    </section>
  );
}
