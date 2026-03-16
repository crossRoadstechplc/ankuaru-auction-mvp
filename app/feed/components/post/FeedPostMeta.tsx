import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNowStrict } from "date-fns";

interface FeedPostMetaProps {
  auctionType: "SELL" | "BUY";
  status: string;
  minBid: string;
  reservePrice?: string;
  quantity?: string;
  quantityUnit?: string;
  startAt: string;
  endAt: string;
}

function formatNumericValue(value?: string): string | null {
  if (!value) {
    return null;
  }

  const parsed = Number(value.replace(/,/g, "").trim());
  if (!Number.isFinite(parsed)) {
    return value;
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: parsed % 1 === 0 ? 0 : 2,
  }).format(parsed);
}

function getStatusBadgeClasses(status: string): string {
  switch (status) {
    case "SCHEDULED":
      return "bg-sky-50 text-sky-700 dark:bg-sky-950/30 dark:text-sky-300";
    case "OPEN":
      return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300";
    case "REVEAL":
      return "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300";
    case "CLOSED":
      return "bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300";
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300";
  }
}

function getStatusLabel(status: string): string {
  if (status === "CLOSED") {
    return "Closed / Expired";
  }

  return status.charAt(0) + status.slice(1).toLowerCase();
}

export function FeedPostMeta({
  auctionType,
  status,
  minBid,
  reservePrice,
  quantity,
  quantityUnit,
  startAt,
  endAt,
}: FeedPostMetaProps) {
  const isSell = auctionType === "SELL";
  const quantityDisplay = quantity
    ? `${formatNumericValue(quantity) || quantity}${quantityUnit ? ` ${quantityUnit}` : ""}`
    : "Unspecified";
  const minBidDisplay = formatNumericValue(minBid) || minBid;
  const reservePriceDisplay = reservePrice
    ? formatNumericValue(reservePrice) || reservePrice
    : null;
  const isClosed = status === "CLOSED";
  const isScheduled = status === "SCHEDULED";

  const timingValue = isClosed
    ? "Ended"
    : isScheduled
      ? formatDistanceToNowStrict(new Date(startAt), { addSuffix: true })
      : formatDistanceToNowStrict(new Date(endAt), { addSuffix: true });
  const timingHint = isClosed
    ? `Closed ${format(new Date(endAt), "MMM d, h:mm a")}`
    : isScheduled
      ? `Starts ${format(new Date(startAt), "MMM d, h:mm a")}`
      : `Ends ${format(new Date(endAt), "MMM d, h:mm a")}`;

  const metricCards = [
    {
      label: "Opening bid",
      value: `ETB ${minBidDisplay}`,
      hint: reservePriceDisplay
        ? `Reserve ETB ${reservePriceDisplay}`
        : "Reserve not set",
    },
    {
      label: "Quantity",
      value: quantityDisplay,
      hint: "Lot volume",
    },
    {
      label: isScheduled ? "Opens" : isClosed ? "Ended" : "Closes",
      value: timingValue,
      hint: timingHint,
    },
    {
      label: "Auction mode",
      value: isSell ? "Seller listing" : "Buyer request",
      hint: isSell ? "Supply-side auction" : "Demand-side request",
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="outline"
          className={`rounded-full border-0 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${
            isSell
              ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
          }`}
        >
          {isSell ? "Sell auction" : "Buy request"}
        </Badge>
        <Badge
          variant="outline"
          className={`rounded-full border-0 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${getStatusBadgeClasses(
            status,
          )}`}
        >
          {getStatusLabel(status)}
        </Badge>
      </div>

      <div className="overflow-hidden rounded-[14px] border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="grid gap-px bg-slate-200/70 sm:grid-cols-2 xl:grid-cols-4 dark:bg-slate-800/80">
          {metricCards.map((metric) => (
            <div
              key={metric.label}
              className="bg-slate-50/90 p-3 text-slate-900 dark:bg-slate-900/90 dark:text-slate-100"
            >
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                {metric.label}
              </div>
              <div className="mt-2 text-base font-black leading-tight">
                {metric.value}
              </div>
              <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {metric.hint}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
