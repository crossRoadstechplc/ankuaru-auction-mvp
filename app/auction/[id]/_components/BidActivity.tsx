"use client";

import { Auction, Bid } from "../../../../lib/types";

interface BidActivityProps {
  data: Auction;
  bids: Bid[];
  isCreator: boolean;
}

function formatBidAmount(amount?: string | null): string {
  return amount ? `ETB ${amount}` : "Hidden";
}

export function BidActivity({ data, bids, isCreator }: BidActivityProps) {
  const isSell = data.auctionType === "SELL";
  const isRevealed = data.status === "REVEAL" || data.status === "CLOSED";

  const sortedBids = [...(bids || [])].sort((left, right) => {
    if (!isRevealed) {
      return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
    }

    const leftAmount = parseFloat(left.revealedAmount || "0");
    const rightAmount = parseFloat(right.revealedAmount || "0");
    return isSell ? rightAmount - leftAmount : leftAmount - rightAmount;
  });

  return (
    <section className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white shadow-[0_24px_90px_-64px_rgba(15,23,42,0.38)] dark:border-slate-800 dark:bg-slate-900">
      {isCreator ? (
        <>
          <div className="border-b border-slate-200/70 bg-slate-50/70 px-5 py-4 dark:border-slate-800 dark:bg-slate-800/30 sm:px-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-black text-slate-900 dark:text-white">
                  <span className="material-symbols-outlined text-primary">
                    analytics
                  </span>
                  Bid activity
                </h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {bids.length} {bids.length === 1 ? "bid" : "bids"} recorded.
                  {" "}
                  {isRevealed
                    ? isSell
                      ? "Sorted by highest amount."
                      : "Sorted by lowest amount."
                    : "Sorted by latest submission."}
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/8 px-3 py-1.5 text-xs font-semibold text-primary">
                <span className="material-symbols-outlined text-base">
                  gavel
                </span>
                Creator view
              </div>
            </div>
          </div>

          {sortedBids.length === 0 ? (
            <div className="px-6 py-14 text-center">
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
            <div className="overflow-x-auto">
              <table className="min-w-full text-left">
                <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400 dark:bg-slate-800/40">
                  <tr>
                    <th className="px-5 py-4 sm:px-6">Bidder</th>
                    <th className="px-5 py-4 sm:px-6">Amount</th>
                    <th className="px-5 py-4 sm:px-6">Status</th>
                    <th className="px-5 py-4 text-right sm:px-6">Submitted</th>
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
                        <td className="px-5 py-4 sm:px-6">
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
                        <td className="px-5 py-4 sm:px-6">
                          <span className={`text-sm font-bold ${isLeader ? "text-amber-700 dark:text-amber-300" : "text-slate-900 dark:text-white"}`}>
                            {isRevealed
                              ? formatBidAmount(bid.revealedAmount)
                              : "Hidden until reveal"}
                          </span>
                        </td>
                        <td className="px-5 py-4 sm:px-6">
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
                        <td className="px-5 py-4 text-right text-xs text-slate-500 dark:text-slate-400 sm:px-6">
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
        <div className="px-6 py-14 text-center sm:px-8">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
            <span className="material-symbols-outlined text-2xl text-slate-400">
              shield_person
            </span>
          </div>
          <h4 className="text-lg font-black text-slate-900 dark:text-white">
            Bid activity stays private
          </h4>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
            Participant identities and bid details stay hidden until reveal. You
            can only track the overall activity and your own bid state.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary/8 px-3 py-1.5 text-xs font-semibold text-primary">
            <span className="material-symbols-outlined text-base">bar_chart</span>
            {bids.length} total {bids.length === 1 ? "bid" : "bids"}
          </div>
        </div>
      )}
    </section>
  );
}
