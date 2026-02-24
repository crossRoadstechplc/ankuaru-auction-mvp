"use client";

import { useEffect, useState } from "react";
import { Bid } from "../../../../lib/types";

interface FinalReportModalProps {
  auction: {
    id: string;
    title: string;
    minBid: string;
    reservePrice: string;
    currentBid?: string;
    winningBid?: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function FinalReportModal({
  auction,
  isOpen,
  onClose,
}: FinalReportModalProps) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen || !auction.id) return;

    const fetchBids = async () => {
      try {
        // Since there's no getAuctionBids method, we'll need to implement this
        // For now, let's use a placeholder or skip bids display
        setBids([]);
      } catch (error) {
        console.error("Failed to fetch auction bids:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBids();
  }, [isOpen, auction.id]);

  if (!isOpen) return null;

  const revealedBids = bids.filter((bid) => bid.revealed);
  const winningBid =
    revealedBids.length > 0
      ? revealedBids.reduce((prev, current) =>
        parseFloat(current.amount || "0") > parseFloat(prev.amount || "0")
          ? current
          : prev,
      )
      : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">
                description
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Auction Report
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">
              close
            </span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <span className="material-symbols-outlined animate-spin text-2xl text-slate-400">
                refresh
              </span>
            </div>
          ) : (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase mb-1">
                    Total Bids
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {bids.length}
                  </p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-xs font-medium text-green-600 dark:text-green-400 uppercase mb-1">
                    Winning Bid
                  </p>
                  <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                    {auction.winningBid
                      ? `ETB ${auction.winningBid}`
                      : winningBid
                        ? `ETB ${winningBid.amount || "0"}`
                        : "None"}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase mb-1">
                    Reserve Price
                  </p>
                  <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                    ETB {auction.reservePrice}
                  </p>
                </div>
              </div>

              {/* Bids Table */}
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    Bid Details
                  </h3>
                </div>
                {revealedBids.length === 0 ? (
                  <div className="p-8 text-center">
                    <span className="material-symbols-outlined text-3xl text-slate-400 mb-2">
                      visibility_off
                    </span>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      No bids have been revealed yet
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-slate-100 dark:bg-slate-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                            Bidder
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                            Amount
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                            Status
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                            Time
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {revealedBids
                          .sort(
                            (a, b) =>
                              parseFloat(b.amount || "0") -
                              parseFloat(a.amount || "0"),
                          )
                          .map((bid) => (
                            <tr
                              key={bid.id}
                              className={
                                winningBid?.id === bid.id
                                  ? "bg-green-50 dark:bg-green-900/20"
                                  : "bg-white dark:bg-slate-900"
                              }
                            >
                              <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                                {bid.bidderId || "Anonymous"}
                              </td>
                              <td className="px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                                ETB {bid.amount || "0"}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                                  <span className="material-symbols-outlined text-xs">
                                    check_circle
                                  </span>
                                  Revealed
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                                {new Date(bid.createdAt).toLocaleString()}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
