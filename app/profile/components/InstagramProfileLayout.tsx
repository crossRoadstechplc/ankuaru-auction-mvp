"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/src/components/ui/empty-state";
import { LoadingState } from "@/src/components/ui/loading-state";
import type { Auction, User, UserProfileDetails } from "@/lib/types";
import { resolveAuctionDisplayPrice } from "@/lib/format";
import { getImageWithFallback } from "@/lib/imageUtils";
import { cn } from "@/lib/utils";

type ProfileTab = "posts";

interface InstagramProfileLayoutProps {
  profile: User | UserProfileDetails;
  auctions: Auction[];
  isLoadingAuctions?: boolean;
  activeTab: ProfileTab;
  onTabChange: (tab: ProfileTab) => void;
  actions?: ReactNode;
  compact?: boolean;
  followersHref?: string;
  followingHref?: string;
}

function formatCount(value: number) {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1).replace(".0", "")}M`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(1).replace(".0", "")}K`;
  }

  return value.toLocaleString();
}


function formatPrice(value: number): string {
  return `ETB ${value.toLocaleString()}`;
}

function formatJoinDate(value?: string) {
  if (!value) {
    return "Joined recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function resolveAuctionValue(auction: Auction) {
  return Number(
    auction.currentBid ||
      auction.winningBid ||
      auction.reservePrice ||
      auction.minBid ||
      0,
  );
}

export default function InstagramProfileLayout({
  profile,
  auctions,
  isLoadingAuctions = false,
  activeTab,
  onTabChange,
  actions,
  compact = false,
  followersHref,
  followingHref,
}: InstagramProfileLayoutProps) {
  const displayName = profile.fullName || profile.username || "Marketplace User";
  const avatarUrl = profile.avatar || profile.profileImageUrl;
  const followersCount =
    "followersCount" in profile ? profile.followersCount : 0;
  const followingCount =
    "followingCount" in profile ? profile.followingCount : 0;
  const bio = profile.bio?.trim();

  const StatLink = ({
    value,
    label,
    href,
  }: {
    value: number | string;
    label: string;
    href?: string;
  }) => {
    const content = (
      <>
        <strong className="mr-1 font-semibold">{formatCount(Number(value))}</strong>
        {label}
      </>
    );
    if (href) {
      return (
        <Link href={href} className="transition-colors hover:text-primary hover:underline">
          {content}
        </Link>
      );
    }
    return <span>{content}</span>;
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white text-card-foreground shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="relative overflow-hidden border-b border-slate-200/60 dark:border-slate-800">
        <div
          className={cn(
            "relative mx-auto max-w-5xl",
            compact ? "px-4 py-5 sm:px-6" : "px-5 py-7 sm:px-8",
          )}
        >
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="mx-auto sm:mx-0">
                <div className="rounded-full bg-gradient-to-br from-primary via-accent to-coffee p-[3px] shadow-[0_14px_40px_rgba(61,127,93,0.24)]">
                  <div className="rounded-full bg-card p-1">
                    <div
                      className="h-28 w-28 rounded-full bg-muted bg-cover bg-center sm:h-36 sm:w-36"
                      style={{
                        backgroundImage: `url('${getImageWithFallback(avatarUrl)}')`,
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="min-w-0 flex-1 space-y-4 text-center sm:text-left">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex items-center justify-center gap-2 sm:justify-start">
                    <h1 className="truncate text-2xl font-semibold tracking-tight">
                      {profile.username}
                    </h1>
                    <span className="material-symbols-outlined text-[20px] text-sky-400">
                      verified
                    </span>
                  </div>
                  {profile.isPrivate ? (
                    <Badge className="border-none bg-foreground/8 text-foreground dark:bg-white/10 dark:text-white">
                      Private
                    </Badge>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-5 text-sm sm:justify-start sm:text-base">
                  <span>
                    <strong className="mr-1 font-semibold">
                      {formatCount(auctions.length)}
                    </strong>
                    auctions
                  </span>
                  <StatLink
                    value={followersCount}
                    label="followers"
                    href={followersHref}
                  />
                  <StatLink
                    value={followingCount}
                    label="following"
                    href={followingHref}
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-lg font-semibold text-foreground">
                    {displayName}
                  </p>
                  <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                    {bio ||
                      "Sharing active auction listings in a visual, post-first profile layout."}
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground/80 sm:justify-start">
                    <span>{formatJoinDate(profile.createdAt)}</span>
                    <span className="h-1 w-1 rounded-full bg-foreground/30" />
                    <span>
                      {profile.rating ? `${profile.rating.toFixed(1)} rating` : "Trusted seller"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {actions ? <div className="shrink-0">{actions}</div> : null}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-5xl">
        <div className="flex items-center justify-between border-b border-slate-200/60 px-5 py-4 dark:border-slate-800">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Posted Auctions
            <span className="ml-2 font-normal text-slate-500 dark:text-slate-400">
              ({auctions.length} {auctions.length === 1 ? "item" : "items"})
            </span>
          </h2>
          <span className="material-symbols-outlined text-slate-400">grid_on</span>
        </div>

        <div className="p-1.5 sm:p-2">
          {isLoadingAuctions ? (
            <div className="p-4">
              <LoadingState type="card" count={compact ? 3 : 6} />
            </div>
          ) : auctions.length > 0 ? (
            <div
              className={cn(
                "grid grid-cols-3",
                compact ? "gap-1 sm:gap-1.5" : "gap-1.5 sm:gap-2",
              )}
            >
              {auctions.map((auction) => {
                const price = resolveAuctionDisplayPrice(auction);

                return (
                  <Link
                    key={auction.id}
                    href={`/auction/${auction.id}`}
                    className="group relative aspect-square overflow-hidden bg-muted"
                  >
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                      style={{
                        backgroundImage: `url('${getImageWithFallback(auction.image)}')`,
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                    <div className="absolute right-3 top-3">
                      <Badge className="border-none bg-black/55 text-[10px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-sm">
                        {auction.status}
                      </Badge>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 space-y-2 p-3 text-white">
                      <div className="line-clamp-2 text-sm font-semibold sm:text-base">
                        {auction.title}
                      </div>
                      <div className="flex items-center justify-between gap-3 text-[11px] text-white/75 sm:text-xs">
                        <span className="truncate">
                          {auction.auctionCategory || "Auction"}
                        </span>
                        <span className="whitespace-nowrap font-semibold text-white">
                          {formatPrice(price)}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState
              iconName="photo_library"
              title="No Auction Posts Yet"
              description="Auction posts will appear here as an image grid once listings are available."
              className="min-h-[320px] border-none bg-transparent"
            />
          )}
        </div>
      </div>
    </div>
  );
}
