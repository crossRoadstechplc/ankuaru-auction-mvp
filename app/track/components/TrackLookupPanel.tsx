"use client";

import { PanelCard } from "@/components/layout/panel-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Auction } from "@/lib/types";
import { formatEtbValue, formatDateTime } from "@/lib/format";
import { shortId } from "@/lib/format";
import { AuctionMetaList } from "@/src/components/domain/auction/detail/auction-meta-list";
import { UserAvatar } from "@/src/components/domain/user/user-avatar";
import { EmptyState } from "@/src/components/ui/empty-state";
import { LoadingState } from "@/src/components/ui/loading-state";
import {
  getAuctionStatusMeta,
  getAuctionTypeLabel,
  getCreatorHandle,
  getCreatorName,
  getTimeRemaining,
  getVisibilityLabel,
} from "../utils/track-utils";
import { InlineError } from "./InlineError";
import { MetricPill } from "./MetricPill";
import Link from "next/link";

interface TrackLookupPanelProps {
  auctionIdInput: string;
  onAuctionIdInputChange: (value: string) => void;
  onTrackSingleAuction: () => Promise<void>;
  onRefreshSingleAuction: () => void | Promise<void>;
  onRefreshBoard: () => Promise<void> | void;
  trackedAuction: Auction | null;
  isLoading: boolean;
  isRefreshing: boolean;
  inputError: string | null;
  queryError: string | null;
}

