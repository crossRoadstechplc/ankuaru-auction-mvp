import * as React from "react"
import { AuctionStatusBadge } from "../auction-status-badge"
import { UserAvatar } from "../../user/user-avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export interface AuctionDetailHeaderProps {
  title: string
  status: string
  auctionType: "SELL" | "BUY"
  category?: string
  visibility?: string
  sellerName?: string
  sellerAvatar?: string | null
  isOwner?: boolean
  className?: string
}

export function AuctionDetailHeader({
  title,
  status,
  auctionType,
  category,
  visibility,
  sellerName,
  sellerAvatar,
  isOwner,
  className,
}: AuctionDetailHeaderProps) {
  const isSell = auctionType === "SELL"

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      {/* Badge Row */}
      <div className="flex flex-wrap items-center gap-2">
        {isOwner && (
          <Badge className="gap-1.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
            <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
            Creator Control Panel
          </Badge>
        )}
        <AuctionStatusBadge status={status} />
        <Badge variant={isSell ? "success" : "default"} className="gap-1">
          <span className="material-symbols-outlined text-xs">{isSell ? "sell" : "shopping_cart"}</span>
          {isSell ? "Auction Sale" : "Purchase Request"}
        </Badge>
        {category && <Badge variant="secondary">{category}</Badge>}
        {visibility && <Badge variant="outline">{visibility}</Badge>}
      </div>

      {/* Title */}
      <h1 className="text-3xl font-extrabold tracking-tight text-foreground">{title}</h1>

      {/* Seller */}
      {sellerName && (
        <div className="flex items-center gap-2.5">
          <UserAvatar src={sellerAvatar} name={sellerName} size="sm" />
          <div className="flex flex-col gap-0.5">
            <span className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
              Auction Creator
            </span>
            <span className="text-sm font-semibold text-foreground">{sellerName}</span>
          </div>
        </div>
      )}
    </div>
  )
}
