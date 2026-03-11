import * as React from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export interface UserAvatarProps {
  src?: string | null
  name?: string | null
  size?: "sm" | "md" | "lg"
  className?: string
}

export function UserAvatar({ src, name, size = "md", className }: UserAvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  }

  // Generate fallback initials (up to 2 characters)
  const getInitials = (name?: string | null) => {
    if (!name) return "?"
    const parts = name.trim().split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  return (
    <Avatar className={cn(sizeClasses[size], "border border-border shadow-sm", className)}>
      {src && <AvatarImage src={src} alt={name || "User avatar"} className="object-cover" />}
      <AvatarFallback className="bg-muted text-muted-foreground font-medium text-xs">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  )
}
