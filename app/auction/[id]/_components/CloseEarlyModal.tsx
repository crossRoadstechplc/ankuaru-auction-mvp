"use client";

import { useState } from "react";
import { toast } from "sonner";
import apiClient from "../../../../lib/api";

interface CloseEarlyModalProps {
  auctionId: string;
  auctionTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onClosed: () => void;
}

export function CloseEarlyModal({
  auctionId,
  auctionTitle,
  isOpen,
  onClose,
  onClosed,
}: CloseEarlyModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleCloseEarly = async () => {
    if (!auctionId) return;

    try {
      setIsClosing(true);
      await apiClient.closeAuction(auctionId);
      
      toast.success("Auction closed successfully!");
      onClosed();
    } catch (error) {
      console.error("Failed to close auction:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to close auction"
      );
    } finally {
      setIsClosing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 shadow-xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-red-600 dark:text-red-400">
              block
            </span>
          </div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Close Auction Early
          </h2>
        </div>

        <div className="mb-6">
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            Are you sure you want to close this auction early?
          </p>
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-xs font-medium text-amber-800 dark:text-amber-200">
              <strong>Warning:</strong> Closing early will end all bidding immediately
              and move to the reveal phase if bids were placed.
            </p>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            <strong>Auction:</strong> {auctionTitle}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isClosing}
            className="flex-1 py-2 px-4 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleCloseEarly}
            disabled={isClosing}
            className="flex-1 py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isClosing ? (
              <>
                <span className="material-symbols-outlined animate-spin text-sm">
                  refresh
                </span>
                Closing...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">
                  block
                </span>
                Close Early
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
