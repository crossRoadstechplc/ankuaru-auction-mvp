"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageShell } from "@/components/layout/page-shell";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth.store";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import PublicUserProfileView from "../components/PublicUserProfileView";

export default function UserProfilePage() {
  const params = useParams<{ userId: string }>();
  const router = useRouter();
  const authUserId = useAuthStore((state) => state.userId);
  const userId = Array.isArray(params?.userId) ? params.userId[0] : params?.userId;

  useEffect(() => {
    if (!userId || !authUserId || authUserId !== userId) {
      return;
    }

    router.replace("/profile");
  }, [authUserId, router, userId]);

  if (!userId) {
    return null;
  }

  return (
    <PageShell>
      <PageContainer className="py-0">
        <Link
          href="/feed"
          className="inline-flex items-center gap-1.5 px-4 pt-6 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900 dark:text-slate-400 dark:hover:text-white sm:px-6"
        >
          <span className="material-symbols-outlined text-base">arrow_back</span>
          Back to Feed
        </Link>

        <div className="mt-4 px-4 sm:px-6 pb-8">
          <PublicUserProfileView userId={userId} variant="page" />
        </div>
      </PageContainer>
    </PageShell>
  );
}
