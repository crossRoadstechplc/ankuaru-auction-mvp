"use client";

import { Badge } from "@/components/ui/badge";
import { FollowRequest } from "../../../lib/types";
import { toast } from "sonner";
import {
  useApproveFollowRequestMutation,
  useRejectFollowRequestMutation,
  useUserInfoQuery,
} from "@/src/features/profile/queries/hooks";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface FollowRequestsTabProps {
  requests: FollowRequest[];
  sentRequests: FollowRequest[];
}

function isUnknownFollowRequestUser(value?: string): boolean {
  if (!value) {
    return true;
  }

  return value.startsWith("Unknown ");
}

function FollowRequestUserSummary({
  user,
  dateLabel,
  status,
}: {
  user: FollowRequest["requester"];
  dateLabel: string;
  status?: string;
}) {
  const shouldLookup =
    !!user.id &&
    (isUnknownFollowRequestUser(user.username) || !user.fullName);
  const { data: resolvedUser } = useUserInfoQuery(user.id, shouldLookup);

  const displayName =
    resolvedUser?.fullName ||
    user.fullName ||
    (isUnknownFollowRequestUser(resolvedUser?.username)
      ? undefined
      : resolvedUser?.username) ||
    (isUnknownFollowRequestUser(user.username) ? undefined : user.username) ||
    "User";
  const username =
    (isUnknownFollowRequestUser(resolvedUser?.username)
      ? undefined
      : resolvedUser?.username) ||
    (isUnknownFollowRequestUser(user.username) ? undefined : user.username);
  const avatar = resolvedUser?.avatar || resolvedUser?.profileImageUrl || user.avatar;

  return (
    <div className="flex items-start gap-4">
      <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
        {avatar ? (
          <img
            src={avatar}
            alt={displayName}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="material-symbols-outlined text-xl text-slate-400 dark:text-slate-500">
            person
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="font-medium text-slate-900 dark:text-white truncate">
              {displayName}
            </h4>
            {username ? (
              <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                @{username}
              </p>
            ) : null}
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {dateLabel}
            </p>
          </div>
          {status ? (
            <Badge
              variant={
                status === "APPROVED"
                  ? "secondary"
                  : status === "REJECTED"
                    ? "destructive"
                    : "outline"
              }
              className="text-[10px]"
            >
              {status}
            </Badge>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function FollowRequestsTab({
  requests,
  sentRequests,
}: FollowRequestsTabProps) {
  const [loadingRequestId, setLoadingRequestId] = useState<string | null>(null);
  const [requestView, setRequestView] = useState<"incoming" | "sent">(
    "incoming",
  );
  const approveFollowRequestMutation = useApproveFollowRequestMutation();
  const rejectFollowRequestMutation = useRejectFollowRequestMutation();
  const searchParams = useSearchParams();
  const requestedView = searchParams.get("requestView");
  const incomingCount = requests.length;
  const sentCount = sentRequests.length;

  useEffect(() => {
    if (requestedView === "incoming" || requestedView === "sent") {
      setRequestView(requestedView);
    }
  }, [requestedView]);

  const handleApprove = async (requestId: string) => {
    setLoadingRequestId(requestId);
    try {
      await approveFollowRequestMutation.mutateAsync(requestId);
      toast.success("Follow request approved!");
    } catch {
      toast.error("Failed to approve follow request");
    } finally {
      setLoadingRequestId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    setLoadingRequestId(requestId);
    try {
      await rejectFollowRequestMutation.mutateAsync(requestId);
      toast.success("Follow request rejected!");
    } catch {
      toast.error("Failed to reject follow request");
    } finally {
      setLoadingRequestId(null);
    }
  };

  const activeRequests = requestView === "incoming" ? requests : sentRequests;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            Follow Requests
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Manage the requests you received and the ones you already sent.
          </p>
        </div>
        <Badge variant="secondary" className="text-xs">
          {requestView === "incoming" ? incomingCount : sentCount}{" "}
          {requestView === "incoming" ? "incoming" : "sent"}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/40 p-1">
        <button
          type="button"
          onClick={() => setRequestView("incoming")}
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            requestView === "incoming"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>Incoming</span>
          {incomingCount > 0 ? (
            <Badge variant="secondary" className="h-5 min-w-5 px-1 text-[10px]">
              {incomingCount}
            </Badge>
          ) : null}
        </button>
        <button
          type="button"
          onClick={() => setRequestView("sent")}
          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
            requestView === "sent"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <span>Sent</span>
          {sentCount > 0 ? (
            <Badge variant="secondary" className="h-5 min-w-5 px-1 text-[10px]">
              {sentCount}
            </Badge>
          ) : null}
        </button>
      </div>

      {activeRequests.length === 0 ? (
        <div className="text-center py-12">
          <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-2xl text-slate-400">
              person_add_disabled
            </span>
          </div>
          <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
            {requestView === "incoming"
              ? "No Incoming Requests"
              : "No Sent Requests"}
          </h3>
          <p className="text-slate-600 dark:text-slate-400">
            {requestView === "incoming"
              ? "You do not have any pending follow requests."
              : "You have not sent any follow requests yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requestView === "incoming"
            ? requests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"
                >
                  <FollowRequestUserSummary
                    user={request.requester}
                    dateLabel={`Requested ${new Date(request.createdAt).toLocaleDateString()}`}
                  />

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={loadingRequestId === request.id}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingRequestId === request.id ? (
                        <span className="material-symbols-outlined text-sm animate-spin">
                          refresh
                        </span>
                      ) : (
                        "Approve"
                      )}
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={loadingRequestId === request.id}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingRequestId === request.id ? (
                        <span className="material-symbols-outlined text-sm animate-spin">
                          refresh
                        </span>
                      ) : (
                        "Reject"
                      )}
                    </button>
                  </div>
                </div>
              ))
            : sentRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"
                >
                  <FollowRequestUserSummary
                    user={request.target}
                    dateLabel={`Sent ${new Date(request.createdAt).toLocaleDateString()}`}
                    status={request.status}
                  />
                </div>
              ))}
        </div>
      )}
    </div>
  );
}
