import graphqlApiClient from "@/lib/graphql-api";
import { Suspense } from "react";
import AuctionClient from "./AuctionClient";

// Generate metadata dynamically for better SEO
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const auction = await graphqlApiClient.getAuction(id);
    if (!auction) return { title: "Auction Not Found" };
    
    return {
      title: `${auction.title} | Ankuaru Auctions`,
      description: auction.itemDescription.substring(0, 160),
    };
  } catch (error) {
    return { title: "Ankuaru Auction" };
  }
}

export default async function AuctionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let initialAuction = null;
  
  try {
    // SSR fetch for initial auction details
    // This allows search engines to index auction content and gives users immediate feedback
    initialAuction = await graphqlApiClient.getAuction(id);
  } catch (error) {
    console.error(`[SSR] Failed to fetch auction ${id}:`, error);
  }

  return (
    <Suspense fallback={<div className="p-8 text-center animate-pulse">Loading Auction Details...</div>}>
      <AuctionClient initialAuction={initialAuction} id={id} />
    </Suspense>
  );
}
