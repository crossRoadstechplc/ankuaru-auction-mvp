"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageShell } from "@/components/layout/page-shell";
import { PanelCard } from "@/components/layout/panel-card";
import { getImageWithFallback } from "@/lib/imageUtils";
import { formatNumber, resolveAuctionDisplayPrice } from "@/lib/format";
import { AuctionCard } from "@/src/components/domain/auction/auction-card";
import { useAuctionsQuery } from "@/src/features/auctions/queries/hooks";
import { useMyBidsQuery } from "@/src/features/bids/queries/hooks";
import {
  useMyFollowersQuery,
  useMyFollowingQuery,
  useMyProfileQuery,
  useMyRatingSummaryQuery,
} from "@/src/features/profile/queries/hooks";
import Link from "next/link";
import { useMemo } from "react";
import { useAuthStore } from "../../stores/auth.store";

function formatRelativeTime(dateString: string) {
  const value = new Date(dateString).getTime();
  const now = Date.now();
  const diff = Math.max(1, Math.floor((now - value) / 1000));

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "OPEN":
      return "bg-emerald-500/20 text-emerald-700 dark:bg-emerald-400/25 dark:text-emerald-300 ring-1 ring-emerald-500/30";
    case "REVEAL":
      return "bg-amber-500/20 text-amber-800 dark:bg-amber-400/25 dark:text-amber-300 ring-1 ring-amber-500/30";
    case "CLOSED":
      return "bg-slate-300/50 text-slate-600 dark:bg-slate-600/50 dark:text-slate-400 ring-1 ring-slate-400/30";
    default:
      return "bg-sky-500/20 text-sky-700 dark:bg-sky-400/25 dark:text-sky-300 ring-1 ring-sky-500/30";
  }
}

