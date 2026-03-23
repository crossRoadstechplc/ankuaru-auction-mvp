"use client";

import { CollapsibleSection } from "@/components/ui/collapsible-section";
import {
  formatEtbValue,
  formatShortDateTime,
  getLowestTierPrice,
} from "@/lib/format";
import type { PriceTier } from "@/lib/types";
import { useMyBidQuery } from "@/src/features/bids/queries/hooks";
import {
  useFollowUserMutation,
  useMyFollowingQuery,
  useMySentFollowRequestsQuery,
  useUnfollowUserMutation,
  useUserInfoQuery,
} from "@/src/features/profile/queries/hooks";
import { useAuthStore } from "@/stores/auth.store";
import { User, UserRating } from "../../../../lib/types";

interface AuctionDetailsCardProps {
  data: {
    id: string;
    title: string;
    auctionCategory: string;
    productName?: string;
    region?: string;
    commodityType?: string;
    grade?: string;
    process?: string;
    transaction?: string;
    commodityBrand?: string;
    commodityClass?: string;
    commoditySize?: string;
    quantity?: string;
    quantityUnit?: string;
    itemDescription: string;
    reservePrice: string;
    minBid: string;
    auctionType: "SELL" | "BUY";
    visibility: "PUBLIC" | "FOLLOWERS" | "SELECTED";
    startAt: string;
    endAt: string;
    status: "SCHEDULED" | "OPEN" | "REVEAL" | "CLOSED";
    createdBy: string;
    createdAt: string;
    bidCount?: number;
    currentBid?: string;
    winningBid?: string;
    priceTiers?: PriceTier[];
    images?: string[];
    image?: string;
  };
  creatorRating?: UserRating | null;
  creatorInfo?: Pick<User, "id" | "username" | "fullName" | "avatar"> | null;
  isCreator: boolean;
}

function isSyntheticIdentity(value?: string | null): boolean {
  if (!value) {
    return false;
  }

  return /^User\s+[A-Za-z0-9-]{4,}\.\.\.$/.test(value.trim());
}

function pickReadableIdentity(
  ...values: Array<string | null | undefined>
): string | undefined {
  for (const value of values) {
    if (!value) {
      continue;
    }

    const trimmed = value.trim();
    if (!trimmed || isSyntheticIdentity(trimmed)) {
      continue;
    }

    return trimmed;
  }

  return undefined;
}

function formatVisibilityLabel(visibility: AuctionDetailsCardProps["data"]["visibility"]): string {
  if (visibility === "FOLLOWERS") {
    return "Followers-first bidding";
  }

  if (visibility === "SELECTED") {
    return "Selected bidders";
  }

  return "Open bidding";
}

