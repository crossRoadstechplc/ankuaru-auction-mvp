"use client";

import { Card } from "@/components/ui/card";
import { Auction, BidAccessRequest } from "@/lib/types";
import {
  useApproveBidRequestMutation,
  useAuctionBidRequestsQuery,
  useMyBidRequestsQuery,
  usePlaceBidMutation,
  useRejectBidRequestMutation,
  useRequestBidAccessMutation,
} from "@/src/features/bids/queries/hooks";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useBiddingState } from "../../../../hooks/useBiddingState";
import { useCountdownTimer } from "../../../../hooks/useCountdownTimer";
import { useAuthStore } from "../../../../stores/auth.store";
import { CloseEarlyModal } from "./CloseEarlyModal";
import { FinalReportModal } from "./FinalReportModal";
import { RevealBidsModal } from "./RevealBidsModal";

const OWNER_REQUESTS_POLL_INTERVAL_MS = 5000;
const PARTICIPANT_REQUESTS_POLL_INTERVAL_MS = 10000;

interface BiddingSidebarProps {
  data: Auction;
  isCreator: boolean;
  onAuctionUpdate?: () => void;
}

function normalizeRequestStatus(status?: string): string {
  return (status ?? "PENDING").toUpperCase();
}

function formatRequestStatus(status?: string): string {
  const normalized = normalizeRequestStatus(status);
  return normalized.charAt(0) + normalized.slice(1).toLowerCase();
}

function getRequestDisplayName(request: BidAccessRequest): string {
  const fullName = request.requester.fullName?.trim();
  if (fullName) {
    return fullName;
  }

  const username = request.requester.username?.trim();
  if (username) {
    return username;
  }

  return request.requester.id
    ? `User ${request.requester.id.slice(0, 8)}...`
    : "Unknown requester";
}

