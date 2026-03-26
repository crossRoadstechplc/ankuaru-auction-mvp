"use client";

import { CollapsibleSection } from "@/components/ui/collapsible-section";
import { formatBidDisplayValue, getBidTotal } from "@/lib/format";
import { Auction, Bid } from "../../../../lib/types";
import { useMyBidQuery } from "@/src/features/bids/queries/hooks";
import { useCountdownTimer } from "../../../../hooks/useCountdownTimer";

interface BidActivityProps {
  data: Auction;
  bids: Bid[];
  isCreator: boolean;
}

function formatBidDisplay(bid: Bid, currency?: string): string {
  if (!bid.revealedAmount && !bid.amount) return "Hidden";
  return formatBidDisplayValue(bid, currency);
}
function getReserveStatus(
  currentBid?: string | null,
  reservePrice?: string | null,
  auctionType?: "SELL" | "BUY",
): "met" | "not_met" | "unknown" {
  if (!currentBid || !reservePrice) return "unknown";

  const current = parseFloat(String(currentBid).replace(/,/g, ""));
  const reserve = parseFloat(String(reservePrice).replace(/,/g, ""));

  if (!Number.isFinite(current) || !Number.isFinite(reserve)) return "unknown";

  if (auctionType === "SELL") {
    return current >= reserve ? "met" : "not_met";
  }

  return current <= reserve ? "met" : "not_met";
}

function getTimeRemainingLabel(timeLeft: ReturnType<typeof useCountdownTimer>): string {
  if (timeLeft.isClosed) return "Closed";

  if (timeLeft.isScheduled && timeLeft.timeUntilStart) {
    const { days, hours, minutes } = timeLeft.timeUntilStart;
    if (days > 0) return `Starts in ${days}d ${hours}h`;
    if (hours > 0) return `Starts in ${hours}h ${minutes}m`;
    return `Starts in ${minutes}m`;
  }

  const { days, hours, minutes } = timeLeft;
  if (days > 0) return `${days}d ${hours}h left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
}

export function BidActivity({ data, bids, isCreator }: BidActivityProps) {
  const isSell = data.auctionType === "SELL";
  const isRevealed = data.status === "REVEAL" || data.status === "CLOSED";

  const { data: myBid } = useMyBidQuery(data.id);
  const timeLeft = useCountdownTimer(data.startAt, data.endAt, data.status);

  const sortedBids = [...(bids || [])].sort((left, right) => {
    if (!isRevealed) {
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    }

    const leftTotal = getBidTotal(left);
    const rightTotal = getBidTotal(right);
    const cmp = isSell ? rightTotal - leftTotal : leftTotal - rightTotal;
    return cmp !== 0 ? cmp : new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
  });

  const bidCount = data.bidCount ?? 0;
  const reserveStatus = getReserveStatus(
    data.currentBid,
    data.reservePrice,
    data.auctionType,
  );
  const timeLabel = getTimeRemainingLabel(timeLeft);
  const hasPlacedBid = !!myBid;

  const participantAnalysisContent = (
    <>
      <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
        Participant identities and bid details stay hidden until reveal.
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-[12px] border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/50">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Bidders competing
            </p>
            <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">
              {bidCount}
            </p>
          </div>
          <div className="rounded-[12px] border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/50">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Reserve status
            </p>
            <p className="mt-2 text-lg font-bold tracking-tight">
              {reserveStatus === "met" ? (
                <span className="text-emerald-600 dark:text-emerald-400">
                  Met
                </span>
              ) : reserveStatus === "not_met" ? (
                <span className="text-amber-600 dark:text-amber-400">
                  Not met
                </span>
              ) : (
                <span className="text-slate-500 dark:text-slate-400">
                  —
                </span>
              )}
            </p>
          </div>
          <div className="rounded-[12px] border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/50">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Time remaining
            </p>
            <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
              {timeLabel}
            </p>
          </div>
          <div className="rounded-[12px] border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/50">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Your bid
            </p>
            <p className="mt-2 text-lg font-bold">
              {hasPlacedBid ? (
                <span className="text-emerald-600 dark:text-emerald-400">
                  Placed
                </span>
              ) : (
                <span className="text-slate-500 dark:text-slate-400">
                  Not yet
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Bid activity
          </p>
          <div className="h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-primary/70 transition-all duration-500 ease-out"
              style={{
                width: `${Math.min(100, bidCount * 15)}%`,
              }}
            />
          </div>
          <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
            {bidCount} {bidCount === 1 ? "bid" : "bids"} recorded
          </p>
        </div>
    </>
  );

  return (
    <CollapsibleSection
      title="Bid activity"
      icon="analytics"
      defaultOpen={false}
      badge={
        isCreator ? (
          <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
            Creator view
          </span>
        ) : null
      }
    >
      {isCreator ? (
        <>
          <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
            {bids.length} {bids.length === 1 ? "bid" : "bids"} recorded.
            {isRevealed
              ? isSell
                ? " Sorted by highest amount."
                : " Sorted by lowest amount."
              : " Sorted by latest submission."}
          </p>

          {sortedBids.length === 0 ? (
            <div className="py-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                <span className="material-symbols-outlined text-2xl text-slate-400">
                  person_off
                </span>
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                No bids yet
              </h4>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Bid activity will appear here once participants submit offers.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-1">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:bg-slate-800/40">
                  <tr>
                    <th className="px-3 py-3">Bidder</th>
                    <th className="px-3 py-3">Amount</th>
                    {data.priceTiers && data.priceTiers.length > 0 ? (
                      <th className="px-3 py-3">Qty</th>
                    ) : null}
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3 text-right">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
                  {sortedBids.map((bid, index) => {
                    const isLeader = isRevealed && index === 0;

                    return (
                      <tr
                        key={bid.id}
                        className={`transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30 ${
                          isLeader ? "bg-amber-50/50 dark:bg-amber-900/10" : ""
                        }`}
                      >
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${isLeader ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"}`}>
                              <span className="material-symbols-outlined text-base">
                                {isLeader ? "emoji_events" : "person"}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">
                                BIDDER-{bid.bidderId.substring(0, 8)}...
                              </p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                {isLeader && isRevealed
                                  ? isSell
                                    ? "Current winner"
                                    : "Best offer"
                                  : "Bid submitted"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className={`text-sm font-bold ${isLeader ? "text-amber-700 dark:text-amber-300" : "text-slate-900 dark:text-white"}`}>
                            {isRevealed
                              ? formatBidDisplay(bid, data.currency)
                              : "Hidden until reveal"}
                          </span>
                        </td>
                        {data.priceTiers && data.priceTiers.length > 0 ? (
                          <td className="px-3 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {bid.quantity ?? "—"}
                          </td>
                        ) : null}
                        <td className="px-3 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] ${
                            isLeader
                              ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                              : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                          }`}>
                            {isLeader
                              ? isSell
                                ? "Winning"
                                : "Best"
                              : "Submitted"}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-right text-xs text-slate-500 dark:text-slate-400">
                          {new Date(bid.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        participantAnalysisContent
      )}
    </CollapsibleSection>
  );
}
