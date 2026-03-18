"use client";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { PageSection } from "@/components/layout/page-section";
import { PageShell } from "@/components/layout/page-shell";
import { PanelCard } from "@/components/layout/panel-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Auction } from "@/lib/types";
import { cn } from "@/lib/utils";
import { AuctionMetaList } from "@/src/components/domain/auction/detail/auction-meta-list";
import { UserAvatar } from "@/src/components/domain/user/user-avatar";
import { EmptyState } from "@/src/components/ui/empty-state";
import { LoadingState } from "@/src/components/ui/loading-state";
import {
  useAuctionQuery,
  useAuctionsQuery,
} from "@/src/features/auctions/queries/hooks";
import { useAuthStore } from "@/stores/auth.store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

type TrackStatusFilter = "ALL" | Auction["status"];

interface StatusMeta {
  label: string;
  helper: string;
  icon: string;
  variant: "default" | "secondary" | "success" | "warning" | "outline";
  barClassName: string;
  accentClassName: string;
}

const TRACK_STATUS_FILTERS: Array<{
  value: TrackStatusFilter;
  label: string;
  icon: string;
}> = [
  { value: "ALL", label: "All", icon: "layers" },
  { value: "OPEN", label: "Live", icon: "gavel" },
  { value: "REVEAL", label: "Reveal", icon: "visibility" },
  { value: "SCHEDULED", label: "Scheduled", icon: "schedule" },
  { value: "CLOSED", label: "Closed", icon: "check_circle" },
];

const STATUS_PRIORITY: Record<Auction["status"], number> = {
  OPEN: 0,
  REVEAL: 1,
  SCHEDULED: 2,
  CLOSED: 3,
};

function shortId(value: string): string {
  return value.slice(0, 8);
}

function formatNumber(value?: string): string {
  if (!value) {
    return "—";
  }

  const normalized = value.replace(/,/g, "").trim();
  const numeric = Number(normalized);

  if (!Number.isFinite(numeric)) {
    return value;
  }

  return numeric.toLocaleString("en-US");
}