function getLatestAuctionBidRequest(
  requests: BidAccessRequest[],
  auctionId: string,
): BidAccessRequest | null {
  const latestRequest = requests
    .filter((request) => request.auctionId === auctionId)
    .sort((left, right) => {
      const leftTime = new Date(left.createdAt).getTime();
      const rightTime = new Date(right.createdAt).getTime();
      return rightTime - leftTime;
    })[0];

  return latestRequest ?? null;
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function BiddingSidebar({
  data,
  isCreator: isCreatorProp,
  onAuctionUpdate,
}: BiddingSidebarProps) {
  const isSell = data.auctionType === "SELL";
  const userId = useAuthStore((state) => state.userId);
  const isCreator = isCreatorProp || userId === data.createdBy;

  // --- Custom hooks for state management ---
  const timeLeft = useCountdownTimer(data.startAt, data.endAt, data.status);
  const biddingState = useBiddingState(data.id);
  const {
    bidAmount,
    setBidAmount,
    localBid,
    hasPlacedBid,
    setHasPlacedBid,
    saveBidLocally,
    refetchMyBid,
    myBid,
  } = biddingState;

  // --- Modal states ---
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showRevealBidsModal, setShowRevealBidsModal] = useState(false);
  const [activeRequestActionId, setActiveRequestActionId] = useState<
    string | null
  >(null);

  // --- React Query hooks ---
  const placeBidMutation = usePlaceBidMutation();
  const requestBidAccessMutation = useRequestBidAccessMutation();
  const approveBidRequestMutation = useApproveBidRequestMutation();
  const rejectBidRequestMutation = useRejectBidRequestMutation();

  const { days, hours, minutes, seconds, shouldReveal, timeUntilStart } =
    timeLeft;

  // Determine actual auction status based on time and backend status
  const actualStatus =
    data.status === "SCHEDULED"
      ? "SCHEDULED"
      : shouldReveal && data.status === "OPEN"
        ? "REVEAL"
        : data.status;
  const isScheduledPhase = actualStatus === "SCHEDULED";
  const isRevealPhase = actualStatus === "REVEAL";
  const isClosedPhase = actualStatus === "CLOSED";
  const isOpenPhase = !isScheduledPhase && !isRevealPhase && !isClosedPhase;
  const now = new Date().getTime();
  const start = new Date(data.startAt).getTime();
  const end = new Date(data.endAt).getTime();
  const progressPercent =
    data.status === "SCHEDULED"
      ? (() => {
          const totalDuration = start - new Date(data.createdAt).getTime();
          const elapsed = now - new Date(data.createdAt).getTime();
          if (totalDuration <= 0) return 0;
          return Math.max(0, Math.min(100, (1 - elapsed / totalDuration) * 100));
        })()
      : (() => {
          const totalDuration = end - start;
          const remaining = end - now;
          if (totalDuration <= 0) return 0;
          return Math.max(0, Math.min(100, (remaining / totalDuration) * 100));
        })();
  const circleRadius = 62;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = circleCircumference * (1 - progressPercent / 100);

  const shouldTrackMyBidRequests =
    !isCreator &&
    !isClosedPhase &&
    (data.canBid === false || !!data.hasRequestedBidAccess);
  const { data: myBidRequests = [] } = useMyBidRequestsQuery({
    enabled: shouldTrackMyBidRequests,
    refetchInterval:
      shouldTrackMyBidRequests &&
      isOpenPhase &&
      data.hasRequestedBidAccess &&
      data.canBid === false
        ? PARTICIPANT_REQUESTS_POLL_INTERVAL_MS
        : false,
    refetchOnWindowFocus: false,
  });
  const currentBidRequest = useMemo(
    () => getLatestAuctionBidRequest(myBidRequests, data.id),
    [data.id, myBidRequests],
  );
  const currentBidRequestStatus = currentBidRequest
    ? normalizeRequestStatus(currentBidRequest.status)
    : null;
  const canUserBid = !isCreator && data.canBid !== false;
  const hasRejectedBidAccessRequest = currentBidRequestStatus === "REJECTED";
  const hasPendingBidAccessRequest =
    !canUserBid &&
    (currentBidRequestStatus === "PENDING" ||
      (!!data.hasRequestedBidAccess && currentBidRequestStatus !== "REJECTED"));
  const hasApprovedBidAccessRequest =
    !canUserBid && currentBidRequestStatus === "APPROVED";

  const shouldLoadAuctionBidRequests =
    isCreator && !isScheduledPhase && !isClosedPhase;
  const {
    data: auctionBidRequests = [],
    isLoading: isAuctionBidRequestsLoading,
  } = useAuctionBidRequestsQuery(data.id, {
    enabled: shouldLoadAuctionBidRequests,
    refetchInterval:
      shouldLoadAuctionBidRequests && isOpenPhase
        ? OWNER_REQUESTS_POLL_INTERVAL_MS
        : false,
    refetchOnWindowFocus: false,
  });
  const pendingBidRequests = useMemo(
    () =>
      auctionBidRequests.filter(
        (request) => normalizeRequestStatus(request.status) === "PENDING",
      ),
    [auctionBidRequests],
  );

  const handleBidSubmit = async () => {
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      toast.warning("Please enter a valid bid amount");
      return;
    }

    if (!userId) {
      toast.error("Please login to place a bid");
      return;
    }

    // Check if user has already placed a bid (both server state and local state)
    if (myBid || hasPlacedBid) {
      toast.error(
        "You have already placed a bid on this auction. Only one bid per auction is allowed.",
      );
      return;
    }

    try {
      setHasPlacedBid(true);

      await placeBidMutation.mutateAsync({
        auctionId: data.id,
        amount: bidAmount,
      });

      toast.success("Bid submitted. Your bid stays hidden until the reveal phase.");

      const nonce = Math.random().toString(36).substring(2, 15);
      saveBidLocally(bidAmount, nonce);

      setBidAmount("");

      await refetchMyBid();
    } catch (error) {
      setHasPlacedBid(false);
      toast.error(getErrorMessage(error, "Failed to submit bid."));
    }
  };

  const handleRequestBidAccess = async () => {
    if (!userId) {
      toast.error("Please login to request bid access");
      return;
    }

    try {
      await requestBidAccessMutation.mutateAsync(data.id);
      toast.success("Bid access request sent to the auction creator.");
      onAuctionUpdate?.();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to request bid access."));
    }
  };

  const handleApproveBidRequest = async (requestId: string) => {
    setActiveRequestActionId(requestId);

    try {
      await approveBidRequestMutation.mutateAsync({
        requestId,
        auctionId: data.id,
      });
      toast.success("Bid access approved.");
      onAuctionUpdate?.();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to approve bid access."));
    } finally {
      setActiveRequestActionId(null);
    }
  };

  const handleRejectBidRequest = async (requestId: string) => {
    setActiveRequestActionId(requestId);

    try {
      await rejectBidRequestMutation.mutateAsync({
        requestId,
        auctionId: data.id,
      });
      toast.success("Bid access request rejected.");
      onAuctionUpdate?.();
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to reject bid access."));
    } finally {
      setActiveRequestActionId(null);
    }
  };

  const renderBidAccessGate = () => {
    if (hasApprovedBidAccessRequest) {
      return (
        <div className="text-center py-4">
          <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-emerald-500 text-3xl">
              verified
            </span>
          </div>
          <h3 className="text-xl font-bold mb-2">Access Approved</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
            Your bid access was approved. Refresh the auction status to unlock
            bidding.
          </p>
          <button
            type="button"
            onClick={() => onAuctionUpdate?.()}
            className="w-full bg-primary hover:opacity-90 text-white py-3 rounded-xl font-bold text-sm shadow-lg transition-all"
          >
            Refresh Bid Access
          </button>
        </div>
      );
    }

    if (hasPendingBidAccessRequest) {
      return (
        <div className="text-center py-4">
          <div className="h-16 w-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-amber-500 text-3xl">
              pending_actions
            </span>
          </div>
          <h3 className="text-xl font-bold mb-2">Bid Access Requested</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
            Your request is pending creator approval. You can bid as soon as it
            is approved.
          </p>
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 text-left">
            <p className="text-[10px] text-amber-600 dark:text-amber-300 font-bold uppercase mb-1">
              Request Status
            </p>
            <p className="text-sm font-bold text-amber-900 dark:text-amber-100">
              {formatRequestStatus(currentBidRequest?.status)}
            </p>
            {currentBidRequest?.createdAt ? (
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-2">
                Requested on{" "}
                {new Date(currentBidRequest.createdAt).toLocaleString()}
              </p>
            ) : null}
          </div>
        </div>
      );
    }

    if (hasRejectedBidAccessRequest) {
      return (
        <div className="text-center py-4">
          <div className="h-16 w-16 bg-rose-100 dark:bg-rose-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-rose-500 text-3xl">
              block
            </span>
          </div>
          <h3 className="text-xl font-bold mb-2">Bid Access Rejected</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
            The creator rejected your bid access request. You can request again
            if the auction terms change.
          </p>
          <button
            type="button"
            onClick={handleRequestBidAccess}
            className="w-full bg-primary hover:opacity-90 text-white py-3 rounded-xl font-bold text-sm shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={requestBidAccessMutation.isPending}
          >
            {requestBidAccessMutation.isPending
              ? "Sending Request..."
              : "Request Access Again"}
          </button>
        </div>
      );
    }

    return (
      <div className="text-center py-4">
        <div className="h-16 w-16 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-violet-500 text-3xl">
            lock_open
          </span>
        </div>
        <h3 className="text-xl font-bold mb-2">Request Bid Access</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
          You cannot bid on this auction yet. Send a request to the creator to
          unlock bidding access.
        </p>
        <button
          type="button"
          onClick={handleRequestBidAccess}
          className="w-full bg-primary hover:opacity-90 text-white py-3 rounded-xl font-bold text-sm shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={requestBidAccessMutation.isPending}
        >
          {requestBidAccessMutation.isPending
            ? "Sending Request..."
            : "Request Bid Access"}
        </button>
      </div>
    );
  };

  const renderCreatorBidRequestPanel = () => {
    if (!shouldLoadAuctionBidRequests) {
      return null;
    }

    return (
      <div className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              Bid Access Requests
            </p>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-1">
              Review who can join this auction before they place a bid.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-wider">
            {pendingBidRequests.length} Pending
          </span>
        </div>

        {isAuctionBidRequestsLoading ? (
          <div className="space-y-3">
            <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          </div>
        ) : pendingBidRequests.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-4 text-center">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              No pending bid access requests.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              New requests will appear here while the auction is active.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingBidRequests.map((request) => {
              const isActionPending = activeRequestActionId === request.id;

              return (
                <div
                  key={request.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                        {getRequestDisplayName(request)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                        {request.requester.username
                          ? `@${request.requester.username}`
                          : request.requester.id}
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        Requested {new Date(request.createdAt).toLocaleString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleRejectBidRequest(request.id)}
                        className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isActionPending}
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApproveBidRequest(request.id)}
                        className="px-3 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isActionPending}
                      >
                        {isActionPending ? "Saving..." : "Approve"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Countdown Card */}
      <div
        className={`${
          isClosedPhase
            ? "bg-slate-700"
            : isRevealPhase
              ? "bg-orange-600 dark:bg-orange-600/90"
              : isScheduledPhase
                ? "bg-blue-600 dark:bg-blue-600/90"
                : "bg-primary dark:bg-primary/90"
        } rounded-[18px] p-5 text-white shadow-[0_24px_90px_-52px_rgba(15,23,42,0.58)]`}
      >
        <p className="mb-4 text-center text-[11px] font-black uppercase tracking-[0.18em] opacity-80">
          {isClosedPhase
            ? "Auction Closed"
            : isRevealPhase
              ? "Reveal Phase"
              : isScheduledPhase
                ? "Auction Starts In"
                : "Auction Ends In"}
        </p>

        {/* Circular Timer */}
        {!isClosedPhase && !isRevealPhase
          ? (() => {
              const displayDays =
                isScheduledPhase && timeUntilStart ? timeUntilStart.days : days;
              const displayHours =
                isScheduledPhase && timeUntilStart
                  ? timeUntilStart.hours
                  : hours;
              const displayMinutes =
                isScheduledPhase && timeUntilStart
                  ? timeUntilStart.minutes
                  : minutes;
              const displaySeconds =
                isScheduledPhase && timeUntilStart
                  ? timeUntilStart.seconds
                  : seconds;

              return (
                <div className="flex flex-col items-center">
                  {/* Circular Progress Ring */}
                  <div className="relative" style={{ width: 160, height: 160 }}>
                    <svg
                      width="160"
                      height="160"
                      viewBox="0 0 160 160"
                      className="transform -rotate-90"
                    >
                      {/* Background track */}
                      <circle
                        cx="80"
                        cy="80"
                        r={circleRadius}
                        fill="none"
                        stroke="rgba(255,255,255,0.15)"
                        strokeWidth="8"
                      />
                      {/* Progress arc */}
                      <circle
                        cx="80"
                        cy="80"
                        r={circleRadius}
                        fill="none"
                        stroke="rgba(255,255,255,0.9)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circleCircumference}
                        strokeDashoffset={strokeDashoffset}
                        style={{ transition: "stroke-dashoffset 1s linear" }}
                      />
                      {/* Glowing dot at the tip */}
                      <circle
                        cx="80"
                        cy="80"
                        r={circleRadius}
                        fill="none"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={`2 ${circleCircumference - 2}`}
                        strokeDashoffset={strokeDashoffset}
                        style={{
                          transition: "stroke-dashoffset 1s linear",
                          filter: "drop-shadow(0 0 6px rgba(255,255,255,0.8))",
                        }}
                      />
                    </svg>

                    {/* Center content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      {/* Days (if any) */}
                      {displayDays > 0 && (
                        <p className="text-[11px] font-bold uppercase tracking-widest opacity-70 mb-0.5">
                          {displayDays}d remaining
                        </p>
                      )}

                      {/* Hours & Minutes — small but visible */}
                      <div className="flex items-center gap-1 mb-1">
                        <span className="text-sm font-bold opacity-80">
                          {String(displayHours).padStart(2, "0")}
                        </span>
                        <span className="text-xs opacity-50">h</span>
                        <span className="text-sm font-bold opacity-80">
                          {String(displayMinutes).padStart(2, "0")}
                        </span>
                        <span className="text-xs opacity-50">m</span>
                      </div>

                      {/* Seconds — BIG & distinctive */}
                        <p
                        className="text-4xl font-black tabular-nums leading-none tracking-tight"
                        style={{
                          textShadow: "0 0 20px rgba(255,255,255,0.3)",
                          animation: "secondsPulse 1s ease-in-out infinite",
                        }}
                      >
                        {String(displaySeconds).padStart(2, "0")}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-60 mt-1">
                        Seconds
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()
          : null}

        {isScheduledPhase && (
          <div className="text-center mt-2">
            <span
              className="material-symbols-outlined text-2xl mb-1"
              style={{ opacity: 0.7 }}
            >
              schedule
            </span>
            <p className="text-xs opacity-70">Auction has not started yet</p>
          </div>
        )}
        {isRevealPhase && (
          <div className="text-center">
            <span className="material-symbols-outlined text-3xl mb-2">
              visibility
            </span>
            <p className="text-sm">
              Bids are now closed. Please wait for Creator to reveal bids
            </p>
          </div>
        )}
        {isClosedPhase && (
          <div className="text-center">
            <span className="material-symbols-outlined text-3xl mb-2">
              lock
            </span>
            <p className="text-sm">Auction has ended</p>
          </div>
        )}
      </div>

      {!isCreator ? (
        <Card className="rounded-[18px] border border-slate-200/80 p-5 shadow-[0_24px_90px_-64px_rgba(15,23,42,0.38)] dark:border-slate-800 md:p-6">
          {isScheduledPhase ? (
            <div className="text-center py-4">
              <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-blue-500 text-3xl">
                  schedule
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">Auction Scheduled</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
                This auction has not started yet. Bidding will be available when
                the auction begins.
              </p>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                <p className="text-[10px] text-blue-600 dark:text-blue-300 font-bold uppercase mb-1">
                  Starting Bid
                </p>
                <p className="text-2xl font-black text-blue-900 dark:text-white">
                  {data.minBid}
                </p>
              </div>
              <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                <p>Auction starts: {new Date(data.startAt).toLocaleString()}</p>
              </div>
            </div>
          ) : isClosedPhase ? (
            <div className="text-center py-4">
              <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-slate-400 text-3xl">
                  event_busy
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">Auction Closed</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 font-medium">
                This auction has officially concluded. No further bids are being
                accepted.
              </p>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">
                  Winning Bid
                </p>
                <p className="text-2xl font-black text-primary">
                  {data.winningBid || data.currentBid}
                </p>
              </div>
              <button
                onClick={() => setShowReportModal(true)}
                className="w-full mt-4 bg-primary hover:opacity-90 text-white py-3 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-lg">
                  description
                </span>
                View Auction Report
              </button>
            </div>
          ) : isRevealPhase ? (
            <div className="text-center py-4">
              <div className="h-16 w-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-orange-500 text-3xl">
                  hourglass_top
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">Auction In Reveal Mode</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 font-medium">
                Bidding has ended. The auction owner is currently reviewing all
                bids.
              </p>
              {myBid && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 text-left">
                  <p className="text-[10px] text-blue-600 dark:text-blue-300 font-bold uppercase mb-1">
                    Your Submitted Bid
                  </p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-2xl font-black text-blue-900 dark:text-white">
                      {myBid.amount || localBid?.amount || "Submitted"}
                    </p>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-300 uppercase">
                      ETB
                    </span>
                  </div>
                </div>
              )}
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                <div className="flex items-start gap-3 text-left">
                  <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-xl mt-0.5">
                    info
                  </span>
                  <div>
                    <p className="text-sm font-bold text-amber-900 dark:text-amber-100 mb-1">
                      Waiting for the auction owner
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      Please wait for the auction owner to close the auction.
                      You will be notified once the results are finalized.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : myBid ? (
            <div className="text-center py-4">
              <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <span className="material-symbols-outlined text-emerald-500 text-lg">
                    check_circle
                  </span>
                  <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">
                    Bid Submitted Successfully
                  </p>
                </div>
                <div className="flex items-baseline gap-2 mt-3">
                  <p className="text-3xl font-black text-emerald-900 dark:text-white">
                    {myBid.revealedAmount ||
                      myBid.amount ||
                      localBid?.amount ||
                      "Pending"}
                  </p>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-300 uppercase">
                    ETB
                  </span>
                </div>
              </div>
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3 text-left">
                  <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl mt-0.5">
                    schedule
                  </span>
                  <div>
                    <p className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-1">
                      Waiting for other bids
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Your bid has been recorded. We will notify you when the
                      auction status updates.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : !canUserBid ? (
            renderBidAccessGate()
          ) : (
            <>
              <div className="mb-8">
                <p className="text-sm text-slate-400 font-bold uppercase mb-1">
                  Current Bid
                </p>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                    {data.currentBid || data.minBid}
                  </p>
                  <span className="text-xs font-bold text-slate-400 uppercase">
                    ETB
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 font-display">
                    {isSell ? "Your New Bid" : "Your New Bid"}
                  </label>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      void handleBidSubmit();
                    }}
                  >
                    <div className="relative">
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-slate-400 font-bold ">
                        ETB
                      </span>
                      <input
                        className="ml-12 w-full pl-8 pr-4 py-4 rounded-xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:border-primary focus:ring-0 text-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        type="number"
                        placeholder="Enter amount"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        disabled={
                          placeBidMutation.isPending || !!myBid || hasPlacedBid
                        }
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-primary hover:bg-primary-dark text-white py-5 rounded-xl font-black text-lg shadow-xl shadow-primary/30 transition-all uppercase tracking-widest active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={
                        placeBidMutation.isPending || !!myBid || hasPlacedBid
                      }
                    >
                      {placeBidMutation.isPending ? (
                        <>
                          <span className="material-symbols-outlined animate-spin">
                            refresh
                          </span>
                          Submitting...
                        </>
                      ) : myBid || hasPlacedBid ? (
                        <>
                          <span className="material-symbols-outlined">
                            check_circle
                          </span>
                          Bid Already Placed
                        </>
                      ) : (
                        <>{isSell ? "Submit Your Bid" : "Submit Your Bid"}</>
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}
        </Card>
      ) : (
        <div className="rounded-[18px] border border-slate-200/80 bg-white p-5 shadow-[0_24px_90px_-64px_rgba(15,23,42,0.38)] dark:border-slate-800 dark:bg-slate-900 md:p-6">
          <div className="mb-6 rounded-xl border border-primary/10 bg-primary/5 p-4">
            <p className="text-[10px] text-slate-400 font-bold uppercase mb-1 tracking-widest">
              Administrator Notice
            </p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {isClosedPhase
                ? "This auction is closed. You can view the auction report or relist the item."
                : isRevealPhase
                  ? "Bidding has ended and reveal phase is active. You can review requests, reveal bids, or close the auction."
                  : isScheduledPhase
                    ? "This auction is scheduled and has not started yet. Users cannot bid until the auction begins."
                    : "Bidding is disabled for creators. Review bid access requests and manage the listing from here."}
            </p>
          </div>
          {renderCreatorBidRequestPanel()}
          <div className="space-y-3">
            {isScheduledPhase ? (
              <div className="text-center py-4">
                <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="material-symbols-outlined text-blue-500 text-3xl">
                    schedule
                  </span>
                </div>
                <h3 className="text-lg font-bold mb-2">Auction Scheduled</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                  This auction is scheduled to start at:
                </p>
                <p className="text-sm font-medium text-blue-600 dark:text-blue-300 mb-4">
                  {new Date(data.startAt).toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  No actions available until the auction starts.
                </p>
              </div>
            ) : !isClosedPhase && !isRevealPhase ? (
              <button
                onClick={() => setShowRevealBidsModal(true)}
                className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-lg">
                  visibility
                </span>
                Close Auction Early
              </button>
            ) : isRevealPhase ? (
              <>
                <button
                  onClick={() => setShowRevealBidsModal(true)}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <span className="material-symbols-outlined text-lg">
                    visibility
                  </span>
                  Reveal Bids
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowReportModal(true)}
                  className="w-full py-4 bg-primary hover:opacity-90 text-white rounded-xl font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">
                    description
                  </span>
                  View Auction Report
                </button>
                <button
                  onClick={() => {
                    const params = new URLSearchParams({
                      title: data.title,
                      category: data.auctionCategory,
                      description: data.itemDescription,
                      minBid: data.minBid,
                      type: data.auctionType,
                      visibility: data.visibility,
                    });
                    window.location.href = `/auction/new?relist=true&${params.toString()}`;
                  }}
                  className="w-full py-4 border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">
                    refresh
                  </span>
                  Relist Item
                </button>
              </>
            )}
          </div>

          {/* Modals */}
          <CloseEarlyModal
            auctionId={data.id}
            auctionTitle={data.title}
            isOpen={showCloseModal}
            onClose={() => setShowCloseModal(false)}
            onClosed={() => {
              setShowCloseModal(false);
              if (onAuctionUpdate) onAuctionUpdate();
            }}
          />
          <FinalReportModal
            auction={data}
            isOpen={showReportModal}
            onClose={() => setShowReportModal(false)}
          />
          <RevealBidsModal
            auction={data}
            isOpen={showRevealBidsModal}
            onClose={() => {
              setShowRevealBidsModal(false);
              if (onAuctionUpdate) onAuctionUpdate();
            }}
          />
        </div>
      )}
    </div>
  );
}
