"use client";

import StatsCard from "@/components/dashboard/StatsCard";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { PageSection } from "@/components/layout/page-section";
import { PageShell } from "@/components/layout/page-shell";
import { PanelCard } from "@/components/layout/panel-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getImageWithFallback } from "@/lib/imageUtils";
import { AuctionCard } from "@/src/components/domain/auction/auction-card";
import { useAuctionsQuery } from "@/src/features/auctions/queries/hooks";
import { useMyBidsQuery } from "@/src/features/bids/queries/hooks";
import {
  useMyFollowersQuery,
  useMyFollowingQuery,
  useMyProfileQuery,
  useMyRatingSummaryQuery,
} from "@/src/features/profile/queries/hooks";
import { Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "../../stores/auth.store";

function formatRelativeTime(dateString: string) {
  const value = new Date(dateString).getTime();
  const now = Date.now();
  const diff = Math.max(1, Math.floor((now - value) / 1000));

  if (diff < 60) {
    return "just now";
  }

  if (diff < 3600) {
    return `${Math.floor(diff / 60)}m ago`;
  }

  if (diff < 86400) {
    return `${Math.floor(diff / 3600)}h ago`;
  }

  return `${Math.floor(diff / 86400)}d ago`;
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "OPEN":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "REVEAL":
      return "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300";
    case "CLOSED":
      return "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
    default:
      return "bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300";
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
    ? auctions.filter((auction) => auction.createdBy === userId)
    : [];
  const isLoadingAuctions = false;

  const followersCount = followers.length;
  const followingsCount = following.length;

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const activeLiveAuctions = auctions.filter((auction) => {
    const isOpen = auction.status === "OPEN";
    const isPast = new Date(auction.endAt).getTime() <= currentTime.getTime();
    const isOwner = userId ? auction.createdBy === userId : false;
    return isOpen && !isPast && !isOwner;
  });

  const ratingValue = isLoadingRating
    ? "..."
    : ratingSummary?.user?.averageRating
      ? `${parseFloat(ratingSummary.user.averageRating).toFixed(1)} / 5.0`
      : "N/A";

  const recentActivity = useMemo(
    () =>
      [...myBids]
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        )
        .slice(0, 6),
    [myBids],
  );
  const heroSummary = [
    {
      label: "Created",
      value: myAuctions.length.toString(),
      helper: "lots managed",
    },
    {
      label: "Participating",
      value: isLoadingBids ? "..." : myBids.length.toString(),
      helper: "active bids",
    },
    {
      label: "Trust score",
      value: isLoadingRating
        ? "..."
        : ratingSummary?.user?.averageRating
          ? parseFloat(ratingSummary.user.averageRating).toFixed(1)
          : "N/A",
      helper: "seller rating",
    },
    {
      label: "Network",
      value: `${followersCount}/${followingsCount}`,
      helper: "followers/following",
    },
  ];

  return (
    <PageShell>
      <PageContainer className="space-y-8 py-8 md:py-10">
        <PageHeader
          title="Dashboard"
          description="Your marketplace workspace at a glance."
          actions={
            <Link href="/auction/new">
              <Button className="shadow-sm">
                <span className="material-symbols-outlined text-lg">
                  add_circle
                </span>
                Create Auction
              </Button>
            </Link>
          }
        />

        <PageSection>
          <div className="overflow-hidden rounded-[28px] bg-[radial-gradient(circle_at_top_left,rgba(217,119,6,0.10),transparent_30%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(255,255,255,0.84))] shadow-sm ring-1 ring-black/[0.04] dark:bg-[radial-gradient(circle_at_top_left,rgba(217,119,6,0.16),transparent_24%),linear-gradient(135deg,rgba(2,6,23,0.96),rgba(2,6,23,0.88))]">
            <div className="grid gap-6 px-6 py-7 md:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] md:px-8 md:py-8">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  <span className="material-symbols-outlined text-sm">dashboard</span>
                  Workspace Summary
                </div>
                <div className="space-y-3">
                  <h2 className="text-3xl font-black tracking-tight text-foreground md:text-[2.6rem] md:leading-[1.05]">
                    Welcome back{profile?.username ? `, ${profile.username}` : ""}
                  </h2>
                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-[15px]">
                    Review live demand, check your auction momentum, and move quickly on the marketplace without losing context.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:hidden">
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
                    {myAuctions.length} Created
                  </Badge>
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
                    {isLoadingBids ? "..." : `${myBids.length} Participating`}
                  </Badge>
                  <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
                    {activeLiveAuctions.length} Live Nearby
                  </Badge>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link href="/auction/new">
                    <Button size="sm" className="h-10 gap-2 rounded-full px-5 shadow-sm">
                      <span className="material-symbols-outlined text-sm">
                        add_circle
                      </span>
                      New Auction
                    </Button>
                  </Link>
                  <Link href="/feed">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-10 gap-2 rounded-full border-border/70 bg-background/75 px-4 text-muted-foreground hover:text-foreground"
                    >
                      <span className="material-symbols-outlined text-sm">
                        travel_explore
                      </span>
                      Explore Market
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-10 gap-2 rounded-full px-4 text-muted-foreground hover:bg-background/70 hover:text-foreground"
                    >
                      <span className="material-symbols-outlined text-sm">
                        person
                      </span>
                      My Profile
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="hidden rounded-[24px] bg-background/70 p-4 ring-1 ring-black/[0.04] md:block">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Today&apos;s Snapshot
                    </p>
                    <p className="text-xs text-muted-foreground">
                      A quick read of your current position.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 justify-end">
                    <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
                      {activeLiveAuctions.length} live nearby
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {heroSummary.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-2xl bg-card/90 px-4 py-3 shadow-sm ring-1 ring-black/[0.03]"
                    >
                      <p className="text-2xl font-black tracking-tight text-foreground">
                        {item.value}
                      </p>
                      <p className="mt-1 text-sm font-medium text-foreground/85">
                        {item.label}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.helper}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </PageSection>

        <PageSection>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              label="Participating bids"
              value={isLoadingBids ? "..." : myBids.length.toString()}
              icon="layers"
              iconBgColor="bg-primary/10"
              iconTextColor="text-primary"
            />
            <StatsCard
              label="My auctions"
              value={isLoadingAuctions ? "..." : myAuctions.length.toString()}
              icon="store"
              iconBgColor="bg-amber-500/10"
              iconTextColor="text-amber-500"
            />
            <StatsCard
              label="Reputation"
              value={isLoadingRating ? "..." : ratingValue.replace(" / 5.0", "")}
              icon="military_tech"
              iconBgColor="bg-blue-500/10"
              iconTextColor="text-blue-500"
            />
            <StatsCard
              label="Followers / Following"
              value={`${followersCount} / ${followingsCount}`}
              icon={<Users className="h-5 w-5" />}
              iconBgColor="bg-emerald-500/10"
              iconTextColor="text-emerald-600"
            />
          </div>
        </PageSection>

        <PageSection>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
            <PanelCard
              title="My Auctions"
              description="Listings you created and currently manage."
              className="xl:col-span-6"
              action={
                <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-xs font-medium">
                  {myAuctions.length} Items
                </Badge>
              }
              bodyClassName="space-y-3"
            >
              {isLoadingAuctions ? (
                <div className="rounded-xl bg-muted/20 p-4 text-sm text-muted-foreground">
                  Loading your auctions...
                </div>
              ) : myAuctions.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl bg-muted/20 p-8 text-center">
                  <span className="material-symbols-outlined mb-2 text-4xl text-muted-foreground">
                    storefront
                  </span>
                  <p className="text-sm font-medium text-muted-foreground">
                    You have not created any auctions yet.
                  </p>
                  <Link href="/auction/new" className="mt-4">
                    <Button size="sm">Create New Auction</Button>
                  </Link>
                </div>
              ) : (
                <>
                  {myAuctions.slice(0, 5).map((item) => (
                    <Link
                      key={item.id}
                      href={`/auction/${item.id}?view=creator`}
                      className="group flex items-center gap-4 rounded-xl bg-muted/[0.24] px-4 py-3.5 transition-all hover:bg-muted/[0.38] hover:shadow-sm"
                    >
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl bg-muted text-muted-foreground">
                        {item.image ? (
                          <img
                            alt={item.title}
                            className="h-full w-full object-cover"
                            src={getImageWithFallback(item.image)}
                          />
                        ) : (
                          <span className="material-symbols-outlined text-3xl">
                            image
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="truncate text-sm font-bold text-foreground">
                          {item.title}
                        </h4>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                          <span className="text-base font-bold text-foreground">
                            ETB {item.reservePrice}
                          </span>
                          <span className="text-muted-foreground">
                            {item.bidCount ?? 0} bids
                          </span>
                          <Badge
                            variant="secondary"
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getStatusBadgeClass(
                              item.status,
                            )}`}
                          >
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-[18px] text-muted-foreground/50 transition-transform group-hover:translate-x-0.5">
                        chevron_right
                      </span>
                    </Link>
                  ))}
                  {myAuctions.length > 5 && (
                    <div className="pt-2">
                      <Link href="/profile" className="block w-full">
                        <Button variant="ghost" className="w-full text-sm font-medium text-primary hover:text-primary/80">
                          View all {myAuctions.length} auctions
                          <span className="material-symbols-outlined ml-1.5 text-[16px]">
                            arrow_forward
                          </span>
                        </Button>
                      </Link>
                    </div>
                  )}
                </>
              )}
            </PanelCard>

            <PanelCard
              title="Participating"
              description="Auctions where you have active bids."
              className="xl:col-span-6"
              action={
                <Badge variant="secondary" className="rounded-full px-2.5 py-1 text-xs font-medium">
                  {isLoadingBids ? "..." : `${myBids.length} Bids`}
                </Badge>
              }
              bodyClassName="space-y-3"
            >
              {isLoadingBids ? (
                <div className="rounded-xl bg-muted/20 p-4 text-sm text-muted-foreground">
                  Loading your bids...
                </div>
              ) : myBids.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl bg-muted/20 p-8 text-center">
                  <span className="material-symbols-outlined mb-2 text-4xl text-muted-foreground">
                    gavel
                  </span>
                  <p className="text-sm font-medium text-muted-foreground">
                    You have not placed any bids yet.
                  </p>
                  <Link href="/feed" className="mt-4">
                    <Button size="sm">Browse Auctions</Button>
                  </Link>
                </div>
              ) : (
                <>
                  {myBids.slice(0, 5).map((bid) => {
                    const auc = bid.auction;
                    const isRevealed = bid.revealedAmount !== null;
                    const isRevealPhase = auc.status === "REVEAL";
                    const isClosed = auc.status === "CLOSED";

                    let statusLabel = "Bid placed";
                    if (isRevealPhase) {
                      statusLabel = "Reveal phase";
                    } else if (isClosed) {
                      statusLabel = "Closed";
                    }

                    return (
                      <Link
                        key={bid.id}
                        href={`/auction/${auc.id}`}
                        className="group flex items-center gap-4 rounded-xl bg-muted/[0.24] px-4 py-3.5 transition-all hover:bg-muted/[0.38] hover:shadow-sm"
                      >
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <span className="material-symbols-outlined text-2xl">
                            gavel
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-sm font-bold text-foreground">
                            {auc.title}
                          </h4>
                          <p className="mt-1 text-xs font-medium text-muted-foreground">
                            {statusLabel}
                          </p>
                          <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                            {isRevealed ? (
                              <span className="font-semibold text-foreground">
                                Revealed: {bid.revealedAmount}
                              </span>
                            ) : null}
                            <Badge
                              variant="secondary"
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getStatusBadgeClass(
                                auc.status,
                              )}`}
                            >
                              {auc.status}
                            </Badge>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-[18px] text-muted-foreground/50 transition-transform group-hover:translate-x-0.5">
                          chevron_right
                        </span>
                      </Link>
                    );
                  })}
                  {myBids.length > 5 && (
                    <div className="pt-2">
                      <Link href="/profile" className="block w-full">
                        <Button variant="ghost" className="w-full text-sm font-medium text-primary hover:text-primary/80">
                          View all {myBids.length} active bids
                          <span className="material-symbols-outlined ml-1.5 text-[16px]">
                            arrow_forward
                          </span>
                        </Button>
                      </Link>
                    </div>
                  )}
                </>
              )}
            </PanelCard>

            <PanelCard
              title="Recent Activity"
              description="Latest actions from your bidding timeline."
              className="xl:col-span-4"
              bodyClassName="space-y-1"
              action={
                <Link
                  href="/notifications"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  View notifications
                </Link>
              }
            >
              {isLoadingBids ? (
                <div className="rounded-xl bg-muted/20 p-4 text-sm text-muted-foreground">
                  Loading activity...
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="rounded-xl bg-muted/20 p-5 text-sm text-muted-foreground">
                  Your recent activity will appear here once you join auctions.
                </div>
              ) : (
                <div className="relative pl-5">
                  <div className="absolute bottom-2 left-[4px] top-2 w-px bg-border/70" />
                  {recentActivity.map((bid) => (
                    <Link
                      key={`${bid.id}-activity`}
                      href={`/auction/${bid.auction.id}`}
                      className="relative block rounded-xl px-0 py-2.5 transition-colors hover:bg-muted/20"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`absolute left-[-17px] top-[18px] h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-background ${
                            bid.auction.status === "OPEN"
                              ? "bg-emerald-500"
                              : bid.auction.status === "REVEAL"
                                ? "bg-amber-500"
                                : "bg-slate-400"
                          }`}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="truncate text-sm font-semibold text-foreground">
                              {bid.auction.title}
                            </p>
                            <p className="text-[11px] font-medium text-muted-foreground">
                              {formatRelativeTime(bid.createdAt)}
                            </p>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {bid.revealedAmount
                              ? `Revealed ${bid.revealedAmount}`
                              : "Commit submitted"}
                          </p>
                          <div className="mt-1.5 flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getStatusBadgeClass(
                                bid.auction.status,
                              )}`}
                            >
                              {bid.auction.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </PanelCard>

            <PanelCard
              title="Recommended for You"
              description="Hand-picked active auctions you might like."
              className="xl:col-span-8"
              action={
                <Link
                  className="text-xs font-semibold text-primary hover:underline"
                  href="/feed"
                >
                  Explore market
                </Link>
              }
            >
              {isLoadingAuctions ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-72 animate-pulse rounded-xl bg-muted/40"
                    />
                  ))}
                </div>
              ) : activeLiveAuctions.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl bg-muted/20 p-10 text-center">
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <span className="material-symbols-outlined text-3xl text-primary/60">
                      star
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-foreground">
                    No recommendations right now
                  </h4>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">
                    There are no open auctions that match your profile at the moment. Explore the market
                    or check back shortly.
                  </p>
                  <Link href="/feed" className="mt-5">
                    <Button size="sm">Browse All Auctions</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-muted/[0.22] px-4 py-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Suggested active lots
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Based on open marketplace activity around you.
                      </p>
                    </div>
                    <Badge variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium">
                      {activeLiveAuctions.length} open now
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {activeLiveAuctions.slice(0, 4).map((auction) => (
                    <AuctionCard
                      key={auction.id}
                      id={auction.id}
                      title={auction.title}
                      category={auction.auctionCategory || undefined}
                      currentBidAmount={parseFloat(auction.minBid) || 0}
                      endAt={auction.endAt}
                      status={
                        auction.status as
                          | "OPEN"
                          | "SCHEDULED"
                          | "REVEAL"
                          | "CLOSED"
                      }
                      images={auction.image ? [auction.image] : []}
                      className="border-0 shadow-sm"
                    />
                  ))}
                  </div>
                </div>
              )}
            </PanelCard>
          </div>
        </PageSection>
      </PageContainer>
    </PageShell>
  );
}
