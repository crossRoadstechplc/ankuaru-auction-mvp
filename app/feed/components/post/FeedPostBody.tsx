import { Badge } from "@/components/ui/badge";

interface FeedPostBodyProps {
  title: string;
  description: string;
  auctionType: "SELL" | "BUY";
  status: string;
  category?: string;
  productName?: string;
  region?: string;
  commodityType?: string;
  grade?: string;
  process?: string;
  transaction?: string;
  commodityBrand?: string;
  commodityClass?: string;
  commoditySize?: string;
}

export function FeedPostBody({
  title,
  description,
  auctionType,
  status,
  category,
  productName,
  region,
  commodityType,
  grade,
  process,
  transaction,
  commodityBrand,
  commodityClass,
  commoditySize,
}: FeedPostBodyProps) {
  const propertySummary = [
    commodityType,
    grade ? `Grade ${grade}` : null,
    process,
    transaction,
    commodityBrand,
    commodityClass,
    commoditySize,
  ].filter((value): value is string => !!value);

  const detailBlocks = [
    {
      label: "Product",
      value: productName || "Unspecified",
    },
    {
      label: "Category",
      value: category || "Unspecified",
    },
    {
      label: "Origin",
      value: region || "Unspecified",
    },
    propertySummary.length > 0
      ? {
          label: "Properties",
          value: propertySummary.join(" / "),
        }
      : null,
  ].filter(
    (
      detail,
    ): detail is {
      label: string;
      value: string;
    } => detail !== null,
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="secondary"
          className="rounded-full border-0 bg-slate-100 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-700 dark:bg-slate-800 dark:text-slate-200"
        >
          {auctionType === "SELL" ? "Sell auction" : "Buy request"}
        </Badge>
        <Badge
          variant="outline"
          className="rounded-full border-slate-200/80 bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
        >
          {status === "CLOSED" ? "Closed / Expired" : status}
        </Badge>
      </div>

      <div className="space-y-2">
        <h4 className="line-clamp-2 text-xl font-black leading-tight tracking-tight text-slate-900 dark:text-white">
          {title}
        </h4>
        <p className="line-clamp-2 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">
          {description}
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,0.9fr)]">
        {detailBlocks.map((detail) => (
          <div
            key={detail.label}
            className={`rounded-[12px] border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/70 ${
              detail.label === "Properties" ? "sm:col-span-2 xl:col-span-2" : ""
            }`}
          >
            <div className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              {detail.label}
            </div>
            <div className="mt-2 text-sm font-semibold leading-6 text-slate-900 dark:text-slate-100">
              {detail.value}
            </div>
          </div>
        ))}
      </div>

      {propertySummary.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {propertySummary.slice(0, 4).map((item) => (
            <Badge
              key={item}
              variant="outline"
              className="rounded-full border-slate-200/80 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:border-slate-800 dark:text-slate-300"
            >
              {item}
            </Badge>
          ))}
          {propertySummary.length > 4 ? (
            <Badge
              variant="outline"
              className="rounded-full border-slate-200/80 px-2.5 py-1 text-[11px] font-medium text-slate-500 dark:border-slate-800 dark:text-slate-400"
            >
              +{propertySummary.length - 4} more
            </Badge>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
