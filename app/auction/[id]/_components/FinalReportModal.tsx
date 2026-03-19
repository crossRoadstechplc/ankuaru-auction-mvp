"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/src/components/ui/empty-state";
import { LoadingState } from "@/src/components/ui/loading-state";
import { UserAvatar } from "@/src/components/domain/user/user-avatar";
import { useAuctionReportQuery } from "@/src/features/auctions/queries/hooks";
import { AuctionReport } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

interface FinalReportModalProps {
  auction: {
    id: string;
    title: string;
    minBid: string;
    reservePrice: string;
    currentBid?: string;
    winningBid?: string;
    winnerId?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

function formatEtbValue(value?: string | null): string {
  if (!value) {
    return "ETB —";
  }

  const normalized = value.replace(/,/g, "").trim();
  const numeric = Number(normalized);

  if (!Number.isFinite(numeric)) {
    return `ETB ${value}`;
  }

  return `ETB ${numeric.toLocaleString("en-US")}`;
}

function formatDateTime(value?: string | null): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function shortId(value?: string | null): string {
  if (!value) {
    return "—";
  }

  return value.length > 8 ? `${value.slice(0, 8)}...` : value;
}

function sortTopBids(report: AuctionReport): AuctionReport["topBids"] {
  return [...report.topBids].sort((left, right) => {
    const leftAmount = Number(
      (left.revealedAmount ?? "0").replace(/,/g, "").trim(),
    );
    const rightAmount = Number(
      (right.revealedAmount ?? "0").replace(/,/g, "").trim(),
    );

    if (rightAmount !== leftAmount) {
      return rightAmount - leftAmount;
    }

    return (
      new Date(right.revealedAt ?? 0).getTime() -
      new Date(left.revealedAt ?? 0).getTime()
    );
  });
}

function MetricCard({
  label,
  value,
  toneClassName,
  icon,
}: {
  label: string;
  value: string;
  toneClassName: string;
  icon: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", toneClassName)}>
          <span className="material-symbols-outlined text-sm">{icon}</span>
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-lg font-black tracking-tight text-foreground">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

export function FinalReportModal({
  auction,
  isOpen,
  onClose,
}: FinalReportModalProps) {
  const {
    data: report,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useAuctionReportQuery(auction.id, {
    enabled: isOpen,
    refetchOnWindowFocus: false,
  });

  const normalizedReport = report;
  const reportAuction = normalizedReport?.auction ?? {
    id: auction.id,
    title: auction.title,
    status: "CLOSED" as const,
    startAt: "",
    endAt: "",
    winnerId: auction.winnerId,
    winningBid: auction.winningBid,
  };
  const topBids = useMemo(
    () => (normalizedReport ? sortTopBids(normalizedReport).slice(0, 3) : []),
    [normalizedReport],
  );
  const winnerBid = useMemo(() => {
    if (!normalizedReport?.auction.winnerId) {
      return null;
    }

    return (
      normalizedReport.topBids.find(
        (bid) => bid.bidderId === normalizedReport.auction.winnerId,
      ) ?? null
    );
  }, [normalizedReport]);
  const winnerName =
    winnerBid?.bidderUsername || shortId(reportAuction.winnerId) || "Winner";
  const winnerAmount =
    reportAuction.winningBid || winnerBid?.revealedAmount || auction.winningBid;
  const hasReportError = error instanceof Error;

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-border bg-background shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-border/60 bg-gradient-to-r from-primary/8 via-background to-background px-6 py-5">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="coffee">Auction Report</Badge>
              <Badge variant="secondary">Closed</Badge>
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-black tracking-tight text-foreground">
                {reportAuction.title || auction.title}
              </h2>
              <p className="text-sm text-muted-foreground">
                Final summary from the auction report endpoint.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
              className="gap-2"
            >
              <span
                className={`material-symbols-outlined text-sm ${
                  isFetching ? "animate-spin" : ""
                }`}
              >
                refresh
              </span>
              Refresh
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close report">
              <span className="material-symbols-outlined text-lg">close</span>
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading && !report ? (
            <LoadingState type="spinner" />
          ) : hasReportError ? (
            <EmptyState
              iconName="error"
              title="Unable to load report"
              description={error.message}
              action={
                <Button variant="outline" onClick={() => void refetch()}>
                  Retry
                </Button>
              }
            />
          ) : normalizedReport ? (
            <div className="space-y-6">
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_360px]">
                <Card className="border-border/70 shadow-sm">
                  <CardContent className="space-y-5 p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="success">{reportAuction.status}</Badge>
                      <Badge variant="outline">
                        Closed {formatDateTime(reportAuction.closedAt)}
                      </Badge>
                      <Badge variant="secondary">
                        {formatDateTime(reportAuction.startAt)} - {formatDateTime(reportAuction.endAt)}
                      </Badge>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Winning bid
                        </p>
                        <p className="mt-1 text-2xl font-black tracking-tight text-primary">
                          {formatEtbValue(winnerAmount)}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Winner
                        </p>
                        <p className="mt-1 text-lg font-bold text-foreground">
                          {winnerName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {shortId(reportAuction.winnerId)}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      <MetricCard
                        label="Total bids"
                        value={report.totalBids.toString()}
                        toneClassName="bg-primary/10 text-primary"
                        icon="receipt_long"
                      />
                      <MetricCard
                        label="Revealed bids"
                        value={report.revealedBids.toString()}
                        toneClassName="bg-amber-500/10 text-amber-600"
                        icon="visibility"
                      />
                      <MetricCard
                        label="Valid bids"
                        value={report.validBids.toString()}
                        toneClassName="bg-success/10 text-success"
                        icon="check_circle"
                      />
                      <MetricCard
                        label="Invalid bids"
                        value={report.invalidBids.toString()}
                        toneClassName="bg-destructive/10 text-destructive"
                        icon="error"
                      />
                      <MetricCard
                        label="Highest revealed"
                        value={formatEtbValue(report.highestRevealedBid)}
                        toneClassName="bg-primary/10 text-primary"
                        icon="trending_up"
                      />
                      <MetricCard
                        label="Average revealed"
                        value={formatEtbValue(report.averageRevealedBid)}
                        toneClassName="bg-secondary text-secondary-foreground"
                        icon="stacked_line_chart"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/70 shadow-sm">
                  <CardContent className="space-y-4 p-5">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Report notes
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-foreground">
                        Finalized auction snapshot
                      </h3>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Auction ID
                      </p>
                      <p className="mt-1 break-all text-sm font-semibold text-foreground">
                        {reportAuction.id}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Closed at
                      </p>
                      <p className="mt-1 text-sm font-semibold text-foreground">
                        {formatDateTime(reportAuction.closedAt)}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Summary
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        The report uses the auction-report endpoint and shows
                        the final result, top revealed bids, and bid quality
                        counts without dumping every bidder into the UI.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_400px]">
                <Card className="overflow-hidden border-border/70 shadow-sm">
                  <div className="flex items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        Top revealed bids
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Showing only the strongest bids from the report.
                      </p>
                    </div>
                    <Badge variant="secondary" className="px-2.5 py-1 text-xs">
                      Top {topBids.length}
                    </Badge>
                  </div>

                  {topBids.length === 0 ? (
                    <EmptyState
                      iconName="gavel"
                      title="No revealed bids in the report"
                      description="The report endpoint did not return any revealed bid entries."
                      className="border-0 rounded-none min-h-[220px]"
                    />
                  ) : (
                    <div className="divide-y divide-border/60">
                      {topBids.map((bid, index) => {
                        const valid = bid.isValid !== false;
                        const statusLabel = valid ? "Valid" : "Invalid";
                        const statusVariant = valid
                          ? "success"
                          : "destructive";

                        return (
                          <div
                            key={`${bid.bidderId}-${bid.revealedAt ?? index}`}
                            className="flex items-start justify-between gap-4 px-5 py-4"
                          >
                            <div className="flex min-w-0 items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-foreground">
                                #{index + 1}
                              </div>
                              <UserAvatar
                                src={bid.bidderAvatar}
                                name={bid.bidderUsername || bid.bidderId}
                                size="sm"
                              />
                              <div className="min-w-0">
                                <p className="truncate text-sm font-bold text-foreground">
                                  {bid.bidderUsername || shortId(bid.bidderId)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {shortId(bid.bidderId)}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                  Revealed {formatDateTime(bid.revealedAt)}
                                </p>
                                {!valid && bid.invalidReason ? (
                                  <p className="mt-1 text-xs text-destructive">
                                    {bid.invalidReason}
                                  </p>
                                ) : null}
                              </div>
                            </div>

                            <div className="flex shrink-0 flex-col items-end gap-2">
                              <p className="text-lg font-black tracking-tight text-foreground">
                                {formatEtbValue(bid.revealedAmount)}
                              </p>
                              <Badge variant={statusVariant} className="px-2.5 py-1 text-[10px]">
                                {statusLabel}
                              </Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </Card>

                <Card className="border-border/70 shadow-sm">
                  <CardContent className="space-y-4 p-5">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                        Winner spotlight
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-foreground">
                        Final result
                      </h3>
                    </div>

                    <div className="rounded-2xl border border-success/20 bg-success/10 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-success">
                        Auction winner
                      </p>
                      <div className="mt-3 flex items-center gap-3">
                        <UserAvatar
                          src={winnerBid?.bidderAvatar}
                          name={winnerBid?.bidderUsername || reportAuction.winnerId}
                          size="md"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-foreground">
                            {winnerBid?.bidderUsername || shortId(reportAuction.winnerId)}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {shortId(reportAuction.winnerId)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-4 rounded-xl border border-success/20 bg-background/80 p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                          Winning bid
                        </p>
                        <p className="mt-1 text-2xl font-black tracking-tight text-success">
                          {formatEtbValue(winnerAmount)}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border/70 bg-muted/30 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                        Report guidance
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        This panel intentionally avoids listing every bidder.
                        It focuses on the final outcome and the strongest
                        revealed offers so the report stays readable.
                      </p>
                    </div>

                    <Button variant="outline" className="w-full" onClick={onClose}>
                      Close report
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
