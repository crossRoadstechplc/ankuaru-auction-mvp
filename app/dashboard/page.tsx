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
import { Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  useAuctions,
  useMyBids,
  useMyFollowers,
  useMyFollowing,
} from "../../hooks/useAuctions";
import { useMyRatingSummary } from "../../hooks/useProfile";
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

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  const { data: auctions = [] } = useAuctions();
  const { data: myBids = [], isLoading: isLoadingBids } = useMyBids();
  const { data: followers = [] } = useMyFollowers();
  const { data: following = [] } = useMyFollowing();
  const { data: ratingSummary, isLoading: isLoadingRating } =
    useMyRatingSummary();

  const myAuctions = user
    ? auctions.filter((auction) => auction.createdBy === user.id)
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
    const isOwner = user ? auction.createdBy === user.id : false;
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

  return (
    <PageShell>
      <PageContainer className="space-y-8 py-8 md:py-10">
        <PageHeader
          title="Dashboard"
          description="Track your auctions, bids, and account activity in one place."
          actions={
            <Link href="/auction/new">
              <Button>
                <span className="material-symbols-outlined text-lg">
                  add_circle
                </span>
                Create Auction
              </Button>
            </Link>
          }
        />

        <PageSection>
          <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-card to-card p-5 shadow-sm md:p-7">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                  Workspace Summary
                </p>
                <h2 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">
                  Welcome back{user?.username ? `, ${user.username}` : ""}
                </h2>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="px-3 py-1">
                  {myAuctions.length} Created
                </Badge>
                <Badge variant="secondary" className="px-3 py-1">
                  {isLoadingBids ? "..." : `${myBids.length} Participating`}
                </Badge>
                <Badge variant="secondary" className="px-3 py-1">
                  {activeLiveAuctions.length} Live Nearby
                </Badge>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Link href="/auction/new">
                <Button size="sm" className="gap-2">
                  <span className="material-symbols-outlined text-sm">
                    add_circle
                  </span>
                  New Auction
                </Button>
              </Link>
              <Link href="/feed">
                <Button size="sm" variant="outline" className="gap-2">
                  <span className="material-symbols-outlined text-sm">
                    travel_explore
                  </span>
                  Explore Market
                </Button>
              </Link>
              <Link href="/profile">
                <Button size="sm" variant="outline" className="gap-2">
                  <span className="material-symbols-outlined text-sm">
                    person
                  </span>
                  My Profile
                </Button>
              </Link>
            </div>
          </div>
        </PageSection>

        <PageSection>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatsCard
              label="Participating"
              value={`${isLoadingBids ? "..." : myBids.length} Bids`}
              icon="layers"
              iconBgColor="bg-primary/10"
              iconTextColor="text-primary"
            />
            <StatsCard
              label="My Auctions"
              value={`${isLoadingAuctions ? "..." : myAuctions.length} Items`}
              icon="store"
              iconBgColor="bg-amber-500/10"
              iconTextColor="text-amber-500"
            />
            <StatsCard
              label="Reputation"
              value={ratingValue}
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
                <Badge variant="secondary" className="px-2.5 py-1 text-xs">
                  {myAuctions.length} Items
                </Badge>
              }
              bodyClassName="space-y-3"
            >
              {isLoadingAuctions ? (
                <div className="rounded-xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                  Loading your auctions...
                </div>
              ) : myAuctions.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/80 bg-muted/20 p-8 text-center">
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
                      className="group flex items-center gap-4 rounded-xl border border-border/70 bg-card px-4 py-3 transition-colors hover:bg-muted/30"
                    >
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground">
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
                        <div className="mt-1 flex items-center gap-2 text-xs">
                          <span className="font-semibold text-primary">
                            ${item.reservePrice}
                          </span>
                          <span className="text-muted-foreground">
                            - {item.bidCount ?? 0} bids
                          </span>
                          <Badge
                            variant="secondary"
                            className="px-2 py-0 text-[10px]"
                          >
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                      <span className="material-symbols-outlined text-muted-foreground transition-transform group-hover:translate-x-0.5">
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
                <Badge variant="secondary" className="px-2.5 py-1 text-xs">
                  {isLoadingBids ? "..." : `${myBids.length} Bids`}
                </Badge>
              }
              bodyClassName="space-y-3"
            >
              {isLoadingBids ? (
                <div className="rounded-xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                  Loading your bids...
                </div>
              ) : myBids.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/80 bg-muted/20 p-8 text-center">
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
                    const isOpen = auc.status === "OPEN";
                    const isRevealPhase = auc.status === "REVEAL";
                    const isClosed = auc.status === "CLOSED";

                    let accent = "border-primary/70";
                    let statusLabel = "Bid placed";
                    if (isRevealPhase) {
                      accent = "border-amber-500/70";
                      statusLabel = "Reveal phase";
                    } else if (isClosed) {
                      accent = "border-slate-400/70";
                      statusLabel = "Closed";
                    }

                    return (
                      <Link
                        key={bid.id}
                        href={`/auction/${auc.id}`}
                        className={`group flex items-center gap-4 rounded-xl border ${accent} bg-card px-4 py-3 transition-colors hover:bg-muted/30`}
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
                          <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
                            {statusLabel}
                          </p>
                          <div className="mt-1 flex items-center gap-2 text-xs">
                            {isRevealed ? (
                              <span className="font-semibold text-foreground">
                                Revealed: {bid.revealedAmount}
                              </span>
                            ) : null}
                            <Badge
                              variant="secondary"
                              className={`px-2 py-0 text-[10px] ${
                                isOpen
                                  ? "text-primary"
                                  : isRevealPhase
                                    ? "text-amber-600"
                                    : "text-muted-foreground"
                              }`}
                            >
                              {auc.status}
                            </Badge>
                          </div>
                        </div>
                        <span className="material-symbols-outlined text-muted-foreground transition-transform group-hover:translate-x-0.5">
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
              bodyClassName="space-y-3"
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
                <div className="rounded-xl border border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                  Loading activity...
                </div>
              ) : recentActivity.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-5 text-sm text-muted-foreground">
                  Your recent activity will appear here once you join auctions.
                </div>
              ) : (
                recentActivity.map((bid) => (
                  <Link
                    key={`${bid.id}-activity`}
                    href={`/auction/${bid.auction.id}`}
                    className="block rounded-xl border border-border/70 bg-card p-3 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-foreground">
                          {bid.auction.title}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {bid.revealedAmount
                            ? `Revealed ${bid.revealedAmount}`
                            : "Commit submitted"}
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="px-2 py-0 text-[10px]"
                      >
                        {bid.auction.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-[11px] font-medium text-muted-foreground">
                      {formatRelativeTime(bid.createdAt)}
                    </p>
                  </Link>
                ))
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
                      className="h-72 animate-pulse rounded-2xl border border-border bg-muted/40"
                    />
                  ))}
                </div>
              ) : activeLiveAuctions.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/80 bg-muted/20 p-10 text-center">
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
                    />
                  ))}
                </div>
              )}
            </PanelCard>
          </div>
        </PageSection>
      </PageContainer>
    </PageShell>
  );
}
