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
  const isClosed = auction.status === "CLOSED";

  const headerLotType =
    auction.lotType ??
    (auction.priceTiers && auction.priceTiers.length > 0 ? "FLEXIBLE" : "SEALED");

  return (
    <Card className="w-full overflow-hidden rounded-xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <FeedPostHeader
        creatorId={auction.createdBy}
        lotType={headerLotType}
        creator={auction.creator}
        createdAt={auction.createdAt}
        isFollowing={isFollowingCreator}
        isRequested={isRequestedCreator}
        onOpenProfile={onOpenCreatorProfile}
        onOpenProfileImage={onOpenCreatorProfileImage}
      />

      {/* Mobile: image then content. Desktop: image left, content right (LTR). */}
      <div className="flex flex-col gap-3 px-3 pb-3 pt-0 sm:px-4 sm:pb-4 md:flex-row md:items-stretch md:gap-4">
        <FeedPostMedia
          image={auction.image}
          getImageWithFallback={getImageWithFallback}
          isClosed={isClosed}
        />

        <div className="min-w-0 flex-1 space-y-2.5 md:pt-0.5">
          <FeedPostBody
            title={auction.title}
            productName={auction.productName}
            region={auction.region}
            grade={auction.grade}
            category={auction.auctionCategory}
            status={auction.status}
            auctionType={auction.auctionType}
            commodityType={auction.commodityType}
            commodityClass={auction.commodityClass}
            commoditySize={auction.commoditySize}
            commodityBrand={auction.commodityBrand}
            process={auction.process}
            transaction={auction.transaction}
          />

          <FeedPostMeta
            auctionType={auction.auctionType}
            status={auction.status}
            minBid={auction.minBid}
            reservePrice={auction.reservePrice}
            quantity={auction.quantity}
            quantityUnit={auction.quantityUnit}
            priceTiers={auction.priceTiers}
            currency={auction.currency}
            startAt={auction.startAt}
            endAt={auction.endAt}
            bidCount={auction.bidCount}
            createdAt={auction.createdAt}
          />
        </div>
      </div>

      <FeedPostActions auctionId={auction.id} status={auction.status} />
    </Card>
  );
}
