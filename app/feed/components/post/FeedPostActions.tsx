"use client";

import { Button } from "@/components/ui/button";
import { useFavoriteAuctions } from "@/src/shared/favorites/favorite-auctions";
import { useRouter } from "next/navigation";

interface FeedPostActionsProps {
  auctionId: string;
  status: string;
}

function getCtaAccent(status: string): string {
  switch (status) {
    case "OPEN":
      return "bg-emerald-600 hover:bg-emerald-700 text-white border-transparent";
    case "REVEAL":
      return "bg-amber-600 hover:bg-amber-700 text-white border-transparent";
    case "CLOSED":
      return "bg-slate-600 hover:bg-slate-700 text-white border-transparent";
    case "SCHEDULED":
      return "bg-sky-600 hover:bg-sky-700 text-white border-transparent";
    default:
      return "";
  }
}

export function FeedPostActions({ auctionId, status }: FeedPostActionsProps) {
  const router = useRouter();
  const { isFavoriteAuction, toggleFavoriteAuction } = useFavoriteAuctions();
  const isFavorite = isFavoriteAuction(auctionId);

  return (
    <div className="flex items-center justify-between gap-2 border-t border-slate-200/50 px-3 py-2 md:px-3">
      <Button
        variant="ghost"
        size="icon-sm"
        className={`rounded-lg ${
          isFavorite
            ? "text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        }`}
        onClick={() => toggleFavoriteAuction(auctionId)}
        title={isFavorite ? "Unsave" : "Save"}
      >
        <span className="material-symbols-outlined text-[18px]">
          {isFavorite ? "favorite" : "favorite_border"}
        </span>
      </Button>
      <Button
        variant="default"
        size="sm"
        className={`h-7 gap-1 rounded-lg px-2.5 text-card-caption font-semibold ${getCtaAccent(status)}`}
        onClick={() => router.push(`/auction/${auctionId}`)}
      >
        <span className="material-symbols-outlined text-sm">gavel</span>
        View Auction
      </Button>
    </div>
  );
}
