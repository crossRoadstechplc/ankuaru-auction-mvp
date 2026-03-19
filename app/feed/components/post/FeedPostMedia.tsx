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

export function FeedPostMedia({
  image,
  getImageWithFallback,
  status,
  auctionType,
}: FeedPostMediaProps) {
  const imageUrl = getImageWithFallback
    ? getImageWithFallback(image)
    : image || "/placeholder.svg";
  const statusTone = getStatusTone(status);
  const isClosed = status === "CLOSED";

  return (
    <div className="md:pt-1">
      <Dialog>
        <DialogTrigger
          render={
            <button className="group relative block h-48 w-full overflow-hidden rounded-[12px] border border-slate-200/80 bg-slate-100 text-left ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-900 md:h-full md:min-h-[214px]" />
          }
        >
          <div
            className={`absolute inset-0 bg-cover bg-center ${
              isClosed ? "grayscale-[0.18] saturate-[0.82]" : ""
            }`}
            style={{
              backgroundImage: `url("${imageUrl}")`,
            }}
          />

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(15,23,42,0.08)_0%,rgba(15,23,42,0.02)_36%,rgba(15,23,42,0.7)_100%)]" />

          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] backdrop-blur-sm ${statusTone}`}
            >
              {status === "CLOSED" ? "Closed / Expired" : status}
            </span>
            <span className="rounded-full bg-black/55 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white backdrop-blur-sm">
              {auctionType === "SELL" ? "Sell Lot" : "Buy Request"}
            </span>
          </div>

          <div className="absolute bottom-3 right-3">
            <div className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md">
              <span className="material-symbols-outlined text-sm">
                zoom_in
              </span>
              <span className="whitespace-nowrap">
                {isClosed ? "Inspect" : "Expand"}
              </span>
            </div>
          </div>

          <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_38%)]" />
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
