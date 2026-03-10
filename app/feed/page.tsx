import graphqlApiClient from "@/lib/graphql-api";
import FeedClient from "./FeedClient";

export const metadata = {
  title: "Feed - Ankuaru Coffee Auctions",
  description: "Browse the latest specialty coffee auctions from Ankuaru.",
};

export default async function FeedPage() {
  let initialAuctions: any[] = [];
  
  try {
    // Initial data fetch on the server (SSR)
    // This improves SEO and prevents layout shift/empty states on load
    initialAuctions = await graphqlApiClient.getAuctions();
  } catch (error) {
    console.error("[SSR] Failed to fetch auctions for feed:", error);
    // Fallback to empty array, FeedClient will handle client-side fetching/retrying
  }

  return <FeedClient initialAuctions={initialAuctions} />;
}
