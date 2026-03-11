"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { User } from "../../../lib/types";

interface EditProfileModalProps {
  profile: User;
  onClose: () => void;
  onSave: (data: {
    fullName?: string;
    bio?: string;
    profileImageUrl?: string;
    isPrivate?: boolean;
  }) => Promise<void>;
  onRemoveImage?: () => Promise<void>;
}

export default function EditProfileModal({
  profile,
  onClose,
  onSave,
  onRemoveImage,
}: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    fullName: profile.fullName || "",
    bio: profile.bio || "",
    profileImageUrl: profile.profileImageUrl || profile.avatar || "",
    isPrivate: profile.isPrivate || false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isRemovingImage, setIsRemovingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update preview when image URL changes
  useEffect(() => {
    if (formData.profileImageUrl && formData.profileImageUrl !== previewImage) {
      setPreviewImage(formData.profileImageUrl);
    }
  }, [formData.profileImageUrl, previewImage]);

  // Character limits
  const MAX_BIO_LENGTH = 500;
  const MAX_FULL_NAME_LENGTH = 100;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.fullName && formData.fullName.length > MAX_FULL_NAME_LENGTH) {
      newErrors.fullName = `Full name must be less than ${MAX_FULL_NAME_LENGTH} characters`;
    }

    if (formData.bio && formData.bio.length > MAX_BIO_LENGTH) {
      newErrors.bio = `Bio must be less than ${MAX_BIO_LENGTH} characters`;
    }

    if (formData.profileImageUrl) {
      try {
        new URL(formData.profileImageUrl);
      } catch {
        newErrors.profileImageUrl = "Please enter a valid URL";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSaving(true);

    try {
      await onSave(formData);
      // Success toast will be handled by the mutation hook
      onClose();
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!onRemoveImage) return;

    setIsRemovingImage(true);
    try {
      await onRemoveImage();
      setFormData((prev) => ({ ...prev, profileImageUrl: "" }));
      setPreviewImage("");
      // Success toast will be handled by the mutation hook
    } catch (error) {
      console.error("Image removal error:", error);
      toast.error("Failed to remove profile image");
    } finally {
      setIsRemovingImage(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">edit</span>
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image Section */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold">Profile Image</label>
            <div className="flex items-center gap-4">
              {/* Avatar Preview */}
              <div className="relative">
                <div className="h-16 w-16 rounded-full bg-muted border-2 border-border overflow-hidden">
                  {previewImage ? (
                    <img
                      src={previewImage}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                      onError={() => setPreviewImage("")}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <span className="material-symbols-outlined text-2xl text-muted-foreground">
                        person
                      </span>
                    </div>
                  )}
                </div>
                {previewImage && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={isRemovingImage}
                    className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center hover:bg-destructive/90 transition-colors disabled:opacity-50"
                  >
                    {isRemovingImage ? (
                      <span className="material-symbols-outlined text-xs animate-spin">
                        refresh
                      </span>
                    ) : (
                      <span className="material-symbols-outlined text-xs">
                        close
                      </span>
                    )}
                  </button>
                )}
              </div>

              {/* Image URL Input */}
              <div className="flex-1">
                <Input
                  type="url"
                  name="profileImageUrl"
                  value={formData.profileImageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className={errors.profileImageUrl ? "border-destructive" : ""}
                />
                {errors.profileImageUrl && (
                  <p className="text-xs text-destructive mt-1">
                    {errors.profileImageUrl}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator />
          {/* Full Name */}
          <div className="space-y-2">
            <label htmlFor="fullName" className="block text-sm font-semibold">
              Full Name
              <span className="text-muted-foreground font-normal ml-1">
                ({formData.fullName.length}/{MAX_FULL_NAME_LENGTH})
              </span>
            </label>
            <Input
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={errors.fullName ? "border-destructive" : ""}
            />
            {errors.fullName && (
              <p className="text-xs text-destructive">{errors.fullName}</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label htmlFor="bio" className="block text-sm font-semibold">
              Bio
              <span className="text-muted-foreground font-normal ml-1">
                ({formData.bio.length}/{MAX_BIO_LENGTH})
              </span>
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none ${
                errors.bio ? "border-destructive" : "border-border"
              }`}
              placeholder="Tell us about yourself, your interests, and what you're looking for..."
            />
            {errors.bio && (
              <p className="text-xs text-destructive">{errors.bio}</p>
            )}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {formData.bio.length > 0 ? "Good" : "Add a bio"}
              </Badge>
              {formData.bio.length > 200 && (
                <Badge variant="outline" className="text-xs">
                  Detailed bio
                </Badge>
              )}
            </div>
          </div>

          {/* Profile Image URL - Hidden (moved to top) */}
          <input
            type="hidden"
            name="profileImageUrl"
            value={formData.profileImageUrl}
          />

          {/* Privacy Settings */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold">
              Privacy Settings
            </label>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    name="isPrivate"
                    checked={formData.isPrivate}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-border rounded"
                  />
                  <div>
                    <label
                      htmlFor="isPrivate"
                      className="block text-sm font-medium cursor-pointer"
                    >
                      Private Profile
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Only approved followers can see your content
                    </p>
                  </div>
                </div>
                <Badge
                  variant={formData.isPrivate ? "default" : "secondary"}
                  className="text-xs"
                >
                  {formData.isPrivate ? "Private" : "Public"}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSaving || isRemovingImage}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || isRemovingImage}
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin mr-2">
                    refresh
                  </span>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm mr-2">
                    save
                  </span>
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
