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
  onLoadMore?: () => void;
  hasMore?: boolean;
}

// Loading skeleton card with shimmering social post style
const LoadingSkeletonCard = () => (
  <Card className="flex flex-col bg-card border border-border/50 shadow-sm rounded-2xl overflow-hidden md:mb-6 max-w-full">
    {/* Header Skeleton */}
    <div className="flex items-center gap-3 p-4 pb-2">
      <div className="w-12 h-12 rounded-lg bg-muted/60 animate-pulse" />
      <div className="flex-1 space-y-2">
         <div className="h-4 bg-muted/60 rounded w-1/3 animate-pulse" />
         <div className="h-3 bg-muted/40 rounded w-1/4 animate-pulse" />
      </div>
    </div>
    
    {/* Body Skeleton */}
    <div className="p-4 pt-2 space-y-3">
       <div className="h-6 bg-muted/60 rounded w-3/4 animate-pulse" />
       <div className="space-y-2">
         <div className="h-3 bg-muted/40 rounded w-full animate-pulse" style={{ animationDelay: "0.1s" }} />
         <div className="h-3 bg-muted/40 rounded w-5/6 animate-pulse" style={{ animationDelay: "0.2s" }} />
       </div>
    </div>

    {/* Media Skeleton */}
    <div className="px-4 pb-4">
      <div className="relative h-28 md:h-36 bg-muted/30 overflow-hidden rounded-xl">
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-muted/50 to-transparent animate-pulse" />
      </div>
    </div>

    {/* Meta Skeleton */}
    <div className="px-4 pb-4">
      <div className="h-20 bg-muted/40 rounded-xl animate-pulse" />
    </div>
    
    {/* Actions Skeleton */}
    <div className="flex items-center gap-2 px-4 pb-4 pt-1 border-t border-border/40 mt-1">
      <div className="flex-1 h-10 bg-muted/40 rounded-xl animate-pulse" />
      <div className="w-px h-6 bg-border/50 hidden sm:block" />
      <div className="flex-[2] h-10 bg-muted/80 rounded-xl animate-pulse" />
    </div>
  </Card>
);

export function FeedAuctionGrid({
  auctions,
  isLoading,
  error,
  getImageWithFallback,
  onLoadMore,
  hasMore,
}: FeedAuctionGridProps) {
  // Loading state
  if (isLoading && auctions.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full md:space-y-0 space-y-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <LoadingSkeletonCard key={index} />
        ))}
      </div>
    );
  }

  // Error state
  if (error && auctions.length === 0) {
    return (
      <Card className="p-12 text-center border-destructive/20 bg-destructive/5 rounded-2xl animate-in fade-in duration-500 w-full max-w-2xl mx-auto">
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
      <Card className="p-12 text-center border-border/30 rounded-2xl animate-in fade-in duration-500 w-full max-w-2xl mx-auto">
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
              It looks quiet here. Try adjusting your filters or check back later for new updates from traders.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="w-full">
      {/* Social Post List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {auctions.map((auction, index) => (
          <div
            key={auction.id}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <FeedPostCard
              auction={auction}
              getImageWithFallback={getImageWithFallback}
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
            className="group rounded-full px-8 h-12 shadow-sm border-border/60 hover:border-border hover:bg-muted/50"
          >
            <span className="font-semibold">{isLoading ? "Loading..." : "Show more posts"}</span>
            <span className="material-symbols-outlined ml-2 group-hover:translate-y-1 transition-transform">
              expand_more
            </span>
          </Button>
        </div>
      )}

      {/* End of Results */}
      {!hasMore && auctions.length > 0 && (
        <div className="flex justify-center pt-8 pb-4 w-full">
          <div className="flex flex-col items-center gap-2 text-muted-foreground bg-muted/30 px-6 py-2 rounded-full border border-border/40">
            <span className="text-sm font-medium">You&apos;re caught up on recent posts.</span>
          </div>
        </div>
      )}
    </div>
  );
}
