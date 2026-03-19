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
      primary: true,
    },
    {
      label: "Quantity",
      value: quantityDisplay,
      hint: "Lot volume",
      primary: false,
    },
    {
      label: isScheduled ? "Opens" : isClosed ? "Ended" : "Closes",
      value: timingValue,
      hint: timingHint,
      primary: false,
    },
    {
      label: "Auction mode",
      value: isSell ? "Seller listing" : "Buyer request",
      hint: isSell ? "Supply-side auction" : "Demand-side request",
      primary: false,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-[14px] border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="grid gap-px bg-slate-200/70 sm:grid-cols-2 xl:grid-cols-4 dark:bg-slate-800/80">
          {metricCards.map((metric) => (
            <div
              key={metric.label}
              title={metric.hint}
              className="bg-slate-50/90 p-3.5 text-slate-900 dark:bg-slate-900/90 dark:text-slate-100 cursor-help"
            >
              <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                {metric.label}
              </div>
              <div
                className={`mt-2 leading-tight ${
                  metric.primary
                    ? "text-xl font-black text-primary"
                    : "text-base font-semibold"
                }`}
              >
                {metric.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
