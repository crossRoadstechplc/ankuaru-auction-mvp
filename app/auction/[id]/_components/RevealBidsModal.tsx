"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import apiClient from "../../../../lib/api";
import { AuctionCloseResponse, Bid } from "../../../../lib/types";

interface RevealBidsModalProps {
    auction: {
        id: string;
        title: string;
        auctionCategory: string;
        itemDescription: string;
        reservePrice: string;
        minBid: string;
        auctionType: "SELL" | "BUY";
        bidCount?: number;
        startAt: string;
        endAt: string;
        status: string;
        createdBy: string;
    };
    isOpen: boolean;
    onClose: () => void;
}

export function RevealBidsModal({
    auction,
    isOpen,
    onClose,
}: RevealBidsModalProps) {
    const router = useRouter();
    const [bids, setBids] = useState<Bid[]>([]);
    const [loading, setLoading] = useState(true);
    const [isClosing, setIsClosing] = useState(false);
    const [closeResult, setCloseResult] = useState<AuctionCloseResponse | null>(
        null,
    );

    useEffect(() => {
        if (!isOpen || !auction.id) return;

        const fetchBids = async () => {
            try {
                setLoading(true);
                const fetchedBids = await apiClient.getAuctionBids(auction.id);
                setBids(fetchedBids);
            } catch (error) {
                console.error("Failed to fetch auction bids:", error);
                toast.error("Failed to load bids");
            } finally {
                setLoading(false);
            }
        };

        fetchBids();
    }, [isOpen, auction.id]);

    const handleCloseAuction = async () => {
        try {
            setIsClosing(true);
            const result = await apiClient.closeAuction(auction.id);
            setCloseResult(result);
            toast.success("Auction closed successfully!");
        } catch (error) {
            console.error("Failed to close auction:", error);
            toast.error(
                error instanceof Error ? error.message : "Failed to close auction",
            );
        } finally {
            setIsClosing(false);
        }
    };

    const handleDismiss = () => {
        onClose();
        router.push("/dashboard");
    };

    if (!isOpen) return null;

    const isSell = auction.auctionType === "SELL";

    // Sort bids by amount (highest first for SELL, lowest first for BUY)
    const sortedBids = [...bids].sort((a, b) => {
        const amountA = parseFloat(a.amount || "0");
        const amountB = parseFloat(b.amount || "0");
        return isSell ? amountB - amountA : amountA - amountB;
    });

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div
                className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
                style={{ animation: "slideUp 0.3s ease-out" }}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-r from-primary/5 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                            <span className="material-symbols-outlined text-white text-2xl">
                                visibility
                            </span>
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                                {closeResult ? "Auction Closed" : "Reveal Bids"}
                            </h2>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                {auction.title}
                            </p>
                        </div>
                    </div>
                    {!closeResult && (
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <span className="material-symbols-outlined text-slate-500 dark:text-slate-400">
                                close
                            </span>
                        </button>
                    )}
                </div>

                <div className="p-6 overflow-y-auto max-h-[65vh]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-16">
                            <span className="material-symbols-outlined animate-spin text-4xl text-primary mb-4">
                                refresh
                            </span>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                Loading bids...
                            </p>
                        </div>
                    ) : closeResult ? (
                        /* ───── CLOSE RESULT VIEW ───── */
                        <div className="space-y-6">
                            {/* Success Banner */}
                            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white text-center shadow-lg shadow-emerald-500/20">
                                <span className="material-symbols-outlined text-5xl mb-3 block">
                                    celebration
                                </span>
                                <h3 className="text-xl font-bold mb-1">
                                    Auction Closed Successfully!
                                </h3>
                                <p className="text-emerald-100 text-sm">
                                    All bidders have been notified of the results.
                                </p>
                            </div>

                            {/* Winner Card */}
                            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl p-6 border-2 border-amber-200 dark:border-amber-700">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-2xl">
                                        emoji_events
                                    </span>
                                    <h4 className="text-lg font-bold text-amber-900 dark:text-amber-100">
                                        Winner Details
                                    </h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                                            Winner ID
                                        </p>
                                        <p className="text-sm font-mono font-bold text-slate-900 dark:text-white break-all">
                                            {closeResult.auction.winnerId}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                                            Winning Bid
                                        </p>
                                        <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
                                            ${closeResult.auction.winningBid}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                                            Total Bids
                                        </p>
                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                                            {closeResult.auction.bidCount}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                        <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                                            Closed At
                                        </p>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                                            {new Date(
                                                closeResult.auction.closedAt,
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Auction Summary */}
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-5 border border-slate-200 dark:border-slate-700">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg text-slate-500">
                                        summarize
                                    </span>
                                    Auction Summary
                                </h4>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <span className="text-slate-500 dark:text-slate-400">
                                            Title:
                                        </span>{" "}
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            {closeResult.auction.title}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 dark:text-slate-400">
                                            Category:
                                        </span>{" "}
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            {closeResult.auction.auctionCategory}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 dark:text-slate-400">
                                            Reserve Price:
                                        </span>{" "}
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            ${closeResult.auction.reservePrice}
                                        </span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500 dark:text-slate-400">
                                            Min Bid:
                                        </span>{" "}
                                        <span className="font-medium text-slate-900 dark:text-white">
                                            ${closeResult.auction.minBid}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Notification Status */}
                            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl mt-0.5">
                                        notifications_active
                                    </span>
                                    <div>
                                        <h4 className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-1">
                                            Notifications Sent
                                        </h4>
                                        <p className="text-xs text-blue-700 dark:text-blue-300">
                                            All bidders have been notified of the auction closing. The
                                            winner has been sent a notification with a link for
                                            further action.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Go to Dashboard */}
                            <button
                                onClick={handleDismiss}
                                className="w-full py-4 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/30 transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-lg">
                                    dashboard
                                </span>
                                Go to Dashboard
                            </button>
                        </div>
                    ) : (
                        /* ───── BIDS LIST VIEW ───── */
                        <div className="space-y-6">
                            {/* Auction Info Summary */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                                        Category
                                    </p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                        {auction.auctionCategory}
                                    </p>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                                        Reserve Price
                                    </p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                        ${auction.reservePrice}
                                    </p>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                                        Min Bid
                                    </p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                        ${auction.minBid}
                                    </p>
                                </div>
                                <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-center">
                                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">
                                        Total Bids
                                    </p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                                        {bids.length}
                                    </p>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">
                                    Item Description
                                </p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">
                                    {auction.itemDescription}
                                </p>
                            </div>

                            {/* Bidders Table */}
                            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary text-lg">
                                        group
                                    </span>
                                    <h3 className="font-bold text-slate-900 dark:text-white">
                                        All Bidders ({bids.length})
                                    </h3>
                                </div>
                                {bids.length === 0 ? (
                                    <div className="p-12 text-center">
                                        <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600 mb-3 block">
                                            person_off
                                        </span>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                                            No bids have been placed on this auction
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-100 dark:bg-slate-700/50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                        #
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                        Bidder ID
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                        Amount
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                        Status
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                        Submitted
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                                {sortedBids.map((bid, index) => (
                                                    <tr
                                                        key={bid.id}
                                                        className={`transition-colors ${index === 0
                                                                ? "bg-amber-50/50 dark:bg-amber-900/10"
                                                                : "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                                            }`}
                                                    >
                                                        <td className="px-4 py-3 text-sm">
                                                            {index === 0 ? (
                                                                <span className="material-symbols-outlined text-amber-500 text-lg">
                                                                    emoji_events
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-400 font-mono font-bold">
                                                                    {index + 1}
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <p className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                                                                {bid.bidderId}
                                                            </p>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span
                                                                className={`text-sm font-bold ${index === 0
                                                                        ? "text-amber-700 dark:text-amber-300"
                                                                        : "text-slate-900 dark:text-white"
                                                                    }`}
                                                            >
                                                                {bid.amount
                                                                    ? `$${bid.amount}`
                                                                    : "Hidden"}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {bid.revealed ? (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-[10px] font-bold uppercase">
                                                                    <span className="material-symbols-outlined text-xs">
                                                                        check_circle
                                                                    </span>
                                                                    Revealed
                                                                </span>
                                                            ) : (
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-full text-[10px] font-bold uppercase">
                                                                    <span className="material-symbols-outlined text-xs">
                                                                        visibility_off
                                                                    </span>
                                                                    Hidden
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                                                            {new Date(bid.createdAt).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>

                            {/* Close Auction Button */}
                            <button
                                onClick={handleCloseAuction}
                                disabled={isClosing}
                                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-bold text-sm shadow-lg shadow-red-500/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isClosing ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin text-lg">
                                            refresh
                                        </span>
                                        Closing Auction...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-lg">
                                            gavel
                                        </span>
                                        Close Auction &amp; Declare Winner
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
        </div>
    );
}
