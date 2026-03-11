"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useMyFollowers } from "../../hooks/useFollowers";
import { useNotificationsWithRealTime } from "../../hooks/useNotifications";
import { useMyFollowRequests } from "../../hooks/useProfile";
import { graphQLApiClient } from "../../lib/graphql-api";
import { Notification } from "../../lib/types";
import { useAuthStore } from "../../stores/auth.store";
import ThemeToggle from "../ui/ThemeToggle";

export default function Header() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFollowersOpen, setIsFollowersOpen] = useState(false);
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // React Query hooks
  const { data: followers = [], isLoading: isLoadingFollowers } =
    useMyFollowers();
  const {
    notifications,
    unreadCount,
    markAsRead,
    isLoading: isLoadingNotifications,
  } = useNotificationsWithRealTime();
  const {
    data: followRequests = [],
    isLoading: isLoadingRequests,
    refetch: refetchRequests,
  } = useMyFollowRequests();

  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const pathname = usePathname();

  const handleNotificationClick = async (n: Notification) => {
    if (!n.is_read) {
      await markAsRead(n.id);
    }
    // Handle notification navigation logic here
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      await graphQLApiClient.approveFollowRequest(requestId);
      toast.success("Follow request approved!");
      refetchRequests();
    } catch (error) {
      toast.error("Failed to approve follow request");
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await graphQLApiClient.rejectFollowRequest(requestId);
      toast.success("Follow request rejected!");
      refetchRequests();
    } catch (error) {
      toast.error("Failed to reject follow request");
    }
  };

  const changePage = () => {
    if (pathname === "/feed") {
      router.push("/dashboard");
    } else {
      router.push("/feed");
    }
  };

  const handleFollowersClick = () => {
    setIsProfileOpen(false);
    setIsFollowersOpen(true);
  };

  const handleUnfollow = async (id: string) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to unfollow this user?")) return;

    try {
      await graphQLApiClient.unfollowUser(id);
      // React Query will automatically refetch followers
    } catch (error) {
      console.error("Failed to unfollow user", error);
    }
  };

  const handleLogout = async () => {
    await logout();
    // Close any open dropdowns
    setIsNotificationsOpen(false);
    setIsProfileOpen(false);
    setIsFollowersOpen(false);
    setIsRequestsOpen(false);
    window.location.href = "/login";
  };

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/feed" className="flex items-center space-x-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white shadow-sm group-hover:shadow-md transition-shadow">
              <span className="material-symbols-outlined text-lg">coffee</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold leading-none tracking-tight text-foreground group-hover:text-primary transition-colors">
                Ankuaru
              </h1>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                B2B Auctions
              </span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Button
              variant={pathname === "/feed" ? "secondary" : "ghost"}
              size="sm"
              asChild
            >
              <Link href="/feed" className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">
                  storefront
                </span>
                Marketplace
              </Link>
            </Button>
            <Button
              variant={pathname === "/dashboard" ? "secondary" : "ghost"}
              size="sm"
              asChild
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">
                  dashboard
                </span>
                Dashboard
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/track" className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">
                  track_changes
                </span>
                Track
              </Link>
            </Button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <DropdownMenu
                  open={isNotificationsOpen}
                  onOpenChange={setIsNotificationsOpen}
                >
                  <DropdownMenuTrigger className="relative h-9 w-9 rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                    <span className="material-symbols-outlined">
                      notifications
                    </span>
                    {unreadCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="flex items-center justify-between p-4">
                      <h3 className="font-semibold">Notifications</h3>
                      {unreadCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {unreadCount} new
                        </Badge>
                      )}
                    </div>
                    <Separator />
                    <div className="max-h-96 overflow-y-auto">
                      {isLoadingNotifications ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          Loading notifications...
                        </div>
                      ) : notifications && notifications.length > 0 ? (
                        notifications.slice(0, 5).map((n) => (
                          <DropdownMenuItem
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className="flex flex-col items-start p-4 cursor-pointer"
                          >
                            <div className="flex w-full items-start gap-3">
                              <span
                                className={`material-symbols-outlined text-sm mt-0.5 ${
                                  n.type === "AUCTION_WON" ||
                                  n.type === "success"
                                    ? "text-green-600"
                                    : n.type === "fail"
                                      ? "text-red-600"
                                      : "text-amber-600"
                                }`}
                              >
                                {n.type === "AUCTION_WON" ||
                                n.type === "success"
                                  ? "check_circle"
                                  : n.type === "fail"
                                    ? "error"
                                    : "notifications"}
                              </span>
                              <div className="flex flex-col gap-1 flex-1">
                                <p
                                  className={`text-sm ${!n.is_read ? "font-semibold" : "font-medium"} text-foreground`}
                                >
                                  {n.title || n.message || (n as any).text}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(n.created_at).toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          </DropdownMenuItem>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No notifications yet.
                        </div>
                      )}
                    </div>
                    {notifications && notifications.length > 0 && (
                      <>
                        <Separator />
                        <div className="p-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            asChild
                          >
                            <Link href="/notifications">
                              View all notifications
                            </Link>
                          </Button>
                        </div>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Follow Requests */}
                <DropdownMenu
                  open={isRequestsOpen}
                  onOpenChange={setIsRequestsOpen}
                >
                  <DropdownMenuTrigger className="relative h-9 w-9 rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                    <span className="material-symbols-outlined">group_add</span>
                    {followRequests.length > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {followRequests.length}
                      </Badge>
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="flex items-center justify-between p-4">
                      <h3 className="font-semibold">Follow Requests</h3>
                      {followRequests.length > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {followRequests.length} pending
                        </Badge>
                      )}
                    </div>
                    <Separator />
                    <div className="max-h-96 overflow-y-auto">
                      {isLoadingRequests ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          Loading requests...
                        </div>
                      ) : followRequests && followRequests.length > 0 ? (
                        followRequests.slice(0, 5).map((request) => (
                          <div
                            key={request.id}
                            className="flex flex-col items-start p-4"
                          >
                            <div className="flex w-full items-start gap-3">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                {request.requester?.avatar ? (
                                  <img
                                    src={request.requester?.avatar}
                                    alt={
                                      request.requester?.fullName ||
                                      request.requester?.username
                                    }
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="material-symbols-outlined text-sm">
                                    person
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-col gap-1 flex-1">
                                <p className="text-sm font-medium text-foreground">
                                  {request.requester?.fullName ||
                                    request.requester?.username}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  @{request.requester?.username}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(
                                    request.createdAt,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                              <button
                                onClick={() => handleApproveRequest(request.id)}
                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg font-medium transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleRejectRequest(request.id)}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg font-medium transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          No follow requests.
                        </div>
                      )}
                    </div>
                    {followRequests && followRequests.length > 0 && (
                      <>
                        <Separator />
                        <div className="p-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              setIsRequestsOpen(false);
                              router.push("/profile?tab=requests");
                            }}
                          >
                            View all requests
                          </Button>
                        </div>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Profile Dropdown */}
                <DropdownMenu
                  open={isProfileOpen}
                  onOpenChange={setIsProfileOpen}
                >
                  <DropdownMenuTrigger className="h-8 w-8 rounded-full border border-border bg-background hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 overflow-hidden">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.username || "Profile"}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                        {user?.username?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user?.username}</p>
                        <p className="text-xs text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <Separator />
                    <DropdownMenuItem
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => router.push("/profile")}
                    >
                      <span className="material-symbols-outlined text-sm">
                        person
                      </span>
                      My Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() => router.push("/track")}
                    >
                      <span className="material-symbols-outlined text-sm">
                        track_changes
                      </span>
                      Track Auction
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        navigator.clipboard.writeText(user?.id || "");
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                      }}
                      className="flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {isCopied ? "check" : "copy_all"}
                      </span>
                      Copy User ID
                    </DropdownMenuItem>
                    <Separator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center gap-2 text-red-600 focus:text-red-600"
                    >
                      <span className="material-symbols-outlined text-sm">
                        logout
                      </span>
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
