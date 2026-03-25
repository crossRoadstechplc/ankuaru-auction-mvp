import { ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface FeedPostMediaProps {
  image?: string;
  getImageWithFallback?: (image?: string) => string;
  isClosed: boolean;
}

export function FeedPostMedia({
  image,
  getImageWithFallback,
  isClosed,
}: FeedPostMediaProps) {
  const imageUrl = getImageWithFallback
    ? getImageWithFallback(image)
    : image || "/placeholder.svg";

  const trimmed = image?.trim() ?? "";
  const isPlaceholder =
    !trimmed ||
    imageUrl.includes("placeholder") ||
    imageUrl.endsWith("placeholder.svg");

  const frameClass = cn(
    "group relative aspect-square w-full max-w-[9rem] overflow-hidden rounded-xl border text-left ring-offset-background transition-all duration-200",
    "md:absolute md:inset-0 md:max-w-none md:aspect-auto md:min-h-[8.5rem] lg:min-h-[9rem]",
    isPlaceholder
      ? "border-dashed border-slate-300/90 bg-slate-50 dark:border-slate-600 dark:bg-slate-900/60"
      : "cursor-pointer border-slate-200/80 bg-slate-100 shadow-sm dark:border-slate-700 dark:bg-slate-900/50",
    !isPlaceholder &&
      "hover:border-primary/40 hover:shadow-md hover:ring-2 hover:ring-primary/15 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2",
  );

  if (isPlaceholder) {
    return (
      <div
        className={cn(
          "relative w-full shrink-0 pb-2 md:h-full md:min-h-0 md:w-[7.25rem] md:shrink-0 md:pb-0 lg:w-32",
        )}
      >
        <div className={frameClass}>
          <div className="flex h-full min-h-[7rem] w-full flex-col items-center justify-center gap-1.5 px-2 text-center md:min-h-0">
            <ImageIcon
              className="size-8 text-slate-400 dark:text-slate-500"
              strokeWidth={1.5}
              aria-hidden
            />
            <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              No image
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative w-full shrink-0 pb-2 md:h-full md:min-h-0 md:w-[7.25rem] md:shrink-0 md:pb-0 lg:w-32",
      )}
    >
      <Dialog>
        <DialogTrigger
          render={
            <button
              type="button"
              title={
                isClosed ? "Click to view image" : "Click to enlarge photo"
              }
              className={frameClass}
            />
          }
        >
          <div
            className={cn(
              "absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-out group-hover:scale-[1.06]",
              isClosed ? "grayscale-[0.15] saturate-[0.88]" : "",
            )}
            style={{ backgroundImage: `url("${imageUrl}")` }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/15 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80" />
          <span className="sr-only">
            {isClosed
              ? "Listing photo, click to view full size"
              : "Listing photo, click to enlarge"}
          </span>
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
