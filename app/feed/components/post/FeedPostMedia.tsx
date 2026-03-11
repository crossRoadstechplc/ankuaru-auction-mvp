import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";

interface FeedPostMediaProps {
  image?: string;
  getImageWithFallback?: (image?: string) => string;
}

export function FeedPostMedia({
  image,
  getImageWithFallback,
}: FeedPostMediaProps) {
  const imageUrl = getImageWithFallback
    ? getImageWithFallback(image)
    : image || "/placeholder.svg";

  return (
    <div className="px-4 pb-4">
      <Dialog>
        <DialogTrigger
          render={
            <button className="relative block h-28 md:h-36 w-full text-left overflow-hidden rounded-xl bg-gray-50/50 dark:bg-muted/10 border border-border/40 group cursor-pointer ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2" />
          }
        >
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
            style={{
              backgroundImage: `url("${imageUrl}")`,
            }}
          />

          {/* Optional Image Navigation Indicator for galleries later */}
          <div className="absolute bottom-3 right-3 shadow-md flex items-center gap-2 bg-black/60 backdrop-blur-md rounded-full px-2.5 py-1 transition-opacity opacity-0 group-hover:opacity-100 duration-300">
            <span className="material-symbols-outlined text-white/90 text-[10px] hover:text-white transition-colors">
              zoom_in
            </span>
            <span className="text-white/90 text-[10px] font-medium tracking-wide">
              View
            </span>
          </div>
        </DialogTrigger>

        <DialogContent className="max-w-4xl w-[95vw] h-[85vh] p-0 overflow-hidden bg-black/95 border-border/20 rounded-xl flex items-center justify-center">
          <DialogTitle className="sr-only">Product Image</DialogTitle>
          <div className="relative w-full h-full flex items-center justify-center p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Auction item"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
