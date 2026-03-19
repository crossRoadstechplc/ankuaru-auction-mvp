"use client";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { PageShell } from "@/components/layout/page-shell";
import { useAuctionQuery } from "@/src/features/auctions/queries/hooks";
import { useAuctionBidsQuery } from "@/src/features/bids/queries/hooks";
import { useUserInfoQuery } from "@/src/features/profile/queries/hooks";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { UserRating } from "../../../lib/types";
import { useAuthStore } from "../../../stores/auth.store";
import { AuctionDetailsCard } from "./_components/AuctionDetailsCard";
import { BidActivity } from "./_components/BidActivity";
import { BiddingSidebar } from "./_components/BiddingSidebar";

const OWNER_POLL_INTERVAL_MS = 5000;
const PARTICIPANT_ACCESS_POLL_INTERVAL_MS = 10000;

function AuctionDetailContent() {
  const params = useParams();
  const id = params.id as string;
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.userId);
  const pollingInFlightRef = useRef(false);
  const [isTabVisible, setIsTabVisible] = useState(
    typeof document === "undefined"
      ? true
      : document.visibilityState === "visible",
  );
  const [isAuctionIdCopied, setIsAuctionIdCopied] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === "visible");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const {
    data: auction,
    isLoading: auctionLoading,
    error: auctionError,
    refetch: refetchAuction,
  } = useAuctionQuery(id, {
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
  const isOwner = !!userId && userId === auction?.createdBy;
  const shouldLoadBids = !!id && isOwner;
  const { data: bids = [], refetch: refetchBids } = useAuctionBidsQuery(id, {
    enabled: shouldLoadBids,
    refetchOnWindowFocus: false,
  });
  const creatorRating: UserRating | null = null;
  const { data: creatorInfo, isLoading: isCreatorInfoLoading } =
    useUserInfoQuery(auction?.createdBy || "", !!auction?.createdBy);
  const isLoading = auctionLoading || isCreatorInfoLoading;

  useEffect(() => {
    const shouldPoll =
      !!id &&
      isTabVisible &&
      ((isOwner &&
        (auction?.status === "OPEN" || auction?.status === "REVEAL")) ||
        (!isOwner &&
          auction?.status === "OPEN" &&
          auction?.hasRequestedBidAccess &&
          auction?.canBid === false));

    if (!shouldPoll) {
      return;
    }

    const intervalMs = isOwner
      ? OWNER_POLL_INTERVAL_MS
      : PARTICIPANT_ACCESS_POLL_INTERVAL_MS;

    const pollInterval = setInterval(async () => {
      if (pollingInFlightRef.current) {
        return;
      }

      pollingInFlightRef.current = true;

      try {
        await Promise.all([
          refetchAuction(),
          shouldLoadBids ? refetchBids() : Promise.resolve(),
        ]);
      } catch (err) {
        console.warn("Polling error:", err);
      } finally {
        pollingInFlightRef.current = false;
      }
    }, intervalMs);

    return () => clearInterval(pollInterval);
  }, [
    id,
    isOwner,
    isTabVisible,
    auction?.status,
    auction?.hasRequestedBidAccess,
    auction?.canBid,
    shouldLoadBids,
    refetchAuction,
    refetchBids,
  ]);

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f5f0] text-slate-900 antialiased dark:bg-background-dark dark:text-slate-100">
        <div className="text-center">
          <h2 className="mb-4 text-2xl font-bold">Authentication Required</h2>
          <p className="mb-6 text-slate-600 dark:text-slate-400">
            Please login to view auction details
          </p>
          <Link
            href="/login"
            className="rounded-lg bg-primary px-6 py-2 text-white transition-colors hover:bg-primary-dark"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || auctionLoading) {
    return (
      <PageShell className="bg-[linear-gradient(180deg,#f7f4ee_0%,#efe7da_100%)] text-slate-900 antialiased dark:bg-[linear-gradient(180deg,#0f172a_0%,#111827_100%)] dark:text-slate-100">
        <Header />
        <main className="mx-auto w-full max-w-[1480px] flex-1 px-4 py-6 lg:px-6">
          <div className="animate-pulse space-y-5">
            <div className="h-36 rounded-[18px] bg-slate-200/80 dark:bg-slate-800" />
            <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.45fr)_360px]">
              <div className="space-y-5">
                <div className="h-[520px] rounded-[18px] bg-slate-200/80 dark:bg-slate-800" />
                <div className="h-72 rounded-[18px] bg-slate-200/80 dark:bg-slate-800" />
              </div>
              <div className="h-[520px] rounded-[18px] bg-slate-200/80 dark:bg-slate-800" />
            </div>
          </div>
        </main>
      </PageShell>
    );
  }

  if (auctionError || !auction) {
    return (
      <PageShell className="bg-[#f8f5f0] text-slate-900 antialiased dark:bg-background-dark dark:text-slate-100">
        <Header />
        <main className="mx-auto w-full max-w-[1480px] flex-1 px-4 py-8 lg:px-6">
          <div className="py-16 text-center">
            <span className="material-symbols-outlined mb-4 text-6xl text-red-500">
              error
            </span>
            <h2 className="mb-4 text-2xl font-bold">Failed to load auction</h2>
            <p className="mb-6 text-slate-600 dark:text-slate-400">
              {auctionError instanceof Error
                ? auctionError.message
                : "Auction not found"}
            </p>
            <Link
              href="/feed"
              className="rounded-lg bg-primary px-6 py-2 text-white transition-colors hover:bg-primary-dark"
            >
              Back to feed
            </Link>
          </div>
        </main>
      </PageShell>
    );
  }

  const isSell = auction.auctionType === "SELL";
  const handleCopyAuctionId = () => {
    navigator.clipboard.writeText(auction.id).then(() => {
      setIsAuctionIdCopied(true);
      setTimeout(() => setIsAuctionIdCopied(false), 2000);
    });
  };

  return (
    <PageShell className="bg-[linear-gradient(180deg,#f7f4ee_0%,#efe7da_100%)] text-slate-900 antialiased dark:bg-[linear-gradient(180deg,#0f172a_0%,#111827_100%)] dark:text-slate-100">
      <Header />

      <main className="mx-auto w-full max-w-[1480px] flex-1 px-4 py-6 lg:px-6">
        <div className="mb-6 rounded-[18px] border border-slate-200/80 bg-white/92 p-5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/92 md:p-6">
          <nav className="mb-5 flex items-center gap-2 text-sm font-medium">
            <Link
              className="text-slate-400 transition-colors hover:text-primary"
              href="/feed"
            >
              Feed
            </Link>
            <span className="material-symbols-outlined text-xs text-slate-300">
              chevron_right
            </span>
            <span className="truncate text-slate-900 dark:text-white">
              {auction.title}
            </span>
          </nav>

          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {isOwner ? (
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-primary">
                    <span className="material-symbols-outlined text-sm">
                      admin_panel_settings
                    </span>
                    Creator
                  </div>
                ) : null}
                <div
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] ${
                    isSell
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "bg-sky-500/10 text-sky-700 dark:text-sky-300"
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {isSell ? "sell" : "shopping_cart"}
                  </span>
                  {isSell ? "Sell auction" : "Buy request"}
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.16em] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <span className="material-symbols-outlined text-sm">
                    flag
                  </span>
                  {auction.status}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white md:text-3xl">
                  {auction.title}
                </h1>
                <button
                  type="button"
                  onClick={handleCopyAuctionId}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <span className="material-symbols-outlined text-base">
                    {isAuctionIdCopied ? "check_circle" : "content_copy"}
                  </span>
                  {isAuctionIdCopied
                    ? "Copied"
                    : `Auction ID: ${auction.id.slice(0, 10)}...`}
                </button>
              </div>
            </div>

            <Link
              href="/feed"
              className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <span className="material-symbols-outlined text-base">
                arrow_back
              </span>
              Back to feed
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.45fr)_360px]">
          <div className="order-1 flex flex-col gap-5 xl:order-1">
            <AuctionDetailsCard
              data={auction}
              creatorRating={creatorRating}
              creatorInfo={creatorInfo}
              isCreator={isOwner}
            />
            <BidActivity data={auction} bids={bids} isCreator={isOwner} />
          </div>

          <div className="order-2 xl:sticky xl:top-24 xl:order-2 xl:self-start">
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
        </div>
      </main>

      <Footer />
    </PageShell>
  );
}

export default function AuctionDetailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <AuctionDetailContent />
    </Suspense>
  );
}