export default function DashboardPage() {
  const userId = useAuthStore((state) => state.userId);
  const { data: profile } = useMyProfileQuery();
  const { data: auctions = [] } = useAuctionsQuery();
  const { data: myBids = [], isLoading: isLoadingBids } = useMyBidsQuery();
  const { data: followers = [] } = useMyFollowersQuery();
  const { data: following = [] } = useMyFollowingQuery();
  const { data: ratingSummary, isLoading: isLoadingRating } =
    useMyRatingSummaryQuery();

  const myAuctions = userId
    ? auctions.filter((a) => a.createdBy === userId)
    : [];
  const isLoadingAuctions = false;

  const activeLiveAuctions = useMemo(
    () =>
      auctions.filter((a) => {
        const isOpen = a.status === "OPEN";
        const isPast = new Date(a.endAt).getTime() <= Date.now();
        const isOwner = userId ? a.createdBy === userId : false;
        return isOpen && !isPast && !isOwner;
      }),
    [auctions, userId],
  );

  const latestAuctions = useMemo(
    () =>
      [...auctions]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 4),
    [auctions],
  );

  const topCategories = useMemo(() => {
    const map = new Map<string, number>();
    auctions.forEach((a) => {
      const cat = a.auctionCategory || "Other";
      map.set(cat, (map.get(cat) || 0) + 1);
    });
    return [...map.entries()]
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name]) => name);
  }, [auctions]);

  const endingSoonCount = useMemo(
    () =>
      myAuctions.filter((a) => {
        if (a.status !== "OPEN") return false;
        const endMs = new Date(a.endAt).getTime();
        const hoursLeft = (endMs - Date.now()) / (1000 * 60 * 60);
        return hoursLeft > 0 && hoursLeft <= 48;
      }).length,
    [myAuctions],
  );

  const activeBidsCount = useMemo(
    () =>
      myBids.filter((b) => b.auction?.status === "OPEN" || b.auction?.status === "REVEAL").length,
    [myBids],
  );

  const heroStats = [
    { label: "Created", value: myAuctions.length, helper: "lots" },
    {
      label: "Participating",
      value: isLoadingBids ? "—" : myBids.length,
      helper: "bids",
    },
    {
      label: "Reputation",
      value: isLoadingRating
        ? "—"
        : ratingSummary?.user?.averageRating
          ? parseFloat(ratingSummary.user.averageRating).toFixed(1)
          : "—",
      helper: "rating",
    },
    {
      label: "Network",
      value: `${followers.length}/${following.length}`,
      helper: "follow/following",
    },
  ];

  const recentActivity = useMemo(
    () =>
      [...myBids]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
    [myBids],
  );

  return (
    <PageShell>
      <PageContainer className="space-y-6 py-6 md:py-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to home
        </Link>
        {/* Hero */}
        <section className="rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
            <div className="space-y-4">
              <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white md:text-3xl">
                Welcome back{profile?.fullName ? `, ${profile.fullName}` : profile?.username ? `, ${profile.username}` : ""}
              </h1>
              <p className="max-w-lg text-sm text-slate-600 dark:text-slate-400">
                Quick access to your auctions, bids, and marketplace activity.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Link href="/auction/new">
                  <button className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-95">
                    <span className="material-symbols-outlined text-lg">add_circle</span>
                    New Auction
                  </button>
                </Link>
                <Link href="/feed">
                  <button className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800">
                    <span className="material-symbols-outlined text-base">travel_explore</span>
                    Explore
                  </button>
                </Link>
                <Link href="/profile">
                  <button className="inline-flex h-9 items-center gap-2 rounded-lg px-4 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100">
                    <span className="material-symbols-outlined text-base">person</span>
                    Profile
                  </button>
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
                {heroStats.map((s) => (
                  <div
                    key={s.label}
                    className="rounded-lg border border-slate-200/50 bg-slate-50/60 px-2.5 py-2 dark:border-slate-800 dark:bg-slate-900/40"
                  >
                    <p className="text-base font-bold text-slate-900 dark:text-white">
                      {String(s.value)}
                    </p>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-450">
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>
              {(endingSoonCount > 0 || activeBidsCount > 0) && (
                <div className="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-400">
                  {endingSoonCount > 0 && (
                    <span className="rounded-full bg-amber-100 px-2.5 py-1 font-medium dark:bg-amber-950/50">
                      {endingSoonCount} auction{endingSoonCount !== 1 ? "s" : ""} ending soon
                    </span>
                  )}
                  {activeBidsCount > 0 && (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 font-medium dark:bg-emerald-950/50">
                      {activeBidsCount} active bid{activeBidsCount !== 1 ? "s" : ""}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Main: 2-column layout */}
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {/* My Auctions */}
            <PanelCard
              title="My Auctions"
              description="Listings you manage"
              action={
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {myAuctions.length} items
                </span>
              }
              bodyClassName="p-0"
            >
              {isLoadingAuctions ? (
                <div className="px-5 py-8 text-center text-sm text-slate-500">
                  Loading...
                </div>
              ) : myAuctions.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    No auctions yet
                  </p>
                  <Link href="/auction/new" className="mt-3 inline-block">
                    <button className="rounded-lg border border-primary px-3 py-1.5 text-sm font-semibold text-primary hover:bg-primary/5">
                      Create auction
                    </button>
                  </Link>
                </div>
              ) : (
                <div>
                  {myAuctions.slice(0, 5).map((item) => (
                    <Link
                      key={item.id}
                      href={`/auction/${item.id}?view=creator`}
                      className="flex items-center gap-4 border-b border-slate-200/60 px-5 py-3 transition-colors last:border-none hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/50"
                    >
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-200 dark:bg-slate-800">
                        {item.image ? (
                          <img
                            alt=""
                            className="h-full w-full object-cover"
                            src={getImageWithFallback(item.image)}
                          />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center material-symbols-outlined text-2xl text-slate-400">
                            image
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                          {item.title}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-450">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${getStatusBadgeClass(item.status)}`}
                          >
                            {item.status}
                          </span>
                          <span className="ml-1.5">·</span>
                          <span className="ml-1.5">{item.bidCount ?? 0} bids</span>
                        </p>
                      </div>
                      <p className="shrink-0 text-lg font-bold text-slate-900 dark:text-white">
                        ETB {formatNumber(item.minBid)}
                      </p>
                      <span className="material-symbols-outlined shrink-0 text-slate-400">
                        chevron_right
                      </span>
                    </Link>
                  ))}
                  {myAuctions.length > 5 && (
                    <Link
                      href="/profile"
                      className="flex items-center justify-center gap-1 border-t border-slate-200/60 px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/50"
                    >
                      View all {myAuctions.length}
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </Link>
                  )}
                </div>
              )}
            </PanelCard>

            {/* Participating */}
            <PanelCard
              title="Participating"
              description={
                activeBidsCount > 0
                  ? `You have ${activeBidsCount} active bid${activeBidsCount !== 1 ? "s" : ""}`
                  : "Auctions where you bid"
              }
              action={
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {isLoadingBids ? "..." : `${myBids.length} bids`}
                </span>
              }
              bodyClassName="p-0"
            >
              {isLoadingBids ? (
                <div className="px-5 py-8 text-center text-sm text-slate-500">
                  Loading...
                </div>
              ) : myBids.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    No bids yet
                  </p>
                  <Link href="/feed" className="mt-3 inline-block">
                    <button className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                      Browse auctions
                    </button>
                  </Link>
                </div>
              ) : (
                <div>
                  {myBids.slice(0, 5).map((bid) => {
                    const auc = bid.auction as typeof bid.auction & { currentBid?: string; minBid?: string };
                    const isRevealed = bid.revealedAmount !== null;
                    const displayAmount =
                      isRevealed && bid.revealedAmount
                        ? bid.revealedAmount
                        : auc.currentBid || auc.minBid || "—";

                    return (
                      <Link
                        key={bid.id}
                        href={`/auction/${auc.id}`}
                        className="flex items-center gap-4 border-b border-slate-200/60 px-5 py-3 transition-colors last:border-none hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/50"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-800">
                          <span className="material-symbols-outlined text-xl text-slate-500">
                            gavel
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold text-slate-900 dark:text-white">
                            {auc.title}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-450">
                            <span
                              className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${getStatusBadgeClass(auc.status)}`}
                            >
                              {auc.status}
                            </span>
                            <span className="ml-1.5">·</span>
                            <span className="ml-1.5">
                              {auc.status === "REVEAL"
                                ? "Reveal phase"
                                : auc.status === "CLOSED"
                                  ? "Closed"
                                  : "Bid placed"}
                            </span>
                          </p>
                        </div>
                        <p className="shrink-0 text-lg font-bold text-slate-900 dark:text-white">
                          ETB {formatNumber(displayAmount)}
                        </p>
                        <span className="material-symbols-outlined shrink-0 text-slate-400">
                          chevron_right
                        </span>
                      </Link>
                    );
                  })}
                  {myBids.length > 5 && (
                    <Link
                      href="/profile"
                      className="flex items-center justify-center gap-1 border-t border-slate-200/60 px-5 py-3 text-sm font-semibold text-primary transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/50"
                    >
                      View all {myBids.length} bids
                      <span className="material-symbols-outlined text-base">arrow_forward</span>
                    </Link>
                  )}
                </div>
              )}
            </PanelCard>

            {/* Recommended / Trending */}
            <PanelCard
              title={activeLiveAuctions.length > 0 ? "Recommended for You" : "Trending"}
              description={
                activeLiveAuctions.length > 0
                  ? "Active auctions you might like"
                  : "Discover open lots on the market"
              }
              action={
                <Link
                  href="/feed"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Explore market
                </Link>
              }
            >
              {activeLiveAuctions.length === 0 ? (
                <div className="space-y-5">
                  {latestAuctions.length > 0 && (
                    <div>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-450">
                        Latest auctions
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {latestAuctions.map((auction) => (
                          <AuctionCard
                            key={auction.id}
                            id={auction.id}
                            title={auction.title}
                            category={auction.auctionCategory || undefined}
                            currentBidAmount={resolveAuctionDisplayPrice(auction)}
                            endAt={auction.endAt}
                            status={
                              auction.status as "OPEN" | "SCHEDULED" | "REVEAL" | "CLOSED"
                            }
                            images={
                              auction.images && auction.images.length > 0
                                ? auction.images
                                : auction.image
                                  ? [auction.image]
                                  : []
                            }
                            className="border border-slate-200/60 dark:border-slate-800"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {topCategories.length > 0 && (
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-450">
                        Top categories
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {topCategories.map((cat) => (
                          <Link
                            key={cat}
                            href={`/feed?category=${encodeURIComponent(cat)}`}
                            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800"
                          >
                            {cat}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                  {latestAuctions.length === 0 && topCategories.length === 0 && (
                    <p className="py-4 text-center text-sm text-slate-600 dark:text-slate-400">
                      No recommendations yet
                    </p>
                  )}
                  <div className="flex justify-center pt-2">
                    <Link href="/feed">
                      <button className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-white hover:opacity-95">
                        Explore market
                      </button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                    {activeLiveAuctions.slice(0, 4).map((auction) => (
                    <AuctionCard
                      key={auction.id}
                      id={auction.id}
                      title={auction.title}
                      category={auction.auctionCategory || undefined}
                      currentBidAmount={resolveAuctionDisplayPrice(auction)}
                      endAt={auction.endAt}
                      status={
                        auction.status as "OPEN" | "SCHEDULED" | "REVEAL" | "CLOSED"
                      }
                      images={
                        auction.images && auction.images.length > 0
                          ? auction.images
                          : auction.image
                            ? [auction.image]
                            : []
                      }
                      className="border border-slate-200/60 dark:border-slate-800"
                    />
                  ))}
                </div>
              )}
            </PanelCard>
          </div>

          {/* Right sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
            <PanelCard
              title="Recent Activity"
              description="Your latest bids"
              action={
                <Link href="/notifications" className="text-xs font-semibold text-primary hover:underline">
                  Notifications
                </Link>
              }
              bodyClassName="space-y-0 p-0"
            >
              {recentActivity.length === 0 ? (
                <div className="px-5 py-6 text-center text-sm text-slate-500 dark:text-slate-450">
                  Activity will appear here
                </div>
              ) : (
                <div>
                  {recentActivity.map((bid) => (
                    <Link
                      key={bid.id}
                      href={`/auction/${bid.auction.id}`}
                      className="block border-b border-slate-200/60 px-5 py-3 transition-colors last:border-none hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900/50"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                          {bid.auction.title}
                        </p>
                        <span className="shrink-0 text-[10px] font-medium text-slate-500">
                          {formatRelativeTime(bid.createdAt)}
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between gap-2">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${getStatusBadgeClass(bid.auction.status)}`}
                        >
                          {bid.auction.status}
                        </span>
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {bid.revealedAmount
                            ? `ETB ${formatNumber(String(bid.revealedAmount))}`
                            : "Commit"}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </PanelCard>
          </aside>
        </div>
      </PageContainer>
    </PageShell>
  );
}
