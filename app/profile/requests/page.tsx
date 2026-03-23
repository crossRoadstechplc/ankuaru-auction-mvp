"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageShell } from "@/components/layout/page-shell";
import { PanelCard } from "@/components/layout/panel-card";
import {
  useMyFollowRequestsQuery,
  useMySentFollowRequestsQuery,
} from "@/src/features/profile/queries/hooks";
import Link from "next/link";
import FollowRequestsTab from "../components/FollowRequestsTab";

export default function ProfileRequestsPage() {
  const { data: followRequests = [] } = useMyFollowRequestsQuery();
  const { data: sentFollowRequests = [] } = useMySentFollowRequestsQuery();

  return (
    <PageShell>
      <PageContainer className="space-y-6 py-6 md:py-8">
        <Link
          href="/profile"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to profile
        </Link>

        <PanelCard
          title="Follow Requests"
          description="Manage incoming and outgoing follow requests."
          action={
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {followRequests.length + sentFollowRequests.length} total
            </span>
          }
        >
          <FollowRequestsTab
            requests={followRequests}
            sentRequests={sentFollowRequests}
          />
        </PanelCard>
      </PageContainer>
    </PageShell>
  );
}
