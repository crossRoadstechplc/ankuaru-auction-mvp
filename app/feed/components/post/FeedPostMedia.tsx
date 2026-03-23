import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";

interface FeedPostMediaProps {
  image?: string;
  getImageWithFallback?: (image?: string) => string;
  status: string;
  auctionType: "SELL" | "BUY";
}

function getStatusTone(status: string): string {
  switch (status) {
    case "SCHEDULED":
      return "bg-sky-100/90 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300";
    case "OPEN":
      return "bg-emerald-100/90 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300";
    case "REVEAL":
      return "bg-amber-100/90 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300";
    case "CLOSED":
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
    default:
      return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
  }
}

export function FeedPostMedia({
  image,
  getImageWithFallback,
  status,
  auctionType,
}: FeedPostMediaProps) {
  const imageUrl = getImageWithFallback
    ? getImageWithFallback(image)
    : image || "/placeholder.svg";
  const isClosed = status === "CLOSED";
  const statusLabel = status === "CLOSED" ? "Closed" : status || "";
  const typeLabel = auctionType === "SELL" ? "Sell" : "Buy";

  return (
    <div className="flex flex-col items-end gap-1.5 self-stretch">
      <div className="flex shrink-0 flex-wrap justify-end gap-1">
        {status ? (
          <span
            className={`rounded px-1.5 py-0.5 text-card-meta font-bold uppercase tracking-wider ${getStatusTone(status)}`}
          >
            {statusLabel}
          </span>
        ) : null}
        {auctionType ? (
          <span className="rounded bg-slate-200/80 px-1.5 py-0.5 text-card-meta font-bold uppercase tracking-wider text-slate-600 dark:bg-slate-700 dark:text-slate-300">
            {typeLabel}
          </span>
        ) : null}
      </div>

      <Dialog>
        <DialogTrigger
          render={
            <button className="relative block min-h-[80px] w-full flex-1 overflow-hidden rounded-lg border border-slate-200/50 bg-slate-100/80 text-left ring-offset-background transition-opacity hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900/60 md:min-h-[100px] md:w-[88px]" />
          }
        >
          <div
            className={`absolute inset-0 bg-cover bg-center ${
              isClosed ? "grayscale-[0.18] saturate-[0.82]" : ""
            }`}
            style={{ backgroundImage: `url("${imageUrl}")` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
          <div className="absolute bottom-1 right-1">
            <span className="flex items-center gap-0.5 rounded bg-black/60 px-1 py-0.5 text-[8px] font-medium text-white">
              <span className="material-symbols-outlined text-[9px]">zoom_in</span>
              {isClosed ? "Inspect" : "Expand"}
            </span>
          </div>
        </DialogTrigger>

        <DialogContent className="flex h-[85vh] w-[95vw] max-w-4xl items-center justify-center overflow-hidden rounded-xl border-border/20 bg-black/95 p-0">
          <DialogTitle className="sr-only">Product Image</DialogTitle>
          <div className="relative flex h-full w-full items-center justify-center p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Auction item"
              className="max-h-full max-w-full rounded-lg object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
