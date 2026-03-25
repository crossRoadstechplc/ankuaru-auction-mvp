"use client";

function statusChipClass(status: string): string {
  switch (status) {
    case "SCHEDULED":
      return "rounded-full border border-sky-200/90 bg-sky-50 px-2.5 py-0.5 text-sky-900 dark:border-sky-800 dark:bg-sky-950/45 dark:text-sky-200";
    case "OPEN":
      return "rounded-full border border-emerald-200/90 bg-emerald-50 px-2.5 py-0.5 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200";
    case "REVEAL":
      return "rounded-full border border-amber-200/90 bg-amber-50 px-2.5 py-0.5 text-amber-950 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200";
    case "CLOSED":
      return "rounded-full border border-slate-200/90 bg-slate-100 px-2.5 py-0.5 text-slate-700 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-300";
    default:
      return "rounded-full border border-slate-200/90 bg-slate-50 px-2.5 py-0.5 text-slate-600 dark:border-slate-600 dark:bg-slate-800/60 dark:text-slate-400";
  }
}

/** Business type: Sell / Buy */
const typeChipClass =
  "rounded-md border border-slate-300/90 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-700 shadow-[0_1px_0_rgba(15,23,42,0.04)] dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200";

/** Auction mechanism from lot type */
function lotChipClass(lot: "FLEXIBLE" | "SEALED"): string {
  return lot === "FLEXIBLE"
    ? "rounded-md border-2 border-emerald-500/55 bg-emerald-50/90 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-emerald-900 dark:border-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-200"
    : "rounded-md border-2 border-slate-400/70 bg-slate-100/90 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-slate-800 dark:border-slate-500 dark:bg-slate-800/90 dark:text-slate-100";
}

const categoryChipClass =
  "rounded-md border border-violet-200/85 bg-violet-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-violet-900 dark:border-violet-800 dark:bg-violet-950/45 dark:text-violet-200";

interface FeedPostBodyProps {
  title: string;
  productName?: string;
  region?: string;
  grade?: string;
  category?: string;
  status: string;
  auctionType: "SELL" | "BUY";
  lotType?: "FLEXIBLE" | "SEALED";
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
  lotType,
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

  return (
    <div className="space-y-2.5">
      <h4 className="line-clamp-3 text-xl font-extrabold leading-snug tracking-tight text-slate-900 dark:text-white md:text-2xl md:leading-tight">
        {displayTitle}
      </h4>

      {/* Status (state) · Type (business) · Lot · Category — spaced consistently */}
      <div
        className="flex flex-wrap items-center gap-2"
        aria-label={`Auction ${statusLabel}, ${typeLabel}${lotType ? `, ${lotType}` : ""}${categoryChip ? `, ${categoryChip}` : ""}`}
      >
        {status ? (
          <span
            className={`inline-flex items-center text-[10px] font-bold uppercase tracking-wide ${statusChipClass(status)}`}
          >
            {statusLabel}
          </span>
        ) : null}
        <span className={`inline-flex items-center ${typeChipClass}`}>
          {typeLabel}
        </span>
        {lotType ? (
          <span className={`inline-flex items-center ${lotChipClass(lotType)}`}>
            {lotType === "FLEXIBLE" ? "Flexible" : "Sealed"}
          </span>
        ) : null}
        {categoryChip ? (
          <span className={`inline-flex items-center ${categoryChipClass}`}>
            {categoryChip}
          </span>
        ) : null}
      </div>

      {detailParts.length > 0 ? (
        <p className="text-xs font-medium leading-relaxed text-slate-600 dark:text-slate-400">
          {detailParts.join(" · ")}
        </p>
      ) : null}
    </div>
  );
}