export function AuctionDetailsCard({
  data,
  creatorRating,
  creatorInfo,
  isCreator,
}: AuctionDetailsCardProps) {
  const authUserId = useAuthStore((state) => state.userId);
  const { data: myBid } = useMyBidQuery(data.id);
  const { data: following = [] } = useMyFollowingQuery();
  const { data: sentFollowRequests = [] } = useMySentFollowRequestsQuery();
  const followMutation = useFollowUserMutation();
  const unfollowMutation = useUnfollowUserMutation();

  const needsCreatorLookup =
    !!data.createdBy &&
    !pickReadableIdentity(
      creatorInfo?.fullName,
      creatorInfo?.username,
      creatorRating?.user?.username,
    );
  const { data: resolvedCreatorInfo } = useUserInfoQuery(
    data.createdBy,
    needsCreatorLookup,
  );

  const isFollowing = following.some((followedUser) => {
    return followedUser.id === data.createdBy;
  });
  const isRequested = sentFollowRequests.some((request) => {
    if (String(request.status || "").toUpperCase() !== "PENDING") return false;
    const requestedUserId =
      request.requester?.id === authUserId
        ? request.target?.id
        : request.target?.id || request.requester?.id;
    return requestedUserId === data.createdBy;
  });
  const isFollowLoading =
    followMutation.isPending || unfollowMutation.isPending;

  const creatorDisplayName =
    pickReadableIdentity(
      creatorInfo?.fullName,
      resolvedCreatorInfo?.fullName,
      creatorInfo?.username,
      resolvedCreatorInfo?.username,
      creatorRating?.user?.username,
    ) ?? "Auction Creator";
  const creatorUsername = pickReadableIdentity(
    creatorInfo?.username,
    resolvedCreatorInfo?.username,
    creatorRating?.user?.username,
  );
  const creatorSubtitle =
    creatorUsername && creatorUsername !== creatorDisplayName
      ? `@${creatorUsername}`
      : null;
  const creatorAvatar =
    creatorInfo?.avatar ||
    resolvedCreatorInfo?.avatar ||
    resolvedCreatorInfo?.profileImageUrl;

  const primaryValue =
    data.status === "CLOSED"
      ? formatEtbValue(data.winningBid || data.currentBid)
      : myBid?.amount
        ? formatEtbValue(myBid.amount)
        : formatEtbValue(data.currentBid || data.minBid);
  const primaryLabel =
    data.status === "CLOSED"
      ? "Winning bid"
      : myBid?.amount
        ? "My bid"
        : "Current bid";

  const detailFacts = [
    { label: "Category", value: data.auctionCategory },
    { label: "Product", value: data.productName },
    { label: "Region", value: data.region },
    { label: "Commodity type", value: data.commodityType },
    { label: "Grade", value: data.grade ? `Grade ${data.grade}` : undefined },
    { label: "Process", value: data.process },
    { label: "Transaction", value: data.transaction },
    { label: "Brand", value: data.commodityBrand },
    { label: "Class", value: data.commodityClass },
    { label: "Size", value: data.commoditySize },
    {
      label: "Quantity",
      value: data.quantity
        ? `${data.quantity}${data.quantityUnit ? ` ${data.quantityUnit}` : ""}`
        : undefined,
    },
  ].filter((item): item is { label: string; value: string } => !!item.value);

  const handleFollow = async () => {
    if (!data.createdBy || isFollowLoading) {
      return;
    }

    try {
      await followMutation.mutateAsync(data.createdBy);
    } catch (error) {
      console.error("Follow failed:", error);
    }
  };

  const handleUnfollow = async () => {
    if (!data.createdBy || isFollowLoading) {
      return;
    }

    try {
      await unfollowMutation.mutateAsync(data.createdBy);
    } catch (error) {
      console.error("Unfollow failed:", error);
    }
  };

  const displayImages =
    data.images && data.images.length > 0
      ? data.images
      : data.image
        ? [data.image]
        : ["/static.jpg"];
  const minBidDisplay =
    getLowestTierPrice(data.priceTiers) ?? data.minBid;

  return (
    <section className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-hidden border-b border-slate-200/70 dark:border-slate-800">
        {displayImages.length > 1 ? (
          <div className="flex gap-1 overflow-x-auto p-1 sm:p-2">
            {displayImages.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`${data.title} (${i + 1})`}
                className="h-44 min-w-[200px] flex-shrink-0 object-cover sm:h-52 sm:min-w-[280px]"
              />
            ))}
          </div>
        ) : (
          <img
            src={displayImages[0]}
            alt={data.title}
            className="h-44 w-full object-cover sm:h-52"
          />
        )}
      </div>

      <div className="space-y-4 p-4 sm:p-5">
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[12px] border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/50">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {data.priceTiers && data.priceTiers.length > 0
                ? "From"
                : "Minimum bid"}
            </p>
            <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">
              {formatEtbValue(minBidDisplay)}
              {data.priceTiers && data.priceTiers.length > 0 ? "/unit" : ""}
            </p>
          </div>
          <div className="rounded-[12px] border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/50">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              {primaryLabel}
            </p>
            <p className="mt-1 text-base font-bold text-primary">{primaryValue}</p>
          </div>
          <div className="rounded-[12px] border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/50">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Reserve price
            </p>
            <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">
              {formatEtbValue(data.reservePrice)}
            </p>
          </div>
          <div className="rounded-[12px] border border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-800/50">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total bids
            </p>
            <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">
              {data.bidCount || 0}
            </p>
          </div>
        </div>

        <CollapsibleSection
          title="Product snapshot"
          icon="inventory_2"
          defaultOpen={false}
        >
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {detailFacts.map((item) => (
              <div
                key={item.label}
                className="rounded-lg border border-slate-200/80 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
              >
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {item.label}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </CollapsibleSection>

        {data.priceTiers && data.priceTiers.length > 0 && (
          <CollapsibleSection
            title="Price tiers"
            icon="sell"
            defaultOpen={true}
          >
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:bg-slate-800/40">
                  <tr>
                    <th className="px-3 py-3">Min Qty</th>
                    <th className="px-3 py-3">Max Qty</th>
                    <th className="px-3 py-3">Price per unit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800">
                  {data.priceTiers.map((tier, i) => (
                    <tr
                      key={i}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/30"
                    >
                      <td className="px-3 py-3 font-semibold text-slate-900 dark:text-white">
                        {tier.minQty}
                      </td>
                      <td className="px-3 py-3 text-slate-700 dark:text-slate-300">
                        {tier.maxQty ?? "Unlimited"}
                      </td>
                      <td className="px-3 py-3 font-bold text-primary">
                        {formatEtbValue(tier.pricePerUnit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CollapsibleSection>
        )}

        <CollapsibleSection title="Timeline" icon="schedule" defaultOpen={false}>
          <div className="space-y-2">
            <div className="rounded-lg border border-slate-200/80 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Starts
              </p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
                {formatShortDateTime(data.startAt)}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200/80 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Ends
              </p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
                {formatShortDateTime(data.endAt)}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200/80 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Access model
              </p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900 dark:text-white">
                {formatVisibilityLabel(data.visibility)}
              </p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Feed stays public. The detail page decides who can place bids.
              </p>
            </div>
          </div>
        </CollapsibleSection>

        <div className="rounded-[14px] border border-slate-200/80 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 overflow-hidden rounded-lg border border-primary/20 bg-primary/10">
                {creatorAvatar ? (
                  <img
                    src={creatorAvatar}
                    alt={creatorDisplayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="material-symbols-outlined text-2xl text-primary">
                      person
                    </span>
                  </div>
                )}
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Auction creator
                </p>
                <p className="mt-0.5 text-sm font-bold text-slate-900 dark:text-white">
                  {creatorDisplayName}
                  {creatorRating?.user?.averageRating ? (
                    <span className="ml-2 text-sm text-amber-500">
                      * {parseFloat(creatorRating.user.averageRating).toFixed(1)}
                    </span>
                  ) : null}
                </p>
                {creatorSubtitle ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {creatorSubtitle}
                  </p>
                ) : null}
              </div>
            </div>

            {!isCreator ? (
              <div className="flex flex-wrap items-center gap-2">
                {isFollowing ? (
                  <>
                    <span className="inline-flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-600 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
                      <span className="material-symbols-outlined text-sm">check</span>
                      Following
                    </span>
                    <button
                      onClick={handleUnfollow}
                      disabled={isFollowLoading}
                      className={`inline-flex items-center gap-1 rounded-xl border border-red-200 px-3 py-2 text-sm font-bold text-red-500 transition-all hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20 ${
                        isFollowLoading ? "cursor-not-allowed opacity-50" : ""
                      }`}
                    >
                      <span className="material-symbols-outlined text-sm">person_remove</span>
                      {isFollowLoading ? "..." : "Unfollow"}
                    </button>
                  </>
                ) : isRequested ? (
                  <button
                    disabled
                    className="cursor-default rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
                  >
                    <span className="material-symbols-outlined mr-1 text-sm">schedule</span>
                    Requested
                  </button>
                ) : (
                  <button
                    onClick={handleFollow}
                    disabled={isFollowLoading}
                    className={`inline-flex items-center gap-1 rounded-xl border border-primary px-4 py-2 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-white ${
                      isFollowLoading ? "cursor-not-allowed opacity-50" : ""
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">person_add</span>
                    {isFollowLoading ? "Loading..." : "Follow"}
                  </button>
                )}
              </div>
            ) : null}
          </div>
        </div>

        <CollapsibleSection title="Description" icon="notes" defaultOpen={false}>
          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
            {data.itemDescription}
          </p>
        </CollapsibleSection>
      </div>
    </section>
  );
}
