"use client";

import { Flame, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Auction } from "@/lib/types";
import { cn } from "@/lib/utils";
import { FeedPostCard } from "./post/FeedPostCard";

interface FeedAuctionGridProps {
  auctions: Auction[];
  isLoading?: boolean;
  error?: string | null;
  getImageWithFallback?: (image?: string) => string;
  followingIds?: string[];
  requestedIds?: string[];
  onOpenCreatorProfile?: (userId: string) => void;
  onOpenCreatorProfileImage?: (payload: {
    imageUrl?: string | null;
    displayName: string;
    username?: string | null;
  }) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  showEndMessage?: boolean;
  /** Total matching auctions (for “Showing X of Y”) */
  totalMatchingCount?: number;
}

function isEndingSoon(a: Auction): boolean {
  if (a.status !== "OPEN") return false;
  const hours =
    (new Date(a.endAt).getTime() - Date.now()) / (1000 * 60 * 60);
  return hours > 0 && hours < 24;
}

function isListingNew(a: Auction): boolean {
  if (!a.createdAt) return false;
  const hours =
    (Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60);
  return hours >= 0 && hours < 24;
}

type Section = {
  key: string;
  title: string;
  subtitle?: string;
  icon?: "flame" | "sparkles";
  items: Auction[];
};

function buildSections(auctions: Auction[]): Section[] {
  const used = new Set<string>();
  const ending = auctions.filter((a) => {
    if (!isEndingSoon(a)) return false;
    used.add(a.id);
    return true;
  });
  const fresh = auctions.filter((a) => {
    if (used.has(a.id) || !isListingNew(a)) return false;
    used.add(a.id);
    return true;
  });
  const rest = auctions.filter((a) => !used.has(a.id));

  const sections: Section[] = [];
  if (ending.length) {
    sections.push({
      key: "ending",
      title: "Ending soon",
      subtitle: "Open lots closing within 24 hours",
      icon: "flame",
      items: ending,
    });
  }
  if (fresh.length) {
    sections.push({
      key: "new",
      title: "New listings",
      subtitle: "Posted in the last 24 hours",
      icon: "sparkles",
      items: fresh,
    });
  }
  if (rest.length) {
    sections.push({
      key: "more",
      title: sections.length > 0 ? "More auctions" : "",
      items: rest,
    });
  }
  return sections;
}

const LoadingSkeletonCard = () => (
  <Card className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950">
    <div className="flex items-center gap-3 px-4 pb-3 pt-4 md:px-5">
      <div className="h-14 w-14 animate-pulse rounded-full bg-muted/60" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 animate-pulse rounded bg-muted/60" />
        <div className="h-3 w-1/4 animate-pulse rounded bg-muted/40" />
      </div>
    </div>
    <div className="grid gap-4 px-4 pb-4 md:grid-cols-[7rem_minmax(0,1fr)] md:px-5 md:pb-5">
      <div className="aspect-square animate-pulse rounded-xl bg-muted/40 md:min-h-[8.5rem]" />
      <div className="space-y-3">
        <div className="h-7 w-4/5 animate-pulse rounded bg-muted/60" />
        <div className="flex gap-2">
          <div className="h-6 w-16 animate-pulse rounded-full bg-muted/40" />
          <div className="h-6 w-14 animate-pulse rounded-full bg-muted/40" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="h-12 animate-pulse rounded-lg bg-muted/30" />
          <div className="h-12 animate-pulse rounded-lg bg-muted/30" />
          <div className="h-12 animate-pulse rounded-lg bg-muted/30" />
        </div>
      </div>
    </div>
    <div className="flex border-t border-border/40 px-4 py-3 md:px-5">
      <div className="ml-auto h-9 w-36 animate-pulse rounded-lg bg-muted/50" />
    </div>
  </Card>
);

