"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Auction } from "@/lib/types";
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
}

// Loading skeleton card with shimmering social post style
const LoadingSkeletonCard = () => (
  <Card className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white shadow-[0_24px_80px_-54px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-950">
    {/* Header Skeleton */}
    <div className="flex items-center gap-3 px-4 pb-3 pt-4 md:px-5">
      <div className="h-11 w-11 rounded-xl bg-muted/60 animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-1/3 rounded bg-muted/60 animate-pulse" />
        <div className="h-3 w-1/4 rounded bg-muted/40 animate-pulse" />
      </div>
    </div>

    <div className="grid gap-4 px-4 pb-4 md:grid-cols-[minmax(0,1fr)_188px] md:px-5 md:pb-5">
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="h-6 w-3/5 rounded bg-muted/60 animate-pulse" />
          <div className="space-y-2">
            <div
              className="h-3 w-full rounded bg-muted/40 animate-pulse"
              style={{ animationDelay: "0.1s" }}
            />
            <div
              className="h-3 w-5/6 rounded bg-muted/40 animate-pulse"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
          <div className="flex gap-2">
            <div className="h-6 w-20 rounded-full bg-muted/40 animate-pulse" />
            <div className="h-6 w-24 rounded-full bg-muted/40 animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-20 rounded-lg bg-muted/40 animate-pulse"
            />
          ))}
        </div>
      </div>

      <div className="relative h-52 overflow-hidden rounded-[14px] bg-muted/30">
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-muted/50 to-transparent animate-pulse" />
      </div>
    </div>

    <div className="flex items-center gap-2 border-t border-border/40 px-4 pb-4 pt-4 md:px-5">
      <div className="h-11 flex-1 rounded-xl bg-muted/40 animate-pulse" />
      <div className="hidden h-6 w-px bg-border/50 sm:block" />
      <div className="h-11 flex-[1.4] rounded-xl bg-muted/80 animate-pulse" />
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
}: FeedAuctionGridProps) {
  // Loading state
  if (isLoading && auctions.length === 0) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <LoadingSkeletonCard key={index} />
        ))}
      </div>
    );
  }

  // Error state
  if (error && auctions.length === 0) {
    return (
      <Card className="mx-auto w-full max-w-2xl rounded-[18px] border-destructive/20 bg-destructive/5 p-12 text-center animate-in fade-in duration-500">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <span className="material-symbols-outlined text-6xl text-destructive/60">
              error
            </span>
            <div className="absolute inset-0 bg-destructive/5 rounded-full scale-150 animate-pulse" />
          </div>
          <div className="space-y-3">
            <h3 className="text-xl font-semibold text-foreground">
              Failed to load auctions
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
              {typeof error === "string" ? error : "Failed to load auctions"}
            </p>
            <div className="pt-2">
              <Button
                variant="outline"
                className="border-destructive/30 text-destructive hover:bg-destructive/10"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Empty state
  if (auctions.length === 0) {
    return (
      <Card className="mx-auto w-full max-w-2xl rounded-[18px] border-border/30 p-12 text-center animate-in fade-in duration-500">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <span className="material-symbols-outlined text-6xl text-muted-foreground/30">
              auction
            </span>
            <div className="absolute inset-0 bg-primary/5 rounded-full scale-150 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">
              No posts to show
            </h3>
            <p className="text-muted-foreground/80 max-w-md mx-auto leading-relaxed">
              No auctions match the current search yet. Try another keyword or
              check back for the latest trading activity.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <div className="space-y-4">
        {auctions.map((auction, index) => (
          <div
            key={auction.id}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${index * 45}ms` }}
          >
            <FeedPostCard
              auction={auction}
              getImageWithFallback={getImageWithFallback}
              isFollowingCreator={followingIds.includes(auction.createdBy)}
              isRequestedCreator={requestedIds.includes(auction.createdBy)}
              onOpenCreatorProfile={onOpenCreatorProfile}
              onOpenCreatorProfileImage={onOpenCreatorProfileImage}
            />
          </div>
        ))}
      </div>

      {/* Load More */}
      {hasMore && (
        <div className="flex justify-center pt-8 pb-4 w-full">
          <Button
            variant="outline"
            onClick={onLoadMore}
            disabled={isLoading}
            className="group h-12 rounded-full border-border/60 px-8 shadow-sm hover:border-border hover:bg-muted/50"
          >
            <span className="font-semibold">
              {isLoading ? "Loading..." : "Load more lots"}
            </span>
            <span className="material-symbols-outlined ml-2 group-hover:translate-y-1 transition-transform">
              expand_more
            </span>
          </Button>
        </div>
      )}

      {/* End of Results */}
      {!hasMore && auctions.length > 0 && showEndMessage && (
        <div className="flex justify-center pt-8 pb-4 w-full">
          <div className="flex flex-col items-center gap-2 rounded-full border border-border/40 bg-muted/30 px-6 py-2 text-muted-foreground">
            <span className="text-sm font-medium">
              You&apos;ve reached the end of the current market board.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
