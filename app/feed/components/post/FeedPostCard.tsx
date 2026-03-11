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
}

export function FeedPostCard({
  auction,
  getImageWithFallback,
}: FeedPostCardProps) {
  return (
    <Card className="flex flex-col bg-card hover:bg-card/90 transition-colors duration-300 border border-border/50 shadow-sm hover:shadow-md rounded-2xl overflow-hidden mx-auto sm:max-w-2xl w-full">
      <FeedPostHeader 
        creator={auction.creator} 
        createdAt={auction.createdAt} 
      />
      
      <FeedPostBody
        title={auction.title}
        description={auction.itemDescription}
        category={auction.auctionCategory}
      />
      
      <FeedPostMedia 
        image={auction.image} 
        getImageWithFallback={getImageWithFallback} 
      />
      
      <FeedPostMeta
        auctionType={auction.auctionType}
        status={auction.status}
        minBid={auction.minBid}
        reservePrice={auction.reservePrice}
        startAt={auction.startAt}
        endAt={auction.endAt}
      />
      
      <FeedPostActions auctionId={auction.id} />
    </Card>
  );
}
