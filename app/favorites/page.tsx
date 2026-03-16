"use client";

import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { PageSection } from "@/components/layout/page-section";
import { PageShell } from "@/components/layout/page-shell";
import { Card } from "@/components/ui/card";
import { getImageWithFallback } from "@/lib/imageUtils";
import { useAuctionsQuery } from "@/src/features/auctions/queries/hooks";
import { useMyFollowingQuery } from "@/src/features/profile/queries/hooks";
import { useFavoriteAuctions } from "@/src/shared/favorites/favorite-auctions";
import { useMemo } from "react";
import { useAuthStore } from "@/stores/auth.store";
import { FeedAuctionGrid } from "../feed/components/FeedAuctionGrid";

export default function FavoriteAuctionsPage() {
  const userId = useAuthStore((state) => state.userId);
  const { favoriteAuctionIds, favoriteCount } = useFavoriteAuctions();
  const { data: auctions = [], isLoading, error } = useAuctionsQuery();
  const { data: following = [] } = useMyFollowingQuery();

  const followingIds = useMemo(() => {
    if (!userId) {
      return [];
    }

    return following.map((user) => user.id);
  }, [following, userId]);

  const favoriteAuctions = useMemo(() => {
    const favoriteIdSet = new Set(favoriteAuctionIds);
    return auctions.filter((auction) => favoriteIdSet.has(auction.id));
  }, [auctions, favoriteAuctionIds]);

  return (
    <PageShell>
      <Header />
      <PageContainer className="py-8 md:py-10">
        <PageHeader
          title="Favorite Auctions"
          description="Your locally saved auctions are collected here for quick access."
        />

        <PageSection>
          {favoriteCount === 0 && !isLoading ? (
            <Card className="rounded-3xl border-border/60 p-10 text-center">
              <div className="mx-auto flex max-w-lg flex-col items-center gap-3">
                <span className="material-symbols-outlined text-5xl text-rose-500">
                  favorite
                </span>
                <h2 className="text-xl font-bold text-foreground">
                  No favorite auctions yet
                </h2>
                <p className="text-sm text-muted-foreground">
                  Save auctions from the feed and they will appear here instantly.
                </p>
              </div>
            </Card>
          ) : (
            <FeedAuctionGrid
              auctions={favoriteAuctions}
              isLoading={isLoading}
              error={
                error
                  ? typeof error === "string"
                    ? error
                    : "Failed to load favorite auctions"
                  : null
              }
              followingIds={followingIds}
              getImageWithFallback={getImageWithFallback}
              hasMore={false}
              showEndMessage={false}
            />
          )}
        </PageSection>
      </PageContainer>
      <Footer />
    </PageShell>
  );
}
