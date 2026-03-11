import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface FeedPostMetaProps {
  auctionType: "SELL" | "BUY";
  status: string;
  minBid: string;
  reservePrice?: string;
  endAt: string;
  startAt: string;
}

export function FeedPostMeta({
  auctionType,
  status,
  minBid,
  reservePrice,
  endAt,
  startAt,
}: FeedPostMetaProps) {
  const isSell = auctionType === "SELL";

  // Calculate time remaining
  const getTimeRemaining = () => {
    const now = new Date();
    const endTime = new Date(endAt);
    const diff = endTime.getTime() - now.getTime();

    if (diff <= 0) return "Ended";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  const statusColor =
    status === "OPEN"
      ? "text-emerald-500"
      : status === "CLOSED"
      ? "text-muted-foreground"
      : "text-amber-500";

  return (
    <div className="px-4 pb-4">
      <div className="grid grid-cols-2 gap-px bg-border/40 rounded-xl overflow-hidden shadow-sm ring-1 ring-border/50">
        {/* Left column: Price Info */}
        <div className="bg-card dark:bg-muted/10 p-3 flex flex-col justify-center space-y-1">
          <div className="flex items-center justify-between font-medium">
             <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
              Current Bid
            </span>
             <Badge
              variant="outline"
              className={`text-[10px] font-bold px-1.5 py-0 h-4 border-0 rounded ${
                isSell
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400"
                  : "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400"
              }`}
            >
              {isSell ? "SELL" : "BUY"}
            </Badge>
          </div>
          <p className="text-lg font-bold text-foreground truncate">
            ETB {minBid}
          </p>
          {reservePrice && (
            <p className="text-xs text-muted-foreground/80 font-medium">
              Reserve: {reservePrice}
            </p>
          )}
        </div>

        {/* Right column: Time/Status Info */}
        <div className="bg-card dark:bg-muted/10 p-3 flex flex-col justify-center space-y-1">
          <div className="flex items-center justify-between font-medium">
            <span className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
              Status
            </span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0 rounded flex items-center gap-1 bg-muted/50`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusColor === 'text-emerald-500' ? 'bg-emerald-500' : statusColor === 'text-muted-foreground' ? 'bg-muted-foreground' : 'bg-amber-500'} animate-pulse`} />
              {status}
            </span>
          </div>
          <p className="text-sm font-semibold text-foreground truncate mt-1">
            {getTimeRemaining()}
          </p>
          <p className="text-[10px] text-muted-foreground/80 font-medium truncate">
            Ends: {format(new Date(endAt), "MMM d, h:mm a")}
          </p>
        </div>
      </div>
    </div>
  );
}
