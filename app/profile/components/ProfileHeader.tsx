"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { UserAvatar } from "@/src/components/domain/user/user-avatar";
import { getImageWithFallback } from "@/lib/imageUtils";
import type { User, UserProfileDetails } from "@/lib/types";
import { cn } from "@/lib/utils";

function formatCount(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(".0", "")}K`;
  return value.toLocaleString();
}

function formatJoinDate(value?: string) {
  if (!value) return "Joined recently";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

interface ProfileHeaderProps {
  profile: User | UserProfileDetails;
  auctionsCount: number;
  followersCount: number;
  followingCount: number;
  actions?: ReactNode;
  className?: string;
}

export function ProfileHeader({
  profile,
  auctionsCount,
  followersCount,
  followingCount,
  actions,
  className,
}: ProfileHeaderProps) {
  const displayName = profile.fullName || profile.username || "Marketplace User";
  const avatarUrl = profile.avatar || profile.profileImageUrl;
  const bio = profile.bio?.trim();

  return (
    <div
      className={cn(
        "border-b border-slate-200/60 bg-white dark:border-slate-800 dark:bg-slate-950",
        className,
      )}
    >
      <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex justify-center sm:justify-start">
              <div
                className="h-24 w-24 rounded-full bg-muted bg-cover bg-center sm:h-28 sm:w-28"
                style={{
                  backgroundImage: `url('${getImageWithFallback(avatarUrl)}')`,
                }}
              />
            </div>

            <div className="min-w-0 flex-1 space-y-2 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                  {profile.username}
                </h1>
                <span className="material-symbols-outlined text-lg text-sky-400" aria-hidden>
                  verified
                </span>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400">
                {formatCount(auctionsCount)} auctions · {formatCount(followersCount)} followers ·{" "}
                {formatCount(followingCount)} following
              </p>

              {bio ? (
                <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                  {bio}
                </p>
              ) : null}

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatJoinDate(profile.createdAt)}
                {profile.rating ? ` · ${profile.rating.toFixed(1)} rating` : " · Trusted seller"}
              </p>
            </div>
          </div>

          {actions ? (
            <div className="flex flex-wrap justify-center gap-2 sm:shrink-0 sm:justify-end">
              {actions}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
