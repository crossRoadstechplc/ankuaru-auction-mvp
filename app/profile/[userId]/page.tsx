"use client";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { PageSection } from "@/components/layout/page-section";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
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
      <PageContainer className="space-y-8 py-8 md:py-10">
        <PageHeader
          title="Trader Profile"
          description="Detailed marketplace activity, followers, and posted lots."
          actions={
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => router.push("/feed")}
            >
              <span className="material-symbols-outlined text-sm">
                arrow_back
              </span>
              Back to Feed
            </Button>
          }
        />

        <PageSection>
          <PublicUserProfileView userId={userId} variant="page" />
        </PageSection>
      </PageContainer>
    </PageShell>
  );
}
