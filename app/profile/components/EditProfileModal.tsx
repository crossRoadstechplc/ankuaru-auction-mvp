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
import type { UpdateProfileInput } from "@/src/features/profile/api/profile.api";
import { type ChangeEvent, type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";
import { User } from "../../../lib/types";
import ProfileImageUploader from "./ProfileImageUploader";

interface EditProfileModalProps {
  profile: User;
  onClose: () => void;
  onSave: (data: UpdateProfileInput) => Promise<void>;
  onRemoveImage?: () => Promise<void>;
}

export default function EditProfileModal({
  profile,
  onClose,
  onSave,
  onRemoveImage,
}: EditProfileModalProps) {
  const initialProfileImage = profile.profileImageUrl || profile.avatar || "";
  const [storedImageUrl, setStoredImageUrl] = useState(initialProfileImage);
  const [formData, setFormData] = useState<UpdateProfileInput>({
    fullName: profile.fullName || "",
    bio: profile.bio || "",
    profileImageUrl: initialProfileImage,
    isPrivate: profile.isPrivate || false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isRemovingImage, setIsRemovingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState(initialProfileImage);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const MAX_BIO_LENGTH = 500;
  const MAX_FULL_NAME_LENGTH = 100;
  const fullNameValue = formData.fullName ?? "";
  const bioValue = formData.bio ?? "";
  const selectedFileName =
    formData.profileImageUrl &&
    typeof formData.profileImageUrl !== "string"
      ? formData.profileImageUrl.name
      : null;

  useEffect(() => {
    const imageValue = formData.profileImageUrl;

    if (!imageValue) {
      setPreviewImage("");
      return;
    }

    if (typeof imageValue === "string") {
      setPreviewImage(imageValue);
      return;
    }

    const objectUrl = URL.createObjectURL(imageValue);
    setPreviewImage(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [formData.profileImageUrl]);

  const clearImageError = () => {
    setErrors((prev) => {
      if (!prev.profileImageUrl) {
        return prev;
      }

      const nextErrors = { ...prev };
      delete nextErrors.profileImageUrl;
      return nextErrors;
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (fullNameValue.length > MAX_FULL_NAME_LENGTH) {
      newErrors.fullName = `Full name must be less than ${MAX_FULL_NAME_LENGTH} characters`;
    }

    if (bioValue.length > MAX_BIO_LENGTH) {
      newErrors.bio = `Bio must be less than ${MAX_BIO_LENGTH} characters`;
    }

    if (
      formData.profileImageUrl &&
      typeof formData.profileImageUrl !== "string" &&
      !formData.profileImageUrl.type.startsWith("image/")
    ) {
      newErrors.profileImageUrl = "Please select an image file";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    setIsSaving(true);

    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error("Profile update error:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveImage = async () => {
    clearImageError();

    if (
      formData.profileImageUrl &&
      typeof formData.profileImageUrl !== "string"
    ) {
      setFormData((prev) => ({
        ...prev,
        profileImageUrl: storedImageUrl || "",
      }));
      return;
    }

    if (!storedImageUrl) {
      setFormData((prev) => ({ ...prev, profileImageUrl: "" }));
      return;
    }

    if (!onRemoveImage) {
      setStoredImageUrl("");
      setFormData((prev) => ({ ...prev, profileImageUrl: "" }));
      return;
    }

    setIsRemovingImage(true);
    try {
      await onRemoveImage();
      setStoredImageUrl("");
      setFormData((prev) => ({ ...prev, profileImageUrl: "" }));
    } catch (error) {
      console.error("Image removal error:", error);
      toast.error("Failed to remove profile image");
    } finally {
      setIsRemovingImage(false);
    }
  };

  const handleProfileImageSelect = (file: File | null) => {
    clearImageError();
    setFormData((prev) => ({
      ...prev,
      profileImageUrl: (file ?? storedImageUrl) || "",
    }));
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] w-full max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">edit</span>
            Edit Profile
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-semibold">Profile Image</label>
            <ProfileImageUploader
              displayName={fullNameValue || profile.username}
              previewUrl={previewImage}
              fileName={selectedFileName}
              error={errors.profileImageUrl}
              disabled={isSaving || isRemovingImage}
              isRemoving={isRemovingImage}
              onFileSelect={handleProfileImageSelect}
              onRemove={handleRemoveImage}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <label htmlFor="fullName" className="block text-sm font-semibold">
              Full Name
              <span className="ml-1 font-normal text-muted-foreground">
                ({fullNameValue.length}/{MAX_FULL_NAME_LENGTH})
              </span>
            </label>
            <Input
              type="text"
              id="fullName"
              name="fullName"
              value={fullNameValue}
              onChange={handleChange}
              placeholder="Enter your full name"
              className={errors.fullName ? "border-destructive" : ""}
            />
            {errors.fullName ? (
              <p className="text-xs text-destructive">{errors.fullName}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="bio" className="block text-sm font-semibold">
              Bio
              <span className="ml-1 font-normal text-muted-foreground">
                ({bioValue.length}/{MAX_BIO_LENGTH})
              </span>
            </label>
            <textarea
              id="bio"
              name="bio"
              value={bioValue}
              onChange={handleChange}
              rows={4}
              className={`w-full resize-none rounded-lg border bg-background px-3 py-2 text-foreground focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.bio ? "border-destructive" : "border-border"
              }`}
              placeholder="Tell us about yourself, your interests, and what you're looking for..."
            />
            {errors.bio ? (
              <p className="text-xs text-destructive">{errors.bio}</p>
            ) : null}
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {bioValue.length > 0 ? "Good" : "Add a bio"}
              </Badge>
              {bioValue.length > 200 ? (
                <Badge variant="outline" className="text-xs">
                  Detailed bio
                </Badge>
              ) : null}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold">
              Privacy Settings
            </label>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    name="isPrivate"
                    checked={Boolean(formData.isPrivate)}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <div>
                    <label
                      htmlFor="isPrivate"
                      className="block cursor-pointer text-sm font-medium"
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
                  <span className="material-symbols-outlined mr-2 animate-spin text-sm">
                    refresh
                  </span>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined mr-2 text-sm">
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
