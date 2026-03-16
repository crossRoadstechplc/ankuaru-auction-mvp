"use client";

import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/src/components/domain/user/user-avatar";
import { type ChangeEvent, useId, useRef } from "react";

interface ProfileImageUploaderProps {
  displayName?: string;
  previewUrl?: string;
  fileName?: string | null;
  error?: string;
  disabled?: boolean;
  isRemoving?: boolean;
  onFileSelect: (file: File | null) => void;
  onRemove: () => void;
}

export default function ProfileImageUploader({
  displayName,
  previewUrl,
  fileName,
  error,
  disabled = false,
  isRemoving = false,
  onFileSelect,
  onRemove,
}: ProfileImageUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenPicker = () => {
    if (disabled) {
      return;
    }

    inputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    onFileSelect(file);
    event.target.value = "";
  };

  return (
    <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex justify-center sm:justify-start">
          <div className="relative">
            <UserAvatar
              src={previewUrl || undefined}
              name={displayName}
              size="lg"
              className="h-24 w-24 border-2 border-background shadow-md"
            />
            <div className="absolute -bottom-1 right-0 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background shadow-sm">
              <span className="material-symbols-outlined text-sm text-foreground">
                photo_camera
              </span>
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Avatar Preview
            </p>
            <p className="text-xs text-muted-foreground">
              Choose an image, review the circular preview, then save changes to
              upload it.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleOpenPicker}
              disabled={disabled}
              className="gap-2"
            >
              <span className="material-symbols-outlined text-sm">
                upload
              </span>
              Choose Photo
            </Button>
            {previewUrl ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onRemove}
                disabled={disabled || isRemoving}
                className="gap-2 text-muted-foreground"
              >
                <span className="material-symbols-outlined text-sm">
                  {isRemoving ? "refresh" : "delete"}
                </span>
                {isRemoving ? "Removing..." : "Remove"}
              </Button>
            ) : null}
          </div>

          <div className="min-h-5">
            <p className="truncate text-xs text-muted-foreground">
              {fileName || (previewUrl ? "Current profile image" : "No image selected")}
            </p>
            {error ? (
              <p className="mt-1 text-xs text-destructive">{error}</p>
            ) : null}
          </div>
        </div>
      </div>

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        disabled={disabled || isRemoving}
      />
    </div>
  );
}
