"use client";

import { Card } from "@/components/ui/card";
import { Auction } from "@/lib/types";
import { FeedPostHeader } from "./FeedPostHeader";
import { FeedPostBody } from "./FeedPostBody";
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
    <Card className="mx-auto w-full overflow-hidden rounded-[18px] border border-slate-200/80 bg-white shadow-[0_28px_90px_-60px_rgba(15,23,42,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_36px_120px_-64px_rgba(15,23,42,0.48)] dark:border-slate-800 dark:bg-slate-950">
      <FeedPostHeader
        creatorId={auction.createdBy}
        creator={auction.creator}
        createdAt={auction.createdAt}
        isFollowing={isFollowingCreator}
        isRequested={isRequestedCreator}
        onOpenProfile={onOpenCreatorProfile}
        onOpenProfileImage={onOpenCreatorProfileImage}
      />

      <div className="grid gap-4 px-4 pb-4 md:grid-cols-[minmax(0,1fr)_188px] md:px-5 md:pb-5">
        <div className="space-y-4">
          <FeedPostBody
            title={auction.title}
            description={auction.itemDescription}
            auctionType={auction.auctionType}
            status={auction.status}
            category={auction.auctionCategory}
            productName={auction.productName}
            region={auction.region}
            commodityType={auction.commodityType}
            grade={auction.grade}
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
            startAt={auction.startAt}
            endAt={auction.endAt}
          />
        </div>

        <FeedPostMedia
          image={auction.image}
          getImageWithFallback={getImageWithFallback}
          status={auction.status}
          auctionType={auction.auctionType}
          category={auction.auctionCategory}
        />
      </div>

      <FeedPostActions auctionId={auction.id} status={auction.status} />
    </Card>
  );
}
