"use client";

import { useEffect, useState } from "react";
import { useAuth } from "../../../../contexts/AuthContext";
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
  isCreator: boolean;
}

export function AuctionDetailsCard({
  data,
  creatorRating,
  isCreator,
}: AuctionDetailsCardProps) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [myBid, setMyBid] = useState<any>(null);
  const [idCopied, setIdCopied] = useState(false);

  // Fetch my bid status if not creator
  useEffect(() => {
    const fetchMyBid = async () => {
      try {
        const bid = await apiClient.getMyBid(data.id);
        setMyBid(bid);
      } catch (error) {
        // Silently fail as it's common to not have a bid
      }
    };

    if (!isCreator && user) {
      fetchMyBid();
    }
  }, [data.id, isCreator, user]);

  // Pre-check if this creator is already being followed
  useEffect(() => {
    const checkFollowStatus = async () => {
      try {
        const following = await apiClient.getMyFollowing();
        const alreadyFollowing = following.some((u) => u.id === data.createdBy);
        setIsFollowing(alreadyFollowing);
      } catch (error) {
        console.warn("Could not check follow status:", error);
      }
    };

    if (!isCreator && user) {
      checkFollowStatus();
    }
  }, [data.createdBy, isCreator, user]);

  const handleCopyId = () => {
    navigator.clipboard.writeText(data.id).then(() => {
      setIdCopied(true);
      setTimeout(() => setIdCopied(false), 2000);
    });
  };

  const handleFollow = async () => {
    if (!data.createdBy || isFollowLoading) return;
    try {
      setIsFollowLoading(true);
      await apiClient.followUser(data.createdBy);
      setIsFollowing(true);
    } catch (error) {
      console.error("Follow failed:", error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!data.createdBy || isFollowLoading) return;
    try {
      setIsFollowLoading(true);
      await apiClient.unfollowUser(data.createdBy);
      setIsFollowing(false);
    } catch (error) {
      console.error("Unfollow failed:", error);
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
                  {myBid ? "My Bid" : "Current Bid"}
                </span>
                <span className="text-xl font-black text-primary">
                  {myBid?.revealed
                    ? `$${myBid.amount}`
                    : myBid?.amount
                      ? `$${myBid.amount}`
                      : data.currentBid || data.minBid}
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
            <div className="flex items-center justify-end gap-2">
              <p
                className="text-slate-900 dark:text-white font-mono font-bold text-sm"
                title={data.id}
              >
                ANK-{data.id ? `${data.id.slice(0, 8)}…` : "000"}
              </p>
              <button
                onClick={handleCopyId}
                title="Copy full Auction ID"
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-all border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
              >
                <span className="material-symbols-outlined text-sm">
                  {idCopied ? "check_circle" : "content_copy"}
                </span>
                <span>{idCopied ? "Copied!" : "Copy"}</span>
              </button>
            </div>
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
          {!isCreator && (
            <div className="flex items-center gap-2">
              {isFollowing ? (
                <>
                  {/* Following badge */}
                  <span className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-bold border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20">
                    <span className="material-symbols-outlined text-sm">
                      check
                    </span>
                    Following
                  </span>
                  {/* Unfollow button */}
                  <button
                    onClick={handleUnfollow}
                    disabled={isFollowLoading}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-bold transition-all border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 ${isFollowLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      person_remove
                    </span>
                    {isFollowLoading ? "..." : "Unfollow"}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleFollow}
                  disabled={isFollowLoading}
                  className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-bold transition-all border border-primary text-primary hover:bg-primary hover:text-white ${isFollowLoading ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <span className="material-symbols-outlined text-sm">
                    person_add
                  </span>
                  {isFollowLoading ? "Loading..." : "Follow"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
