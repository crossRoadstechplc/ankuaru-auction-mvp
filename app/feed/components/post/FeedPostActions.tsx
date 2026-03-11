import { Button } from "@/components/ui/button";

interface FeedPostActionsProps {
  auctionId: string;
}

export function FeedPostActions({ auctionId }: FeedPostActionsProps) {
  return (
    <div className="flex items-center gap-2 px-4 pb-4 pt-1 border-t border-border/40 mt-1">
      <Button
        variant="ghost"
        size="sm"
        className="flex-1 gap-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors h-10"
      >
        <span className="material-symbols-outlined text-[20px]">
          favorite_border
        </span>
        <span className="font-medium text-sm">Watch</span>
      </Button>
      <div className="w-px h-6 bg-border/50 hidden sm:block" />
      <Button
        variant="default"
        size="sm"
        className="flex-[2] gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all shadow-sm h-10 font-semibold"
        onClick={() => (window.location.href = `/auction/${auctionId}`)}
      >
        <span className="material-symbols-outlined text-[18px]">gavel</span>
        Place Bid
      </Button>
    </div>
  );
}