function formatEtbValue(value?: string): string {
  const formatted = formatNumber(value);
  return formatted === "—" ? "ETB —" : `ETB ${formatted}`;
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDuration(milliseconds: number): string {
  const totalMinutes = Math.max(0, Math.floor(milliseconds / 60000));
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h`;
  }

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  return `${minutes}m`;
}

function getTimeRemaining(
  startAt: string,
  endAt: string,
  status: Auction["status"],
): string {
  const now = Date.now();
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();

  if (status === "SCHEDULED") {
    const diff = start - now;
    if (diff <= 0) {
      return "Starting now";
    }

    return `Starts in ${formatDuration(diff)}`;
  }

  if (status === "OPEN") {
    const diff = end - now;
    if (diff <= 0) {
      return "Ending now";
    }

    return `${formatDuration(diff)} left`;
  }

  if (status === "REVEAL") {
    const diff = end - now;
    if (diff <= 0) {
      return "Reveal complete";
    }

    return `${formatDuration(diff)} remaining`;
  }

  return "Finalized";
}

function getAuctionStatusMeta(status: Auction["status"]): StatusMeta {
  switch (status) {
    case "OPEN":
      return {
        label: "Live",
        helper: "Bidding is active right now.",
        icon: "gavel",
        variant: "success",
        barClassName: "bg-gradient-to-r from-success via-primary to-primary/70",
        accentClassName: "bg-success/10 text-success",
      };
    case "REVEAL":
      return {
        label: "Reveal",
        helper: "Final bids are being revealed.",
        icon: "visibility",
        variant: "warning",
        barClassName:
          "bg-gradient-to-r from-warning via-warning/80 to-primary/70",
        accentClassName: "bg-warning/10 text-warning",
      };
    case "SCHEDULED":
      return {
        label: "Scheduled",
        helper: "The auction has not opened yet.",
        icon: "schedule",
        variant: "secondary",
        barClassName:
          "bg-gradient-to-r from-primary/40 via-primary/20 to-muted",
        accentClassName: "bg-primary/10 text-primary",
      };
    case "CLOSED":
    default:
      return {
        label: "Closed",
        helper: "The final result is locked.",
        icon: "check_circle",
        variant: "secondary",
        barClassName:
          "bg-gradient-to-r from-muted via-border to-muted-foreground/40",
        accentClassName: "bg-muted/80 text-muted-foreground",
      };
  }
}

function getAuctionTypeLabel(type: Auction["auctionType"]): string {
  return type === "SELL" ? "Sell auction" : "Buy request";
}

function getVisibilityLabel(visibility: Auction["visibility"]): string {
  switch (visibility) {
    case "PUBLIC":
      return "Public";
    case "FOLLOWERS":
      return "Followers only";
    case "SELECTED":
      return "Selected users";
    default:
      return visibility;
  }
}

function getCreatorName(auction: Auction): string {
  return (
    auction.creator?.fullName ||
    auction.creator?.username ||
    `Creator ${shortId(auction.createdBy)}`
  );
}

function getCreatorHandle(auction: Auction): string | null {
  if (auction.creator?.username) {
    return `@${auction.creator.username}`;
  }

  if (auction.createdBy) {
    return `ID ${shortId(auction.createdBy)}`;
  }

  return null;
}

function sortTrackedAuctions(left: Auction, right: Auction): number {
  const leftPriority = STATUS_PRIORITY[left.status] ?? 99;
  const rightPriority = STATUS_PRIORITY[right.status] ?? 99;

  if (leftPriority !== rightPriority) {
    return leftPriority - rightPriority;
  }

  const leftTime =
    left.status === "CLOSED"
      ? new Date(left.closedAt || left.endAt || left.createdAt || 0).getTime()
      : new Date(left.endAt || left.startAt || left.createdAt || 0).getTime();
  const rightTime =
    right.status === "CLOSED"
      ? new Date(
          right.closedAt || right.endAt || right.createdAt || 0,
        ).getTime()
      : new Date(
          right.endAt || right.startAt || right.createdAt || 0,
        ).getTime();

  if (left.status === "CLOSED" && right.status === "CLOSED") {
    return rightTime - leftTime;
  }

  if (leftTime !== rightTime) {
    return leftTime - rightTime;
  }

  return (
    new Date(right.createdAt || 0).getTime() -
    new Date(left.createdAt || 0).getTime()
  );
}

function InlineError({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-destructive">
      <span className="material-symbols-outlined mt-0.5 text-base">error</span>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/70 bg-muted/30 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-foreground">{value}</p>
    </div>
  );
}

function TrackedAuctionCard({ auction }: { auction: Auction }) {
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
    <Card className="group overflow-hidden border-border/70 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className={cn("h-1 w-full", statusMeta.barClassName)} />
      <CardContent className="p-5">
        <div className="flex flex-col gap-4">
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
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
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
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-success">
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
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
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

function TrackLookupPanel({
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
}: {
  auctionIdInput: string;
  onAuctionIdInputChange: (value: string) => void;
  onTrackSingleAuction: () => Promise<void>;
  onRefreshSingleAuction: () => Promise<void>;
  onRefreshBoard: () => Promise<void> | void;
  trackedAuction: Auction | null;
  isLoading: boolean;
  isRefreshing: boolean;
  inputError: string | null;
  queryError: string | null;
}) {
  const statusMeta = trackedAuction
    ? getAuctionStatusMeta(trackedAuction.status)
    : null;

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
        <Card className="overflow-hidden border-border/70 shadow-sm">
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
              <div
                className={cn(
                  "rounded-xl px-3 py-2 text-xs font-semibold",
                  statusMeta?.accentClassName,
                )}
              >
                {statusMeta?.helper}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {trackedAuction.itemDescription}
            </p>
          </CardHeader>

          <CardContent className="space-y-4 p-5">
            <AuctionMetaList
              columns={2}
              items={[
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
              ]}
            />

            <div className="grid gap-3 sm:grid-cols-2">
              <MetricPill
                label="Time remaining"
                value={getTimeRemaining(
                  trackedAuction.startAt,
                  trackedAuction.endAt,
                  trackedAuction.status,
                )}
              />
              <MetricPill
                label="Deadline"
                value={
                  trackedAuction.status === "SCHEDULED"
                    ? formatDateTime(trackedAuction.startAt)
                    : trackedAuction.status === "CLOSED" &&
                        trackedAuction.closedAt
                      ? formatDateTime(trackedAuction.closedAt)
                      : formatDateTime(trackedAuction.endAt)
                }
              />
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-border/70 bg-muted/30 p-3">
              <UserAvatar
                src={trackedAuction.creator?.avatar}
                name={getCreatorName(trackedAuction)}
                size="sm"
              />
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
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
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-success">
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

export default function TrackAuctionPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<TrackStatusFilter>("ALL");
  const [auctionIdInput, setAuctionIdInput] = useState("");
  const [trackedAuctionId, setTrackedAuctionId] = useState("");
  const [singleInputError, setSingleInputError] = useState<string | null>(null);
  const lastSuccessIdRef = useRef<string | null>(null);

  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const {
    data: auctions = [],
    isLoading: isAuctionsLoading,
    isFetching: isAuctionsRefreshing,
    error: auctionsError,
    refetch: refetchAuctions,
  } = useAuctionsQuery();

  const singleQueryEnabled = trackedAuctionId.length > 0;

  const {
    data: singleAuctionData,
    isLoading: isSingleLoading,
    isFetching: isSingleRefreshing,
    error: singleAuctionError,
    refetch: refetchSingleAuction,
  } = useAuctionQuery(trackedAuctionId, {
    enabled: singleQueryEnabled,
    refetchOnWindowFocus: false,
  });

  const trackedAuctions = useMemo(
    () => [...auctions].sort(sortTrackedAuctions),
    [auctions],
  );

  const statusCounts = useMemo(() => {
    return trackedAuctions.reduce(
      (accumulator, auction) => {
        accumulator[auction.status] += 1;
        return accumulator;
      },
      {
        OPEN: 0,
        REVEAL: 0,
        SCHEDULED: 0,
        CLOSED: 0,
      } satisfies Record<Auction["status"], number>,
    );
  }, [trackedAuctions]);

  const totalTracked = trackedAuctions.length;
  const activeCount = statusCounts.OPEN + statusCounts.REVEAL;
  const closedCount = statusCounts.CLOSED;
  const scheduledCount = statusCounts.SCHEDULED;

  const filteredAuctions = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return trackedAuctions.filter((auction) => {
      if (filterStatus !== "ALL" && auction.status !== filterStatus) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [
        auction.title,
        auction.auctionCategory,
        auction.itemDescription,
        auction.productName,
        auction.region,
        auction.commodityType,
        auction.creator?.fullName,
        auction.creator?.username,
        auction.createdBy,
      ].some((entry) => entry?.toLowerCase().includes(normalizedSearch));
    });
  }, [trackedAuctions, searchTerm, filterStatus]);

  const singleAuction = useMemo(() => {
    if (!singleAuctionData || singleAuctionData.id !== trackedAuctionId) {
      return null;
    }

    return singleAuctionData;
  }, [singleAuctionData, trackedAuctionId]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (singleAuction && singleAuction.id !== lastSuccessIdRef.current) {
      lastSuccessIdRef.current = singleAuction.id;
      toast.success("Auction found successfully.");
    }
  }, [singleAuction]);

  useEffect(() => {
    if (singleQueryEnabled && singleAuctionError instanceof Error) {
      toast.error(singleAuctionError.message);
    }
  }, [singleQueryEnabled, singleAuctionError]);

  const handleTrackSingleAuction = async () => {
    const trimmed = auctionIdInput.trim();

    if (!trimmed) {
      setSingleInputError("Please enter an auction ID.");
      return;
    }

    setSingleInputError(null);

    if (trimmed === trackedAuctionId && singleQueryEnabled) {
      await refetchSingleAuction();
      return;
    }

    setTrackedAuctionId(trimmed);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("ALL");
  };

  if (!isAuthenticated) {
    return (
      <PageShell>
        <div className="flex min-h-screen items-center justify-center px-4">
          <Card className="w-full max-w-md border-border/70 shadow-sm">
            <CardContent className="space-y-4 p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-3xl">lock</span>
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">
                  Authentication required
                </h2>
                <p className="text-sm text-muted-foreground">
                  Please log in to track auctions.
                </p>
              </div>
              <Button asChild className="w-full">
                <Link href="/login">Go to login</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageShell>
    );
  }

  const hasActiveFilters =
    searchTerm.trim().length > 0 || filterStatus !== "ALL";
  const singleAuctionLoading = isSingleLoading && !singleAuction;
  const lookupQueryError =
    singleQueryEnabled && singleAuctionError instanceof Error
      ? singleAuctionError.message
      : null;

  return (
    <PageShell>
      <Header />
      <PageContainer className="space-y-8 py-8 md:py-10">
        <PageHeader
          title="Track Auctions"
          description="Search live, scheduled, reveal, and closed auctions from one place."
          actions={
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="coffee" className="px-3 py-1 text-xs">
                {totalTracked} tracked
              </Badge>
              <Badge
                variant={activeCount > 0 ? "success" : "secondary"}
                className="px-3 py-1 text-xs"
              >
                {activeCount} active
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void refetchAuctions()}
                disabled={isAuctionsRefreshing}
                className="gap-2"
              >
                <span
                  className={`material-symbols-outlined text-sm ${
                    isAuctionsRefreshing ? "animate-spin" : ""
                  }`}
                >
                  refresh
                </span>
                Refresh
              </Button>
            </div>
          }
        />

        <PageSection>
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-[linear-gradient(135deg,rgba(61,127,93,0.12),rgba(255,255,255,0.94),rgba(75,147,108,0.08))] p-6 shadow-sm md:p-8 dark:border-primary/20 dark:bg-[linear-gradient(135deg,rgba(17,33,20,0.96),rgba(28,46,31,0.9),rgba(9,17,10,0.96))]">
            <div className="absolute -right-20 top-0 h-56 w-56 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-warning/10 blur-3xl" />

            <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_360px]">
              <div className="space-y-5">
                <Badge
                  variant="coffee"
                  className="w-fit gap-2 px-3 py-1 text-xs uppercase tracking-[0.14em]"
                >
                  <span className="material-symbols-outlined text-xs">
                    track_changes
                  </span>
                  Auction watchtower
                </Badge>
                <div className="space-y-3">
                  <h2 className="max-w-2xl text-3xl font-black tracking-tight text-foreground md:text-4xl">
                    Stay on top of live lots, future openings, and final
                    winners.
                  </h2>
                  <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                    Use the tracker to scan every auction at a glance, narrow
                    the board by phase, and jump straight into a lot when you
                    already have the ID.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge variant="success" className="px-3 py-1">
                    {activeCount} live right now
                  </Badge>
                  <Badge variant="warning" className="px-3 py-1">
                    {scheduledCount} scheduled
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1">
                    {closedCount} closed
                  </Badge>
                  <Badge variant="coffee" className="px-3 py-1">
                    {totalTracked} total tracked
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button asChild className="gap-2">
                    <Link href="/feed">
                      <span className="material-symbols-outlined text-sm">
                        storefront
                      </span>
                      Browse feed
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => void refetchAuctions()}
                    disabled={isAuctionsRefreshing}
                    className="gap-2"
                  >
                    <span
                      className={`material-symbols-outlined text-sm ${
                        isAuctionsRefreshing ? "animate-spin" : ""
                      }`}
                    >
                      refresh
                    </span>
                    Refresh board
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-border/70 bg-card/95 p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                      Quick workflow
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-foreground">
                      How to use the board
                    </h3>
                  </div>
                  <Badge variant="secondary" className="px-3 py-1 text-[11px]">
                    {totalTracked} items
                  </Badge>
                </div>

                <div className="mt-4 space-y-3">
                  {[
                    {
                      title: "Scan the board",
                      description:
                        "Search by title, category, description, or creator to shrink the list fast.",
                    },
                    {
                      title: "Filter the phase",
                      description:
                        "Use the phase chips to isolate live, reveal, scheduled, or closed lots.",
                    },
                    {
                      title: "Lookup by ID",
                      description:
                        "Paste a UUID into the tracker panel below to jump straight into one auction.",
                    },
                  ].map((step, index) => (
                    <div
                      key={step.title}
                      className="flex gap-3 rounded-2xl border border-border/70 bg-muted/30 p-3"
                    >
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {index + 1}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-foreground">
                          {step.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </PageSection>

        <PageSection>
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <PanelCard
              title="All auctions"
              description="Search by title, category, description, or creator, then narrow the board by phase."
              action={
                <Badge variant="secondary" className="px-2.5 py-1 text-xs">
                  {filteredAuctions.length} shown
                </Badge>
              }
              bodyClassName="space-y-4"
            >
              <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
                <div className="relative">
                  <span className="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-muted-foreground">
                    search
                  </span>
                  <Input
                    placeholder="Search auctions by title, category, creator, or description"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="h-11 pl-9 pr-10"
                  />
                  {searchTerm ? (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      aria-label="Clear search"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        close
                      </span>
                    </button>
                  ) : null}
                </div>

                <Button
                  variant="outline"
                  onClick={() => void refetchAuctions()}
                  disabled={isAuctionsRefreshing}
                  className="gap-2"
                >
                  <span
                    className={`material-symbols-outlined text-sm ${
                      isAuctionsRefreshing ? "animate-spin" : ""
                    }`}
                  >
                    refresh
                  </span>
                  Refresh board
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {TRACK_STATUS_FILTERS.map((filter) => {
                  const isSelected = filterStatus === filter.value;
                  const count =
                    filter.value === "ALL"
                      ? totalTracked
                      : statusCounts[filter.value];

                  return (
                    <Button
                      key={filter.value}
                      type="button"
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => setFilterStatus(filter.value)}
                      className="gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {filter.icon}
                      </span>
                      {filter.label}
                      <span className="rounded-full bg-background/70 px-2 py-0.5 text-[10px] font-semibold text-foreground">
                        {count}
                      </span>
                    </Button>
                  );
                })}
              </div>

              {auctionsError instanceof Error ? (
                <InlineError message={auctionsError.message} />
              ) : null}

              {isAuctionsLoading && trackedAuctions.length === 0 ? (
                <LoadingState type="list" count={4} />
              ) : filteredAuctions.length > 0 ? (
                <div className="space-y-4">
                  {filteredAuctions.map((auction) => (
                    <TrackedAuctionCard key={auction.id} auction={auction} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  iconName="visibility_off"
                  title={
                    hasActiveFilters
                      ? "No matching auctions"
                      : "No tracked auctions yet"
                  }
                  description={
                    hasActiveFilters
                      ? "Try broadening the search or clearing the phase filter."
                      : "When auctions are created they will appear here automatically."
                  }
                  action={
                    <div className="flex flex-wrap items-center justify-center gap-2">
                      {hasActiveFilters ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearFilters}
                          className="gap-2"
                        >
                          <span className="material-symbols-outlined text-sm">
                            restart_alt
                          </span>
                          Clear filters
                        </Button>
                      ) : null}
                      <Button asChild variant="secondary" size="sm">
                        <Link href="/feed">Browse feed</Link>
                      </Button>
                    </div>
                  }
                />
              )}
            </PanelCard>

            <TrackLookupPanel
              auctionIdInput={auctionIdInput}
              onAuctionIdInputChange={(value) => {
                setAuctionIdInput(value);
                setSingleInputError(null);
              }}
              onTrackSingleAuction={handleTrackSingleAuction}
              onRefreshSingleAuction={async () => {
                if (!trackedAuctionId) {
                  return;
                }

                await refetchSingleAuction();
              }}
              onRefreshBoard={() => void refetchAuctions()}
              trackedAuction={singleAuction}
              isLoading={singleAuctionLoading}
              isRefreshing={isSingleRefreshing && !singleAuctionLoading}
              inputError={singleInputError}
              queryError={lookupQueryError}
            />
          </div>
        </PageSection>
      </PageContainer>

      <Footer />
    </PageShell>
  );
}
