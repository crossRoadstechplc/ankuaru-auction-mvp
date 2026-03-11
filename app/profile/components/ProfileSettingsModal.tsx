"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { toast } from "sonner";
import { User } from "../../../lib/types";

interface ProfileSettingsModalProps {
  profile: User;
  onClose: () => void;
  onEditProfile: () => void;
  onRemoveImage: () => Promise<void>;
  onTogglePrivacy: () => Promise<void>;
  onDeactivateAccount: () => Promise<void>;
}

export default function ProfileSettingsModal({
  profile,
  onClose,
  onEditProfile,
  onRemoveImage,
  onTogglePrivacy,
  onDeactivateAccount,
}: ProfileSettingsModalProps) {
  const [isRemovingImage, setIsRemovingImage] = useState(false);
  const [isTogglingPrivacy, setIsTogglingPrivacy] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const handleRemoveImage = async () => {
    if (!confirm("Are you sure you want to remove your profile image?")) return;
    
    setIsRemovingImage(true);
    try {
      await onRemoveImage();
      toast.success("Profile image removed successfully!");
    } catch (error) {
      console.error("Image removal error:", error);
      toast.error("Failed to remove profile image");
    } finally {
      setIsRemovingImage(false);
    }
  };

  const handleTogglePrivacy = async () => {
    setIsTogglingPrivacy(true);
    try {
      await onTogglePrivacy();
      toast.success(`Profile is now ${profile.isPrivate ? "public" : "private"}!`);
    } catch (error) {
      console.error("Privacy toggle error:", error);
      toast.error("Failed to update privacy settings");
    } finally {
      setIsTogglingPrivacy(false);
    }
  };

  const handleDeactivateAccount = async () => {
    const confirmation = prompt(
      "Type 'DEACTIVATE' to confirm account deactivation. This action cannot be undone."
    );
    if (confirmation !== "DEACTIVATE") return;
    
    setIsDeactivating(true);
    try {
      await onDeactivateAccount();
      toast.success("Account deactivated successfully!");
      onClose();
      window.location.href = "/login";
    } catch (error) {
      console.error("Account deactivation error:", error);
      toast.error("Failed to deactivate account");
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">settings</span>
            Profile Settings
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Management */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Profile Management
            </h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={onEditProfile}
                className="w-full justify-start gap-2"
              >
                <span className="material-symbols-outlined text-sm">edit</span>
                Edit Profile Information
              </Button>
              
              {profile.avatar || profile.profileImageUrl ? (
                <Button
                  variant="outline"
                  onClick={handleRemoveImage}
                  disabled={isRemovingImage}
                  className="w-full justify-start gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
                >
                  {isRemovingImage ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin">
                        refresh
                      </span>
                      Removing Image...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">delete</span>
                      Remove Profile Image
                    </>
                  )}
                </Button>
              ) : null}
            </div>
          </div>

          <Separator />

          {/* Privacy Settings */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Privacy Settings
            </h3>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-sm">
                  {profile.isPrivate ? "lock" : "public"}
                </span>
                <div>
                  <p className="text-sm font-medium">Profile Visibility</p>
                  <p className="text-xs text-muted-foreground">
                    {profile.isPrivate 
                      ? "Only approved followers can see your content"
                      : "Anyone can see your profile and content"
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={profile.isPrivate ? "default" : "secondary"} className="text-xs">
                  {profile.isPrivate ? "Private" : "Public"}
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTogglePrivacy}
                  disabled={isTogglingPrivacy}
                >
                  {isTogglingPrivacy ? (
                    <span className="material-symbols-outlined text-sm animate-spin">
                      refresh
                    </span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">
                      {profile.isPrivate ? "lock_open" : "lock"}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Account Actions */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              Account Actions
            </h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                onClick={() => window.location.href = "/profile?tab=settings"}
                className="w-full justify-start gap-2"
              >
                <span className="material-symbols-outlined text-sm">manage_accounts</span>
                Account Settings
              </Button>
              
              <Button
                variant="outline"
                onClick={() => window.location.href = "/profile?tab=security"}
                className="w-full justify-start gap-2"
              >
                <span className="material-symbols-outlined text-sm">security</span>
                Security & Privacy
              </Button>
              
              <Button
                variant="outline"
                onClick={handleDeactivateAccount}
                disabled={isDeactivating}
                className="w-full justify-start gap-2 text-destructive border-destructive/30 hover:bg-destructive/5"
              >
                {isDeactivating ? (
                  <>
                    <span className="material-symbols-outlined text-sm animate-spin">
                      refresh
                    </span>
                    Deactivating...
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">warning</span>
                    Deactivate Account
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Account Info */}
          <div className="space-y-2 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Account ID</span>
              <code className="bg-background px-2 py-1 rounded text-xs">
                {profile.id?.slice(0, 8)}...
              </code>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Member Since</span>
              <span className="text-foreground">
                {new Date(profile.createdAt || "").toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
