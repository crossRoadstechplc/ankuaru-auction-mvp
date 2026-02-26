"use client";

import { Auction, Bid } from "../../../../lib/types";

interface BidActivityProps {
  data: Auction;
  bids: Bid[];
  isCreator: boolean;
}

export function BidActivity({ data, bids, isCreator }: BidActivityProps) {
  const isSell = data.auctionType === "SELL";
  const isRevealed = data.status === "REVEAL" || data.status === "CLOSED";

  // Sort bids by creation time if not revealed, otherwise by amount
  const sortedBids = [...bids].sort((a, b) => {
    if (!isRevealed) return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

    const amountA = parseFloat(a.revealedAmount || "0");
    const amountB = parseFloat(b.revealedAmount || "0");
    return isSell ? amountB - amountA : amountA - amountB;
  });

  return (
    <section className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      {isCreator ? (
        <>
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-wrap justify-between items-center gap-4 bg-slate-50/50 dark:bg-slate-800/30">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">analytics</span>
              Participants Log <span className="text-sm font-normal text-slate-400">({bids.length} responses)</span>
            </h3>
            <div className="text-xs font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
              Sorted by: <span className="text-primary">{isRevealed ? (isSell ? "Highest Price" : "Lowest Price") : "Recent Activity"}</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">Bidder ID</th>
                  <th className="px-6 py-4">Offer Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedBids.map((bid, idx) => (
                  <tr key={bid.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                          BIDDER-{bid.bidderId.substring(0, 8)}...
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold ${idx === 0 && isRevealed ? "text-primary" : "text-slate-600 dark:text-slate-300"}`}>
                        {isRevealed ? (bid.revealedAmount ? `ETB ${bid.revealedAmount}` : "Hidden") : "•••••••"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${idx === 0 && isRevealed ? "bg-primary/20 text-primary" : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"}`}>
                        {isRevealed && idx === 0 ? (isSell ? "WINNING BID" : "BEST OFFER") : "BID SUBMITTED"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-[10px] text-slate-400 font-medium">
                        {new Date(bid.createdAt).toLocaleTimeString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="text-center py-16 p-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
            <span className="material-symbols-outlined text-slate-400 text-3xl">shield_person</span>
          </div>
          <h4 className="text-lg font-bold mb-1">Bidder Confidentiality</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            Personalized logs and bidder identities are encrypted. You can only see your own activity and the collective total of <span className="font-bold text-primary">{bids.length} bids</span>.
          </p>
        </div>
      )}
    </section>
  );
}
