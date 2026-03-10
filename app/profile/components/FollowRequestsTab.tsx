"use client";

import { FollowRequest } from "../../../lib/types";
import { useApproveFollowRequest, useRejectFollowRequest } from "../../../hooks/useProfile";
import { toast } from "sonner";

interface FollowRequestsTabProps {
  requests: FollowRequest[];
}

export default function FollowRequestsTab({ requests }: FollowRequestsTabProps) {
  const approveMutation = useApproveFollowRequest();
  const rejectMutation = useRejectFollowRequest();

  const handleApprove = async (requestId: string) => {
    try {
      await approveMutation.mutateAsync(requestId);
      toast.success("Follow request approved!");
    } catch (error) {
      toast.error("Failed to approve follow request");
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectMutation.mutateAsync(requestId);
      toast.success("Follow request rejected!");
    } catch (error) {
      toast.error("Failed to reject follow request");
    }
  };

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-2xl text-slate-400">
            person_add_disabled
          </span>
        </div>
        <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
          No Follow Requests
        </h3>
        <p className="text-slate-600 dark:text-slate-400">
          You don't have any pending follow requests.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
        Follow Requests ({requests.length})
      </h3>
      <div className="space-y-3">
        {requests.map((request) => (
          <div
            key={request.id}
            className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl"
          >
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                {request.requester.avatar ? (
                  <img
                    src={request.requester.avatar}
                    alt={request.requester.fullName || request.requester.username}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="material-symbols-outlined text-xl text-slate-400 dark:text-slate-500">
                    person
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-medium text-slate-900 dark:text-white">
                  {request.requester.fullName || request.requester.username}
                </h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  @{request.requester.username}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Requested {new Date(request.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleApprove(request.id)}
                disabled={approveMutation.isPending && approveMutation.variables === request.id}
                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {approveMutation.isPending && approveMutation.variables === request.id ? (
                  <span className="material-symbols-outlined text-sm animate-spin">
                    refresh
                  </span>
                ) : (
                  "Approve"
                )}
              </button>
              <button
                onClick={() => handleReject(request.id)}
                disabled={rejectMutation.isPending && rejectMutation.variables === request.id}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {rejectMutation.isPending && rejectMutation.variables === request.id ? (
                  <span className="material-symbols-outlined text-sm animate-spin">
                    refresh
                  </span>
                ) : (
                  "Reject"
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
