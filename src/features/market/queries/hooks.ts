import { useQuery } from "@tanstack/react-query";
import { marketApi } from "@/src/features/market/api/market.api";
import { MarketListingsResult } from "@/src/features/market/types/market.types";
import { marketQueryKeys } from "@/src/features/market/queries/queryKeys";

export function useMarketListingsQuery() {
  return useQuery<MarketListingsResult>({
    queryKey: marketQueryKeys.listings(),
    queryFn: () => marketApi.getMarketListings(),
    staleTime: 1000 * 45,
    gcTime: 1000 * 60 * 10,
    refetchInterval: 1000 * 60,
    refetchIntervalInBackground: true,
  });
}
