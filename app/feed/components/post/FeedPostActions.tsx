"use client";

import { Button } from "@/components/ui/button";
import { useFavoriteAuctions } from "@/src/shared/favorites/favorite-auctions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface FeedPostActionsProps {
  auctionId: string;
  status: string;
}

/**
 * CTA rules: green = primary actionable (OPEN), orange = reveal/urgent, slate outline = inactive (CLOSED).
 */
export function FeedPostActions({ auctionId, status }: FeedPostActionsProps) {
  const router = useRouter();
  const { isFavoriteAuction, toggleFavoriteAuction } = useFavoriteAuctions();
  const isFavorite = isFavoriteAuction(auctionId);

  const primaryCtaClasses =
    status === "OPEN"
      ? "border-transparent bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500"
      : status === "REVEAL"
        ? "border-transparent bg-orange-600 text-white hover:bg-orange-700 dark:bg-orange-600 dark:hover:bg-orange-500"
        : status === "SCHEDULED"
          ? "border-transparent bg-sky-600 text-white hover:bg-sky-700 dark:bg-sky-600 dark:hover:bg-sky-500"
          : "border-transparent bg-primary text-primary-foreground hover:bg-primary/90";

  const closedCtaClasses =
    "border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-900";

  return (
    <div className="flex items-center justify-between gap-3 border-t border-slate-200/70 px-3 py-2.5 sm:px-4 dark:border-slate-800/80">
      <Button
        variant="ghost"
        size="icon-sm"
        className={cn(
          "h-9 w-9 cursor-pointer rounded-lg transition-colors",
          isFavorite
            ? "text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200",
        )}
        onClick={() => toggleFavoriteAuction(auctionId)}
        title={isFavorite ? "Unsave" : "Save"}
      >
        <span className="material-symbols-outlined text-[20px]">
          {isFavorite ? "favorite" : "favorite_border"}
        </span>
      </Button>
      <Button
        variant={status === "CLOSED" ? "outline" : "default"}
        size="sm"
        className={cn(
          "h-9 gap-1.5 rounded-lg px-4 text-xs font-bold shadow-sm transition active:scale-[0.99]",
          status === "CLOSED" ? closedCtaClasses : primaryCtaClasses,
        )}
        onClick={() => router.push(`/auction/${auctionId}`)}
      >
        <span className="material-symbols-outlined text-base">gavel</span>
        View Auction
      </Button>
    </div>
  );
}
