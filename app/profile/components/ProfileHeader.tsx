"use client";

import { User } from "../../../lib/types";

interface ProfileHeaderProps {
  profile: User;
  onEditProfile: () => void;
  followersCount: number;
  followingCount: number;
  rating: number;
}

export default function ProfileHeader({
  profile,
  onEditProfile,
  followersCount,
  followingCount,
  rating,
}: ProfileHeaderProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm mb-8">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
        {/* Profile Avatar */}
        <div className="flex-shrink-0">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.fullName || profile.username}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="material-symbols-outlined text-4xl text-slate-400 dark:text-slate-500">
                  person
                </span>
              )}
            </div>
            {profile.isPrivate && (
              <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-amber-500 rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-sm">
                  lock
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                {profile.fullName || profile.username}
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mb-2">
                @{profile.username}
              </p>
              {profile.bio && (
                <p className="text-slate-700 dark:text-slate-300 max-w-2xl">
                  {profile.bio}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={onEditProfile}
                className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit Profile
              </button>
              <button className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">share</span>
                Share
              </button>
            </div>
          </div>

          {/* Profile Stats */}
          <div className="flex flex-wrap gap-6 mt-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400">people</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {followersCount}
              </span>
              <span className="text-slate-600 dark:text-slate-400">followers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400">person_add</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {followingCount}
              </span>
              <span className="text-slate-600 dark:text-slate-400">following</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400">star</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {rating.toFixed(1)}
              </span>
              <span className="text-slate-600 dark:text-slate-400">rating</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-slate-400">calendar_today</span>
              <span className="text-slate-600 dark:text-slate-400">
                Joined {new Date(profile.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
