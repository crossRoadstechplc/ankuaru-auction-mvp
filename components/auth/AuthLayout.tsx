"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  imagePosition: "left" | "right";
  imageSrc?: string;
  imageAlt?: string;
  showImageContent?: boolean;
  className?: string;
}

export function AuthLayout({
  children,
  imagePosition = "right",
  imageSrc = "/login.avif",
  imageAlt = "Coffee Auction",
  showImageContent = true,
  className,
}: AuthLayoutProps) {
  const imageSection = (
    <div className="flex-1 relative overflow-hidden bg-gradient-to-br from-primary/10 to-primary/30 animate-in slide-in-from-right duration-700 min-h-[200px] lg:min-h-full">
      <img
        src={imageSrc}
        alt={imageAlt}
        className="w-full h-full object-cover"
      />
      {showImageContent && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
      )}
    </div>
  );

  const formSection = (
    <div className="flex-1 flex flex-col justify-center p-6 lg:p-8 animate-in slide-in-from-left duration-700">
      <div className="w-full max-w-sm mx-auto">{children}</div>
    </div>
  );

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 min-h-screen flex items-center justify-center p-4 font-sans">
      <div
        className={cn(
          "w-full max-w-6xl bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden animate-in fade-in duration-500",
          className,
        )}
      >
        <div className="flex flex-col lg:flex-row min-h-[400px] lg:h-[500px]">
          {imagePosition === "left" ? imageSection : formSection}
          {imagePosition === "left" ? formSection : imageSection}
        </div>
      </div>
    </div>
  );
}
