"use client";

import { Button } from "@/components/ui/button";
import { useFavoriteAuctions } from "@/src/shared/favorites/favorite-auctions";
import { useRouter } from "next/navigation";

interface FeedPostActionsProps {
  auctionId: string;
  status: string;
}

export function FeedPostActions({ auctionId, status }: FeedPostActionsProps) {
  const router = useRouter();
  const { isFavoriteAuction, toggleFavoriteAuction } = useFavoriteAuctions();
  const isFavorite = isFavoriteAuction(auctionId);
  const primaryLabel =
    status === "OPEN"
      ? "Open Auction"
      : status === "SCHEDULED"
        ? "Review Lot"
        : status === "REVEAL"
          ? "View Reveal"
          : "See Results";

  return (
    <div className="mt-1 flex items-center gap-2 border-t border-border/40 px-4 pb-4 pt-4 md:px-5">
      <Button
        variant="ghost"
        size="sm"
        className={`h-11 flex-1 gap-2 rounded-xl transition-all duration-200 ease-out active:scale-[0.98] ${
          isFavorite
            ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20"
            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
        }`}
        onClick={() => toggleFavoriteAuction(auctionId)}
      >
        <span className="material-symbols-outlined text-[20px] transition-transform duration-200 group-hover/button:scale-110">
          {isFavorite ? "favorite" : "favorite_border"}
        </span>
        <span className="font-medium text-sm">
          {isFavorite ? "Saved" : "Save Lot"}
        </span>
      </Button>
      <div className="w-px h-6 bg-border/50 hidden sm:block" />
      <Button
        variant="default"
        size="sm"
        className="h-11 flex-[1.4] gap-2 rounded-xl bg-primary text-primary-foreground font-semibold shadow-sm transition-all duration-200 ease-out hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
        onClick={() => router.push(`/auction/${auctionId}`)}
      >
        <span className="material-symbols-outlined text-[18px]">
          {status === "CLOSED" ? "inventory" : "gavel"}
        </span>
        {primaryLabel}
      </Button>
    </div>
  );
}