export function TrackLookupPanel({
  auctionIdInput,
  onAuctionIdInputChange,
  onTrackSingleAuction,
  onRefreshSingleAuction,
  onRefreshBoard,
  trackedAuction,
  isLoading,
  isRefreshing,
  inputError,
  queryError,
}: TrackLookupPanelProps) {
  const statusMeta = trackedAuction
    ? getAuctionStatusMeta(trackedAuction.status)
    : null;

  const metaItems = trackedAuction
    ? [
        {
          label: "Category",
          value: trackedAuction.auctionCategory,
          icon: "sell",
        },
        {
          label: "Type",
          value: getAuctionTypeLabel(trackedAuction.auctionType),
          icon:
            trackedAuction.auctionType === "SELL"
              ? "storefront"
              : "shopping_cart",
        },
        {
          label: "Visibility",
          value: getVisibilityLabel(trackedAuction.visibility),
          icon: "public",
        },
        ...(trackedAuction.quantityUnit
          ? [
              {
                label: "Unit",
                value: trackedAuction.quantityUnit,
                icon: "inventory_2",
              },
            ]
          : []),
        {
          label: "Bids",
          value: (trackedAuction.bidCount ?? 0).toString(),
          icon: "gavel",
        },
        {
          label: "Min bid",
          value: formatEtbValue(trackedAuction.minBid),
          icon: "payments",
        },
        {
          label: "Reserve",
          value: formatEtbValue(trackedAuction.reservePrice),
          icon: "verified",
        },
        {
          label: "Time remaining",
          value: getTimeRemaining(
            trackedAuction.startAt,
            trackedAuction.endAt,
            trackedAuction.status,
          ),
          icon: "schedule",
        },
        {
          label: "Deadline",
          value:
            trackedAuction.status === "SCHEDULED"
              ? formatDateTime(trackedAuction.startAt)
              : trackedAuction.status === "CLOSED" && trackedAuction.closedAt
                ? formatDateTime(trackedAuction.closedAt)
                : formatDateTime(trackedAuction.endAt),
          icon: "event",
        },
      ]
    : [];

  return (
    <PanelCard
      title="Track by ID"
      description="Paste a UUID to inspect a single auction in detail."
      className="self-start lg:sticky lg:top-24"
      bodyClassName="space-y-4"
    >
      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          void onTrackSingleAuction();
        }}
      >
        <div className="space-y-2">
          <label
            htmlFor="auction-id"
            className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground"
          >
            Auction ID
          </label>
          <div className="flex gap-2">
            <Input
              id="auction-id"
              placeholder="Enter auction UUID"
              value={auctionIdInput}
              onChange={(event) => {
                onAuctionIdInputChange(event.target.value);
              }}
              spellCheck={false}
              autoComplete="off"
              className="h-11 flex-1"
            />
            <Button
              type="submit"
              disabled={isLoading || isRefreshing}
              className="gap-2"
            >
              <span
                className={`material-symbols-outlined text-sm ${
                  isLoading || isRefreshing ? "animate-spin" : ""
                }`}
              >
                {isLoading || isRefreshing ? "refresh" : "search"}
              </span>
              {isLoading
                ? "Searching..."
                : isRefreshing
                  ? "Refreshing..."
                  : "Track"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Use an ID from a notification, URL, or backend response.
          </p>
        </div>
      </form>

      {inputError ? <InlineError message={inputError} /> : null}
      {queryError ? <InlineError message={queryError} /> : null}

      {isLoading && !trackedAuction ? (
        <LoadingState type="card" count={1} />
      ) : trackedAuction ? (
        <Card className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-950">
          <CardHeader className="space-y-3 border-b border-border/60 bg-muted/20 p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {statusMeta ? (
                    <Badge variant={statusMeta.variant}>
                      {statusMeta.label}
                    </Badge>
                  ) : null}
                  <Badge variant="outline">
                    ID {shortId(trackedAuction.id)}
                  </Badge>
                </div>
                <CardTitle className="text-xl leading-tight">
                  {trackedAuction.title}
                </CardTitle>
              </div>
              {statusMeta ? (
                <div
                  className={`rounded-xl px-3 py-2 text-xs font-semibold ${statusMeta.accentClassName}`}
                >
                  {statusMeta.helper}
                </div>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground">
              {trackedAuction.itemDescription}
            </p>
          </CardHeader>

          <CardContent className="space-y-5 p-5">
            <AuctionMetaList columns={2} items={metaItems} />

            <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/30 p-3">
              <UserAvatar
                src={trackedAuction.creator?.avatar}
                name={getCreatorName(trackedAuction)}
                size="sm"
              />
              <div className="min-w-0">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                  Creator
                </p>
                <p className="truncate text-sm font-semibold text-foreground">
                  {getCreatorName(trackedAuction)}
                </p>
                {getCreatorHandle(trackedAuction) ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {getCreatorHandle(trackedAuction)}
                  </p>
                ) : null}
              </div>
            </div>

            {trackedAuction.status === "CLOSED" &&
            (trackedAuction.winnerId || trackedAuction.winningBid) ? (
              <div className="rounded-2xl border border-success/20 bg-success/10 p-4">
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-success">
                  Final result
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {trackedAuction.winnerId
                    ? `${shortId(trackedAuction.winnerId)}...`
                    : "Winner confirmed"}
                </p>
                {trackedAuction.winningBid ? (
                  <p className="text-xs text-success">
                    Winning bid {formatEtbValue(trackedAuction.winningBid)}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Button asChild className="gap-2">
                <Link href={`/auction/${trackedAuction.id}`}>
                  <span className="material-symbols-outlined text-sm">
                    open_in_new
                  </span>
                  Open auction
                </Link>
              </Button>
              <Button
                variant="outline"
                onClick={() => void onRefreshSingleAuction()}
                disabled={isLoading || isRefreshing}
                className="gap-2"
              >
                <span
                  className={`material-symbols-outlined text-sm ${
                    isLoading || isRefreshing ? "animate-spin" : ""
                  }`}
                >
                  refresh
                </span>
                Refresh lookup
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <EmptyState
          iconName="track_changes"
          title="No auction loaded yet"
          description="Paste a UUID and press Track to inspect a specific lot."
          className="min-h-[220px] border-dashed"
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void onRefreshBoard()}
                className="gap-2"
              >
                <span className="material-symbols-outlined text-sm">
                  refresh
                </span>
                Refresh board
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link href="/feed">Browse feed</Link>
              </Button>
            </div>
          }
        />
      )}
    </PanelCard>
  );
}
