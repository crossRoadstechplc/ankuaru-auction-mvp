"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Auction } from "@/lib/types";
import { formatEtbValue, formatDateTime } from "@/lib/format";
import { UserAvatar } from "@/src/components/domain/user/user-avatar";
import {
  getAuctionStatusMeta,
  getAuctionTypeLabel,
  getCreatorHandle,
  getCreatorName,
  getTimeRemaining,
  getVisibilityLabel,
} from "../utils/track-utils";
import { shortId } from "@/lib/format";
import { cn } from "@/lib/utils";
import { MetricPill } from "./MetricPill";
import Link from "next/link";

interface TrackedAuctionCardProps {
  auction: Auction;
}

export function TrackedAuctionCard({ auction }: TrackedAuctionCardProps) {
  const statusMeta = getAuctionStatusMeta(auction.status);
  const creatorName = getCreatorName(auction);
  const creatorHandle = getCreatorHandle(auction);
  const currentBidValue = auction.currentBid || auction.minBid;
  const deadlineLabel =
    auction.status === "SCHEDULED"
      ? "Starts at"
      : auction.status === "CLOSED"
        ? "Closed at"
        : "Ends at";
  const deadlineValue =
    auction.status === "SCHEDULED"
      ? formatDateTime(auction.startAt)
      : auction.status === "CLOSED" && auction.closedAt
        ? formatDateTime(auction.closedAt)
        : formatDateTime(auction.endAt);

  return (
    <Card className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className={cn("h-1 w-full", statusMeta.barClassName)} />
      <CardContent className="p-5">
        <div className="flex flex-col gap-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                <Badge variant="outline">
                  {getAuctionTypeLabel(auction.auctionType)}
                </Badge>
                <Badge variant="secondary">
                  {getVisibilityLabel(auction.visibility)}
                </Badge>
                {auction.auctionCategory ? (
                  <Badge variant="coffee">{auction.auctionCategory}</Badge>
                ) : null}
              </div>

              <div className="space-y-1">
                <h3 className="line-clamp-2 text-lg font-bold tracking-tight text-foreground">
                  {auction.title}
                </h3>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {auction.itemDescription}
                </p>
              </div>
            </div>

            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href={`/auction/${auction.id}`}>
                <span className="material-symbols-outlined text-sm">
                  open_in_new
                </span>
                Open
              </Link>
            </Button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <MetricPill
              label="Current bid"
              value={formatEtbValue(currentBidValue)}
            />
            <MetricPill
              label="Reserve"
              value={formatEtbValue(auction.reservePrice)}
            />
            <MetricPill
              label="Bids"
              value={(auction.bidCount ?? 0).toString()}
            />
            <MetricPill
              label="Time"
              value={getTimeRemaining(
                auction.startAt,
                auction.endAt,
                auction.status,
              )}
            />
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/30 p-3">
              <UserAvatar
                src={auction.creator?.avatar}
                name={creatorName}
                size="sm"
              />
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  Creator
                </p>
                <p className="truncate text-sm font-semibold text-foreground">
                  {creatorName}
                </p>
                {creatorHandle ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {creatorHandle}
                  </p>
                ) : null}
              </div>
            </div>

            {auction.status === "CLOSED" &&
            (auction.winnerId || auction.winningBid) ? (
              <div className="rounded-2xl border border-success/20 bg-success/10 p-3">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-success">
                  Winner
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {auction.winnerId
                    ? `${shortId(auction.winnerId)}...`
                    : "Confirmed"}
                </p>
                {auction.winningBid ? (
                  <p className="text-xs text-success">
                    Winning bid {formatEtbValue(auction.winningBid)}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="rounded-2xl border border-border/70 bg-muted/30 p-3">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  {deadlineLabel}
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {deadlineValue}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
