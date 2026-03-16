"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PublicUserProfileView from "./PublicUserProfileView";

interface PublicUserProfileModalProps {
  userId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PublicUserProfileModal({
  userId,
  open,
  onOpenChange,
}: PublicUserProfileModalProps) {
  if (!userId) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[94vh] max-h-[94vh] w-[calc(100vw-0.75rem)] max-w-[calc(100vw-0.75rem)] overflow-hidden p-0 sm:h-[96vh] sm:max-h-[96vh] sm:w-[calc(100vw-1.5rem)] sm:max-w-[calc(100vw-1.5rem)]">
        <DialogHeader className="border-b border-border/60 px-6 py-5 lg:px-8">
          <DialogTitle className="text-lg font-semibold">
            User Profile
          </DialogTitle>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto px-6 py-6 lg:px-8">
          <PublicUserProfileView userId={userId} variant="modal" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
