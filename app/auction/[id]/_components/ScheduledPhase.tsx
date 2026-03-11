import { Card } from "@/components/ui/card";
import { Auction } from "../../../../lib/types";

interface ScheduledPhaseProps {
  auction: Auction;
}

export function ScheduledPhase({ auction }: ScheduledPhaseProps) {
  return (
    <div className="text-center py-4">
      <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="material-symbols-outlined text-blue-500 text-3xl">
          schedule
        </span>
      </div>
      <h3 className="text-xl font-bold mb-2">Auction Scheduled</h3>
      <p className="text-sm text-muted-foreground mb-6 font-medium">
        This auction has not started yet. Bidding will be available when the
        auction begins.
      </p>
      <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800">
        <p className="text-[10px] text-blue-600 dark:text-blue-300 font-bold uppercase mb-1">
          Starting Bid
        </p>
        <p className="text-2xl font-black text-blue-900 dark:text-white">
          {auction.minBid}
        </p>
      </Card>
      <div className="mt-4 text-sm text-muted-foreground">
        <p>Auction starts: {new Date(auction.startAt).toLocaleString()}</p>
      </div>
    </div>
  );
}
