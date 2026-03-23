"use client";

import { Card } from "@/components/ui/card";
import { Auction } from "@/lib/types";
import { FeedPostHeader } from "./FeedPostHeader";
import { FeedPostBody } from "./FeedPostBody";
import { FeedPostProperties } from "./FeedPostProperties";
import { FeedPostMedia } from "./FeedPostMedia";
import { FeedPostMeta } from "./FeedPostMeta";
import { FeedPostActions } from "./FeedPostActions";

interface FeedPostCardProps {
  auction: Auction;
  getImageWithFallback?: (image?: string) => string;
  isFollowingCreator?: boolean;
  isRequestedCreator?: boolean;
  onOpenCreatorProfile?: (userId: string) => void;
  onOpenCreatorProfileImage?: (payload: {
    imageUrl?: string | null;
    displayName: string;
    username?: string | null;
  }) => void;
}

export function FeedPostCard({
  auction,
  getImageWithFallback,
  isFollowingCreator,
  isRequestedCreator,
  onOpenCreatorProfile,
  onOpenCreatorProfileImage,
}: FeedPostCardProps) {
  return (
    <Card className="w-full overflow-hidden rounded-xl border border-slate-200/60 bg-white dark:border-slate-800 dark:bg-slate-950">
      <FeedPostHeader
        creatorId={auction.createdBy}
        creator={auction.creator}
        createdAt={auction.createdAt}
        isFollowing={isFollowingCreator}
        isRequested={isRequestedCreator}
        onOpenProfile={onOpenCreatorProfile}
        onOpenProfileImage={onOpenCreatorProfileImage}
      />

      <div className="grid grid-cols-1 gap-2 px-3 pb-2 md:grid-cols-[minmax(0,1fr)_auto] md:items-stretch md:gap-3 md:px-3 md:pb-3">
        <div className="min-w-0 space-y-1.5">
          <FeedPostBody
            title={auction.title}
            productName={auction.productName}
            region={auction.region}
            grade={auction.grade}
          />

          <FeedPostProperties
            category={auction.auctionCategory}
            commodityType={auction.commodityType}
            process={auction.process}
            transaction={auction.transaction}
            commodityBrand={auction.commodityBrand}
            commodityClass={auction.commodityClass}
            commoditySize={auction.commoditySize}
          />

          <FeedPostMeta
            auctionType={auction.auctionType}
            status={auction.status}
            minBid={auction.minBid}
            reservePrice={auction.reservePrice}
            quantity={auction.quantity}
            quantityUnit={auction.quantityUnit}
            priceTiers={auction.priceTiers}
            startAt={auction.startAt}
            endAt={auction.endAt}
            bidCount={auction.bidCount}
            createdAt={auction.createdAt}
          />
        </div>

        <FeedPostMedia
          image={auction.image}
          getImageWithFallback={getImageWithFallback}
          status={auction.status}
          auctionType={auction.auctionType}
        />
      </div>

      <FeedPostActions auctionId={auction.id} status={auction.status} />
    </Card>
  );
}
