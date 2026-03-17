"use client";
import { useMyBidQuery } from "@/src/features/bids/queries/hooks";
import {
  useFollowUserMutation,
  useMyFollowingQuery,
  useMySentFollowRequestsQuery,
  useUnfollowUserMutation,
  useUserInfoQuery,
} from "@/src/features/profile/queries/hooks";
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

function formatCurrency(value?: string | null): string {
  if (!value) {
    return "ETB --";
  }

  return `ETB ${value}`;
}

function formatShortDateTime(value: string): string {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
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
    return request.status === "PENDING" && request.target.id === data.createdBy;
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
      ? formatCurrency(data.winningBid || data.currentBid)
      : myBid?.amount
        ? formatCurrency(myBid.amount)
        : formatCurrency(data.currentBid || data.minBid);
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

  return (
    <section className="overflow-hidden rounded-[18px] border border-slate-200/80 bg-white shadow-[0_28px_100px_-60px_rgba(15,23,42,0.45)] dark:border-slate-800 dark:bg-slate-900">
      <div className="overflow-hidden border-b border-slate-200/70 dark:border-slate-800">
        <img
          src="/static.jpg"
          alt={data.title}
          className="h-60 w-full object-cover sm:h-72"
        />
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
              Minimum bid
            </p>
            <p className="mt-2 text-xl font-black text-slate-900 dark:text-white">
              {formatCurrency(data.minBid)}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
              {primaryLabel}
            </p>
            <p className="mt-2 text-xl font-black text-primary">{primaryValue}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
              Reserve price
            </p>
            <p className="mt-2 text-xl font-black text-slate-900 dark:text-white">
              {formatCurrency(data.reservePrice)}
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/80 p-4 dark:border-slate-800 dark:bg-slate-800/50">
            <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
              Total bids
            </p>
            <p className="mt-2 text-xl font-black text-slate-900 dark:text-white">
              {data.bidCount || 0}
            </p>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.3fr)_minmax(260px,0.9fr)]">
          <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">
                inventory_2
              </span>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Product snapshot
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {detailFacts.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-lg">
                schedule
              </span>
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                Timeline
              </h2>
            </div>
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Starts
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {formatShortDateTime(data.startAt)}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Ends
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {formatShortDateTime(data.endAt)}
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-700 dark:bg-slate-900">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Access model
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {formatVisibilityLabel(data.visibility)}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Feed stays public. The detail page decides who can place bids.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg">
              notes
            </span>
            <h2 className="text-base font-black text-slate-900 dark:text-white">
              Description
            </h2>
          </div>
          <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">
            {data.itemDescription}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/40">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 overflow-hidden rounded-lg border border-primary/20 bg-primary/10">
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
                <p className="text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
                  Auction creator
                </p>
                <p className="mt-1 text-base font-black text-slate-900 dark:text-white">
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
      </div>
    </section>
  );
}
