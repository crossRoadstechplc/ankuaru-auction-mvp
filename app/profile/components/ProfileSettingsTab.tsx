"use client";

import { 
  useRemoveMyProfileImage, 
  useUpdateMyProfile, 
  useMyProfile 
} from "../../../hooks/useProfile";
import { toast } from "sonner";

export default function ProfileSettingsTab() {
  const { data: profile } = useMyProfile();
  const removeImageMutation = useRemoveMyProfileImage();
  const updateProfileMutation = useUpdateMyProfile();

  const handleRemoveProfileImage = async () => {
    if (!window.confirm("Are you sure you want to remove your profile image?")) return;

    try {
      await removeImageMutation.mutateAsync();
      toast.success("Profile image removed successfully!");
    } catch (error) {
      toast.error("Failed to remove profile image");
    }
  };

  const handleTogglePrivacy = async () => {
    const isPrivate = !profile?.isPrivate;
    try {
      await updateProfileMutation.mutateAsync({ isPrivate });
      toast.success(`Profile is now ${isPrivate ? "private" : "public"}`);
    } catch (error) {
      toast.error("Failed to update privacy settings");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Profile Settings
        </h3>
        
        <div className="space-y-6">
          {/* Profile Image Settings */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
            <h4 className="font-medium text-slate-900 dark:text-white mb-4">
              Profile Image
            </h4>
            <div className="space-y-4">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Remove your current profile image to use the default avatar.
              </p>
              <button
                onClick={handleRemoveProfileImage}
                disabled={removeImageMutation.isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {removeImageMutation.isPending ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">
                      refresh
                    </span>
                    Removing...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">delete</span>
                    Remove Profile Image
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
            <h4 className="font-medium text-slate-900 dark:text-white mb-4">
              Privacy Settings
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-slate-900 dark:text-white">
                    Private Profile
                  </h5>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Only approved followers can see your profile and auctions.
                  </p>
                </div>
                <button 
                  onClick={handleTogglePrivacy}
                  disabled={updateProfileMutation.isPending}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${
                    profile?.isPrivate ? "bg-primary" : "bg-slate-200 dark:bg-slate-700"
                  }`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    profile?.isPrivate ? "translate-x-6" : "translate-x-1"
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-6">
            <h4 className="font-medium text-slate-900 dark:text-white mb-4">
              Notification Settings
            </h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-slate-900 dark:text-white">
                    Email Notifications
                  </h5>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Receive email updates about your auctions and bids.
                  </p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-6" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-medium text-slate-900 dark:text-white">
                    Push Notifications
                  </h5>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Get browser notifications for important updates.
                  </p>
                </div>
                <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-200 dark:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                  <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1" />
                </button>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
            <h4 className="font-medium text-red-900 dark:text-red-100 mb-4">
              Account Actions
            </h4>
            <div className="space-y-4">
              <p className="text-sm text-red-700 dark:text-red-300">
                These actions cannot be undone. Please be careful.
              </p>
              <div className="flex gap-3">
                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors">
                  Delete Account
                </button>
                <button className="px-4 py-2 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
                  Export Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
