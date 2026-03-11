import * as React from "react"
import Link from "next/link"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserAvatar } from "../user/user-avatar"
import { AuctionStatusBadge, AuctionStatus } from "./auction-status-badge"
import { getImageWithFallback } from "@/lib/imageUtils"
import { cn } from "@/lib/utils"

export interface AuctionCardProps {
  id: string
  title: string
  images?: string[]
  sellerName?: string
  sellerAvatar?: string | null
  status: AuctionStatus | string
  currentBidAmount: number
  currency?: string
  endAt: string | Date
  category?: string
  className?: string
  isHighlighted?: boolean
}

export function AuctionCard({
  id,
  title,
  images,
  sellerName = "Unknown Seller",
  sellerAvatar,
  status,
  currentBidAmount,
  currency = "ETB",
  endAt,
  category,
  className,
  isHighlighted = false,
}: AuctionCardProps) {
  const endDate = new Date(endAt)
  const isClosingSoon = endDate.getTime() - Date.now() < 24 * 60 * 60 * 1000 && status === "OPEN"
  const formattedEndTime = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(endDate)

  const coverImage = images && images.length > 0 ? images[0] : null

  return (
    <Link href={`/auction/${id}`} className="block h-full outline-none">
      <Card
        className={cn(
          "h-full overflow-hidden transition-all hover:shadow-md group flex flex-col cursor-pointer",
          isHighlighted && "ring-2 ring-primary border-primary",
          className
        )}
      >
        {/* Image Header Area */}
        <div className="relative h-48 w-full bg-muted overflow-hidden shrink-0">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url('${getImageWithFallback(coverImage)}')` }}
          />
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

          {/* Top Info */}
          <div className="absolute top-3 left-3 flex gap-2">
            <AuctionStatusBadge status={status} />
            {category && <Badge variant="coffee" className="bg-black/40 text-white border-none backdrop-blur-sm hover:opacity-100">{category}</Badge>}
          </div>

          {/* Bottom Info - Time left */}
          <div className="absolute bottom-3 right-3">
            <Badge
              variant={status === "CLOSED" ? "secondary" : isClosingSoon ? "warning" : "default"}
              className={cn("bg-background/90 text-foreground shadow-sm backdrop-blur-sm flex items-center gap-1.5 px-2 py-1")}
            >
              <span className="material-symbols-outlined text-[14px]">
                {status === "CLOSED" ? "event_available" : "schedule"}
              </span>
              <span>{status === "CLOSED" ? "Ended" : isClosingSoon ? "Ending Soon" : "Ends"} {formattedEndTime}</span>
            </Badge>
          </div>
        </div>

        <CardContent className="p-5 flex-1 flex flex-col">
          {/* Title */}
          <h3 className="text-lg font-bold text-foreground line-clamp-2 mb-4 group-hover:text-primary transition-colors">
            {title}
          </h3>

          <div className="mt-auto space-y-4">
            {/* Bid Summary */}
            <div className="flex items-center justify-between rounded-lg bg-secondary/50 p-3 border border-border/50">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Current Bid
              </span>
              <span className="text-lg font-black text-primary">
                {currentBidAmount.toLocaleString()} {currency}
              </span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="px-5 py-4 border-t border-border/40 bg-card/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <UserAvatar src={sellerAvatar} name={sellerName} size="sm" />
            <span className="text-sm font-medium text-foreground truncate max-w-[140px]">
              {sellerName}
            </span>
          </div>
          <span className="text-xs font-semibold text-primary group-hover:underline underline-offset-4">
            View Details
          </span>
        </CardFooter>
      </Card>
    </Link>
  )
}