export function FeedAuctionGrid({
  auctions,
  isLoading,
  error,
  getImageWithFallback,
  followingIds = [],
  requestedIds = [],
  onOpenCreatorProfile,
  onOpenCreatorProfileImage,
  onLoadMore,
  hasMore,
  showEndMessage = true,
  totalMatchingCount,
}: FeedAuctionGridProps) {
  if (isLoading && auctions.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <LoadingSkeletonCard key={index} />
        ))}
      </div>
    );
  }

  if (error && auctions.length === 0) {
    return (
      <Card className="mx-auto w-full max-w-2xl animate-in rounded-[18px] border-destructive/20 bg-destructive/5 p-12 text-center duration-500 fade-in">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-6xl text-destructive/60">
            error
          </span>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground">
              Failed to load auctions
            </h3>
            <p className="mx-auto max-w-md leading-relaxed text-muted-foreground">
              {typeof error === "string" ? error : "Failed to load auctions"}
            </p>
            <Button
              variant="outline"
              className="mt-2 border-destructive/30 text-destructive hover:bg-destructive/10"
            >
              Try Again
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  if (auctions.length === 0) {
    return (
      <Card className="mx-auto w-full max-w-2xl animate-in rounded-[18px] border-border/30 p-12 text-center duration-500 fade-in">
        <div className="flex flex-col items-center gap-4">
          <span className="material-symbols-outlined text-6xl text-muted-foreground/30">
            auction
          </span>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">No posts to show</h3>
            <p className="mx-auto max-w-md leading-relaxed text-muted-foreground/80">
              No auctions match the current search yet. Try another keyword or
              check back for the latest trading activity.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const sections = buildSections(auctions);
  const total =
    totalMatchingCount !== undefined ? totalMatchingCount : auctions.length;
  const showing = auctions.length;

  return (
    <div className="w-full">
      <div className="flex flex-col gap-8">
        {sections.map((section) => (
          <section key={section.key} className="flex flex-col gap-4">
            {section.title ? (
              <div className="border-b border-slate-200/80 pb-2 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  {section.icon === "flame" ? (
                    <Flame
                      className="size-4 text-orange-600 dark:text-orange-400"
                      aria-hidden
                    />
                  ) : section.icon === "sparkles" ? (
                    <Sparkles
                      className="size-4 text-sky-600 dark:text-sky-400"
                      aria-hidden
                    />
                  ) : null}
                  <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-600 dark:text-slate-400">
                    {section.title}
                  </h2>
                </div>
                {section.subtitle ? (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {section.subtitle}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div
              className={cn("flex flex-col gap-4", !section.title && "gap-4")}
            >
              {section.items.map((auction, index) => (
                <div
                  key={auction.id}
                  className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                  style={{ animationDelay: `${index * 40}ms` }}
                >
                  <FeedPostCard
                    auction={auction}
                    getImageWithFallback={getImageWithFallback}
                    isFollowingCreator={followingIds.includes(
                      auction.createdBy,
                    )}
                    isRequestedCreator={requestedIds.includes(
                      auction.createdBy,
                    )}
                    onOpenCreatorProfile={onOpenCreatorProfile}
                    onOpenCreatorProfileImage={onOpenCreatorProfileImage}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {hasMore && onLoadMore ? (
        <div className="flex w-full flex-col items-center gap-3 pt-10 pb-4">
          <p className="text-center text-sm tabular-nums text-muted-foreground">
            Showing{" "}
            <span className="font-semibold text-foreground">{showing}</span> of{" "}
            <span className="font-semibold text-foreground">{total}</span>{" "}
            {total === 1 ? "auction" : "auctions"}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoading}
            className="h-11 min-w-[min(100%,280px)] rounded-xl border-slate-300 px-8 text-sm font-bold shadow-sm transition hover:bg-slate-50 dark:border-slate-600 dark:hover:bg-slate-900"
          >
            {isLoading ? (
              "Loading…"
            ) : (
              <>
                Load more auctions
                <span className="material-symbols-outlined ml-2 align-middle text-lg">
                  expand_more
                </span>
              </>
            )}
          </Button>
        </div>
      ) : null}

      {!hasMore && auctions.length > 0 && showEndMessage ? (
        <div className="flex justify-center pt-8 pb-4 w-full">
          <div className="rounded-xl border border-slate-200/70 bg-slate-50/90 px-5 py-2.5 text-center text-xs font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400">
            You&apos;re caught up — end of the market board.
          </div>
        </div>
      ) : null}
    </div>
  );
}
