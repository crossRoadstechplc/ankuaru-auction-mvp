"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageShell } from "@/components/layout/page-shell";
import Link from "next/link";
import ProfileSettingsTab from "../components/ProfileSettingsTab";
import { PanelCard } from "@/components/layout/panel-card";
import { useMyProfileQuery } from "@/src/features/profile/queries/hooks";

export default function ProfileSettingsPage() {
  const { data: profile } = useMyProfileQuery();
  const completionItems = [
    Boolean(profile?.fullName),
    Boolean(profile?.bio),
    Boolean(profile?.avatar || profile?.profileImageUrl),
    Boolean(profile?.email),
  ];
  const completionPercent = Math.round(
    (completionItems.filter(Boolean).length / completionItems.length) * 100,
  );

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
          title="Account Health"
          description="Recommended updates for a stronger profile."
          bodyClassName="space-y-3"
        >
          <div className="rounded-xl border border-slate-200/60 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/50">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-450">
                Profile completion
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {completionPercent}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-450">Bio added</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {profile?.bio ? "Complete" : "Missing"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-450">Avatar added</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {profile?.avatar || profile?.profileImageUrl ? "Complete" : "Missing"}
              </span>
            </div>
          </div>
        </PanelCard>

        <PanelCard
          title="Settings"
          description="Manage your account and preferences."
        >
          <ProfileSettingsTab />
        </PanelCard>
      </PageContainer>
    </PageShell>
  );
}
