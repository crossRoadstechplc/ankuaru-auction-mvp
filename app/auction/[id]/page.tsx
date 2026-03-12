"use client";

import Header from "@/components/layout/Header";
import { useAuctionQuery } from "@/src/features/auctions/queries/hooks";
import { useAuctionBidsQuery } from "@/src/features/bids/queries/hooks";
import { useUserInfoQuery } from "@/src/features/profile/queries/hooks";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { UserRating } from "../../../lib/types";
import { useAuthStore } from "../../../stores/auth.store";
import { AuctionDetailsCard } from "./_components/AuctionDetailsCard";
import { BidActivity } from "./_components/BidActivity";
import { BiddingSidebar } from "./_components/BiddingSidebar";

function AuctionDetailContent() {
  const params = useParams();
  const id = params.id as string;
  const { isAuthenticated, user } = useAuthStore();
  const [isTabVisible, setIsTabVisible] = useState(
    typeof document === "undefined" ? true : document.visibilityState === "visible",
  );

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // React Query hooks
  const {
    data: auction,
    isLoading: auctionLoading,
    error: auctionError,
    refetch: refetchAuction,
  } = useAuctionQuery(id, {
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
  const isOwner = !!user?.id && user.id === auction?.createdBy;
  const shouldLoadBids = !!id && isOwner;
  const { data: bids = [], refetch: refetchBids } = useAuctionBidsQuery(id, {
    enabled: shouldLoadBids,
    refetchOnWindowFocus: false,
  });
  const creatorRating: UserRating | null = null;
  const { data: creatorInfo, isLoading: isCreatorInfoLoading } = useUserInfoQuery(
    auction?.createdBy || "",
    !!auction?.createdBy,
  );
  const isLoading = auctionLoading || isCreatorInfoLoading;

  // Polling for bids and updates (only for owners)
  useEffect(() => {
    const shouldPoll =
      !!id &&
      isOwner &&
      isTabVisible &&
      (auction?.status === "OPEN" || auction?.status === "REVEAL");

    if (!shouldPoll) {
      return;
    }

    const pollInterval = setInterval(async () => {
      try {
        await Promise.all([
          refetchAuction(),
          shouldLoadBids ? refetchBids() : Promise.resolve(),
        ]);
      } catch (err) {
        console.warn("Polling error:", err);
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [
    id,
    isOwner,
    isTabVisible,
    auction?.status,
    shouldLoadBids,
    refetchAuction,
    refetchBids,
  ]);

  if (!isAuthenticated) {
    return (
      <div className="dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased bg-[#f8f5f0] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Please login to view auction details
          </p>
          <Link
            href="/login"
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || auctionLoading) {
    return (
      <div className="dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased bg-[#f8f5f0] min-h-screen">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-8">
                <div className="h-96 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
                <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
              </div>
              <div className="lg:col-span-4">
                <div className="h-80 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (auctionError || !auction) {
    return (
      <div className="dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased bg-[#f8f5f0] min-h-screen">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-8">
          <div className="text-center py-16">
            <span className="material-symbols-outlined text-6xl text-red-500 mb-4">
              error
            </span>
            <h2 className="text-2xl font-bold mb-4">Failed to load auction</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {auctionError instanceof Error
                ? auctionError.message
                : "Auction not found"}
            </p>
            <Link
              href="/feed"
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Back to Auctions
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isSell = auction.auctionType === "SELL";

  return (
    <div className="dark:bg-background-dark text-slate-900 dark:text-slate-100 antialiased bg-[#f8f5f0] min-h-screen">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-8">
        {/* Status Layout Badges */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          {isOwner && (
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-xs bg-primary/10 w-fit px-3 py-1.5 rounded-full border border-primary/20">
              <span className="material-symbols-outlined text-sm">
                admin_panel_settings
              </span>{" "}
              Creator Control Panel
            </div>
          )}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border shadow-sm ${
              isSell
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                : "bg-blue-500/10 text-blue-600 border-blue-500/20"
            }`}
          >
            <span className="material-symbols-outlined text-sm">
              {isSell ? "sell" : "shopping_cart"}
            </span>
            {isSell ? "Auction Sale" : "Purchase Request"}
          </div>
          {auction.status === "CLOSED" && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border shadow-sm bg-slate-100 text-slate-500 border-slate-200">
              <span className="material-symbols-outlined text-sm">lock</span>
              Closed
            </div>
          )}
        </div>

        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 mb-8 text-sm font-medium">
          <Link className="text-slate-400 hover:text-primary" href="/feed">
            Auctions
          </Link>
          <span className="material-symbols-outlined text-xs text-slate-300">
            chevron_right
          </span>
          <span className="text-slate-900 dark:text-white">
            {auction.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Sidebar Column — appears first on mobile, right column on desktop */}
          <div className="order-1 lg:order-2 lg:col-span-4">
            <BiddingSidebar
              data={auction}
              isCreator={isOwner}
              onAuctionUpdate={async () => {
                try {
                  await Promise.all([
                    refetchAuction(),
                    shouldLoadBids ? refetchBids() : Promise.resolve(),
                  ]);
                } catch (err) {
                  console.warn("Failed to refresh auction:", err);
                }
              }}
            />
          </div>

          {/* Main Content Column — appears second on mobile, left column on desktop */}
          <div className="order-2 lg:order-1 lg:col-span-8 flex flex-col gap-6 lg:gap-8">
            <AuctionDetailsCard
              data={auction}
              creatorRating={creatorRating}
              creatorInfo={creatorInfo}
              isCreator={isOwner}
            />
            <BidActivity data={auction} bids={bids} isCreator={isOwner} />
          </div>
        </div>
      </main>

      <footer className="mt-auto py-10 px-8 border-t border-slate-100 dark:border-slate-800 text-center">
        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">
          © 2026 Ankuaru Specialty Coffee Marketplace
        </p>
      </footer>
    </div>
  );
}

export default function AuctionDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <AuctionDetailContent />
    </Suspense>
  );
}
