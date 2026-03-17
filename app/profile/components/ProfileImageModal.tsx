"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileImageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageUrl?: string | null;
  displayName?: string | null;
  username?: string | null;
}

function getInitials(name?: string | null) {
  if (!name) {
    return "U";
  }

  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ProfileImageModal({
  open,
  onOpenChange,
  imageUrl,
  displayName,
  username,
}: ProfileImageModalProps) {
  const resolvedName = displayName || username || "Profile image";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[min(92vw,34rem)] max-w-[34rem] overflow-hidden rounded-[28px] border border-border/70 bg-background p-0">
        <DialogHeader className="border-b border-border/70 px-6 py-4">
          <DialogTitle className="text-base font-semibold">
            {resolvedName}
          </DialogTitle>
          {username && username !== displayName ? (
            <p className="text-sm text-muted-foreground">@{username}</p>
          ) : null}
        </DialogHeader>

        <div className="flex items-center justify-center bg-muted/20 p-6 sm:p-8">
          <div className="flex h-[18rem] w-[18rem] items-center justify-center overflow-hidden rounded-full border border-border/70 bg-card shadow-sm sm:h-[22rem] sm:w-[22rem]">
            {imageUrl ? (
              <Avatar className="h-full w-full rounded-full">
                <AvatarImage
                  src={imageUrl}
                  alt={resolvedName}
                  className="h-full w-full object-cover"
                />
                <AvatarFallback className="text-5xl font-semibold">
                  {getInitials(resolvedName)}
                </AvatarFallback>
              </Avatar>
            ) : (
              <Avatar className="h-full w-full rounded-full">
                <AvatarFallback className="text-5xl font-semibold">
                  {getInitials(resolvedName)}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
