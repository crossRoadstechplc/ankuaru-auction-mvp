"use client";

function statusChipClass(status: string): string {
  switch (status) {
    case "SCHEDULED":
      return "border-sky-200/80 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300";
    case "OPEN":
      return "border-emerald-200/80 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300";
    case "REVEAL":
      return "border-amber-200/80 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300";
    case "CLOSED":
      return "border-slate-200/80 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-300";
    default:
      return "border-slate-200/80 bg-slate-100 text-slate-600 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-400";
  }
}

interface FeedPostBodyProps {
  title: string;
  productName?: string;
  region?: string;
  grade?: string;
  category?: string;
  status: string;
  auctionType: "SELL" | "BUY";
  commodityType?: string;
  commodityClass?: string;
  commoditySize?: string;
  commodityBrand?: string;
  process?: string;
  transaction?: string;
}

export function FeedPostBody({
  title,
  productName,
  region,
  grade,
  category,
  status,
  auctionType,
  commodityType,
  commodityClass,
  commoditySize,
  commodityBrand,
  process,
  transaction,
}: FeedPostBodyProps) {
  const subtitle: string[] = [];
  if (region) subtitle.push(region);
  if (grade) subtitle.push(`Grade ${grade}`);
  const displayTitle = productName
    ? subtitle.length > 0
      ? `${productName} (${subtitle.join(", ")})`
      : productName
    : title;

  const categoryChip = category?.trim() || null;
  const statusLabel = status === "CLOSED" ? "Closed" : status || "";
  const typeLabel = auctionType === "SELL" ? "Sell" : "Buy";

  const regionShownInTitle = !!(productName?.trim() && region?.trim());

  const commodityCluster = [
    commodityType,
    commodityClass,
    commoditySize,
    commodityBrand,
  ]
    .map((v) => v?.trim())
    .filter((v): v is string => !!v)
    .join(" · ");

  const detailParts = [
    !regionShownInTitle && region?.trim() ? region.trim() : null,
    commodityCluster || null,
    process?.trim() || null,
    transaction?.trim() || null,
  ].filter((v): v is string => !!v);

  const chipBase =
    "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide";

  return (
    <div className="space-y-2">
      <h4 className="line-clamp-2 text-lg font-bold leading-snug tracking-tight text-slate-900 dark:text-white md:text-xl">
        {displayTitle}
      </h4>

      <div className="flex flex-wrap items-center gap-1.5">
        {status ? (
          <span className={`${chipBase} ${statusChipClass(status)}`}>{statusLabel}</span>
        ) : null}
        <span
          className={`${chipBase} border-slate-200/90 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-200`}
        >
          {typeLabel}
        </span>
        {categoryChip ? (
          <span
            className={`${chipBase} border-violet-200/85 bg-violet-50 text-violet-900 dark:border-violet-800 dark:bg-violet-950/45 dark:text-violet-200`}
          >
            {categoryChip}
          </span>
        ) : null}
      </div>

      {detailParts.length > 0 ? (
        <p className="text-card-body text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-400">
          {detailParts.join(" · ")}
        </p>
      ) : null}
    </div>
  );
}
