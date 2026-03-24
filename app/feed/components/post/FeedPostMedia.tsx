import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";

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

  return (
    <div className="relative w-full shrink-0 pb-3 md:h-full md:min-h-0 md:w-36 md:shrink-0 md:pb-0 lg:w-[9.5rem]">
      <Dialog>
        <DialogTrigger
          render={
            <button
              type="button"
              title={isClosed ? "Click to view image" : "Click to enlarge photo"}
              className="group relative aspect-square w-full max-w-[11rem] cursor-pointer overflow-hidden rounded-xl border border-slate-200/80 bg-slate-100 text-left shadow-sm ring-offset-background transition-all duration-200 hover:border-primary/35 hover:shadow-md hover:ring-2 hover:ring-primary/20 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900/50 dark:hover:border-primary/40 md:absolute md:inset-0 md:max-w-none md:aspect-auto md:min-h-[12rem]"
            />
          }
        >
          <div
            className={`absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-out group-hover:scale-[1.05] ${
              isClosed ? "grayscale-[0.15] saturate-[0.88]" : ""
            }`}
            style={{ backgroundImage: `url("${imageUrl}")` }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-900/15 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80" />

          <span className="sr-only">
            {isClosed ? "Listing photo, click to view full size" : "Listing photo, click to enlarge"}
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
