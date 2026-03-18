"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import MarketTickerBar from "@/components/layout/MarketTickerBar";
import { cn } from "../../lib/utils";
import { useNotificationsWithRealTimeQuery } from "@/src/features/notifications/queries/hooks";
import { resolveNotificationPresentation } from "@/src/features/notifications/utils/notification-routing";
import {
  useApproveFollowRequestMutation,
  useMyFollowRequestsQuery,
  useMySentFollowRequestsQuery,
  useMyProfileQuery,
  useRejectFollowRequestMutation,
  useUserInfoQuery,
} from "@/src/features/profile/queries/hooks";
import { useFavoriteAuctions } from "@/src/shared/favorites/favorite-auctions";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Notification } from "../../lib/types";
import { useAuthStore } from "../../stores/auth.store";
import ThemeToggle from "../ui/ThemeToggle";

type HeaderRequestUser = {
  id: string;
  username: string;
  fullName?: string;
  avatar?: string;
};

function isUnknownFollowRequestUser(value?: string): boolean {
  if (!value) {
    return true;
  }

  return value.startsWith("Unknown ");
}

function HeaderFollowRequestUser({
  user,
  dateLabel,
  status,
}: {
  user: HeaderRequestUser;
  dateLabel: string;
  status?: string;
}) {
  const shouldLookup =
    !!user.id &&
    (isUnknownFollowRequestUser(user.username) || !user.fullName);
  const { data: resolvedUser } = useUserInfoQuery(user.id, shouldLookup);

  const displayName =
    resolvedUser?.fullName ||
    user.fullName ||
    (isUnknownFollowRequestUser(resolvedUser?.username)
      ? undefined
      : resolvedUser?.username) ||
    (isUnknownFollowRequestUser(user.username) ? undefined : user.username) ||
    "User";
  const username =
    (isUnknownFollowRequestUser(resolvedUser?.username)
      ? undefined
      : resolvedUser?.username) ||
    (isUnknownFollowRequestUser(user.username) ? undefined : user.username);
  const avatar = resolvedUser?.avatar || resolvedUser?.profileImageUrl || user.avatar;

  return (
    <div className="flex w-full items-start gap-3">
      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
        {avatar ? (
          <img
            src={avatar}
            alt={displayName}
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="material-symbols-outlined text-sm">person</span>
        )}
      </div>
      <div className="flex flex-col gap-1 flex-1">
        <p className="text-sm font-medium text-foreground">{displayName}</p>
        {username ? (
          <p className="text-xs text-muted-foreground">@{username}</p>
        ) : null}
        <p className="text-xs text-muted-foreground">{dateLabel}</p>
      </div>
      {status ? (
        <Badge
          variant={
            status === "APPROVED"
              ? "secondary"
              : status === "REJECTED"
                ? "destructive"
                : "outline"
          }
          className="text-[10px]"
        >
          {status}
        </Badge>
      ) : null}
    </div>
  );
}

export default function Header() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRequestsOpen, setIsRequestsOpen] = useState(false);
  const [requestView, setRequestView] = useState<"incoming" | "sent">(
    "incoming",
  );
  const [isCopied, setIsCopied] = useState(false);

  // React Query hooks
  const {
    notifications,
    unreadCount,
    markAsRead,
    isLoading: isLoadingNotifications,
  } = useNotificationsWithRealTimeQuery();
  const {
    data: followRequests = [],
    isLoading: isLoadingRequests,
  } = useMyFollowRequestsQuery();
  const {
    data: sentFollowRequests = [],
    isLoading: isLoadingSentRequests,
  } = useMySentFollowRequestsQuery();
  const approveFollowRequestMutation = useApproveFollowRequestMutation();
  const rejectFollowRequestMutation = useRejectFollowRequestMutation();

  const authUserId = useAuthStore((state) => state.userId);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const logout = useAuthStore((state) => state.logout);
  const { data: user } = useMyProfileQuery();
  const { favoriteCount } = useFavoriteAuctions();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isFeedRoute = pathname === "/feed";
  const feedQuery = searchParams.get("q") ?? "";
  const incomingRequestCount = followRequests.length;
  const sentRequestCount = sentFollowRequests.length;
  const totalRequestCount = incomingRequestCount + sentRequestCount;

  const getNavButtonClassName = (active: boolean) =>
    cn(
      "h-9 gap-2 rounded-full px-3 text-sm font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md",
      active
        ? "border border-primary/20 bg-primary/10 text-primary hover:border-primary/30 hover:bg-primary/15 hover:text-primary"
        : "border border-border/60 bg-background/80 text-foreground hover:border-border hover:bg-accent/80 hover:text-accent-foreground",
    );

  const commitFeedSearch = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const normalizedValue = value.trim();

    if (normalizedValue) {
      params.set("q", normalizedValue);
    } else {
      params.delete("q");
    }

    const nextQuery = params.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  };

  const handleNotificationClick = async (n: Notification) => {
    if (!n.is_read) {
      await markAsRead(n.id);
    }
    const presentation = resolveNotificationPresentation(n);

    if (presentation.action.kind === "external") {
      window.open(presentation.action.href, "_blank", "noopener,noreferrer");
      return;
    }

    if (presentation.action.kind === "route") {
      router.push(presentation.action.href);
    }
  };

  const getNotificationText = (notification: Notification) => {
    const legacyNotification = notification as Notification & { text?: string };
    return (
      notification.title ||
      notification.message ||
      legacyNotification.text ||
      "Notification"
    );
  };

  const handleApproveRequest = async (requestId: string) => {
    try {
      await approveFollowRequestMutation.mutateAsync(requestId);
      toast.success("Follow request approved!");
    } catch {
      toast.error("Failed to approve follow request");
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await rejectFollowRequestMutation.mutateAsync(requestId);
      toast.success("Follow request rejected!");
    } catch {
      toast.error("Failed to reject follow request");
    }
  };

  const handleLogout = async () => {
    await logout();
    // Close any open dropdowns
    setIsNotificationsOpen(false);
    setIsProfileOpen(false);
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
        <div className="flex h-16 items-center justify-between gap-4">
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

          {isFeedRoute ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                commitFeedSearch(feedQuery);
              }}
              className="hidden xl:block xl:flex-1 xl:max-w-sm"
            >
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-base text-muted-foreground">
                  search
                </span>
                <Input
                  type="search"
                  value={feedQuery}
                  onChange={(event) => commitFeedSearch(event.target.value)}
                  placeholder="Search auctions, products, sellers"
                  className="h-9 rounded-full border-border/70 bg-muted/40 pl-9 pr-9 shadow-sm focus-visible:ring-primary/20"
                />
                {feedQuery ? (
                  <button
                    type="button"
                    onClick={() => commitFeedSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label="Clear search"
                  >
                    <span className="material-symbols-outlined text-[18px]">
                      close
                    </span>
                  </button>
                ) : null}
              </div>
            </form>
          ) : null}

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className={getNavButtonClassName(isFeedRoute)}
            >
              <Link href="/feed" className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">
                  storefront
                </span>
                Marketplace
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className={getNavButtonClassName(pathname === "/dashboard")}
            >
              <Link href="/dashboard" className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">
                  dashboard
                </span>
                Dashboard
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              asChild
              className={getNavButtonClassName(pathname === "/favorites")}
            >
              <Link href="/favorites" className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">
                  favorite
                </span>
                Favorites
                {favoriteCount > 0 ? (
                  <Badge variant="secondary" className="ml-1 text-[10px]">
                    {favoriteCount}
                  </Badge>
                ) : null}
              </Link>
            </Button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
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
                        notifications.slice(0, 5).map((n) => {
                          const presentation = resolveNotificationPresentation(n);

                          return (
                            <DropdownMenuItem
                              key={n.id}
                              onClick={() => handleNotificationClick(n)}
                              className="flex flex-col items-start p-4 cursor-pointer"
                            >
                              <div className="flex w-full items-start gap-3">
                                <div
                                  className={`flex h-8 w-8 items-center justify-center rounded-xl ${presentation.accentClassName}`}
                                >
                                  <span className="material-symbols-outlined text-sm">
                                    {presentation.iconName}
                                  </span>
                                </div>
                              <div className="flex flex-col gap-1 flex-1">
                                <p
                                  className={`text-sm ${!n.is_read ? "font-semibold" : "font-medium"} text-foreground`}
                                >
                                  {getNotificationText(n)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {presentation.action.kind === "none"
                                    ? "View details"
                                    : presentation.action.label}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(n.created_at).toLocaleTimeString()}
                                </p>
                              </div>
                              </div>
                            </DropdownMenuItem>
                          );
                        })
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
                  onOpenChange={(open) => {
                    setIsRequestsOpen(open);
                    if (!open) {
                      setRequestView("incoming");
                    }
                  }}
                >
                  <DropdownMenuTrigger className="relative h-9 w-9 rounded-md border border-border bg-background hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                    <span className="material-symbols-outlined">group_add</span>
                    {totalRequestCount > 0 && (
                      <Badge
                        variant="destructive"
                        className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                      >
                        {totalRequestCount}
                      </Badge>
                    )}
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-80">
                    <div className="flex items-center justify-between p-4">
                      <h3 className="font-semibold">Follow Requests</h3>
                      {requestView === "incoming" && incomingRequestCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {incomingRequestCount} pending
                        </Badge>
                      )}
                      {requestView === "sent" && sentRequestCount > 0 && (
                        <Badge variant="secondary" className="text-xs">
                          {sentRequestCount} sent
                        </Badge>
                      )}
                    </div>
                    <div className="px-4 pb-3">
                      <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted/40 p-1">
                        <button
                          type="button"
                          onClick={() => setRequestView("incoming")}
                          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                            requestView === "incoming"
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span>Incoming</span>
                          {incomingRequestCount > 0 ? (
                            <Badge variant="secondary" className="h-5 min-w-5 px-1 text-[10px]">
                              {incomingRequestCount}
                            </Badge>
                          ) : null}
                        </button>
                        <button
                          type="button"
                          onClick={() => setRequestView("sent")}
                          className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
                            requestView === "sent"
                              ? "bg-background text-foreground shadow-sm"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <span>Sent</span>
                          {sentRequestCount > 0 ? (
                            <Badge variant="secondary" className="h-5 min-w-5 px-1 text-[10px]">
                              {sentRequestCount}
                            </Badge>
                          ) : null}
                        </button>
                      </div>
                    </div>
                    <Separator />
                    <div className="max-h-96 overflow-y-auto">
                      {requestView === "incoming" && isLoadingRequests ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          Loading requests...
                        </div>
                      ) : requestView === "incoming" &&
                        followRequests &&
                        followRequests.length > 0 ? (
                        followRequests.slice(0, 5).map((request) => (
                          <div
                            key={request.id}
                            className="flex flex-col items-start p-4"
                          >
                            <HeaderFollowRequestUser
                              user={request.requester}
                              dateLabel={new Date(
                                request.createdAt,
                              ).toLocaleDateString()}
                            />
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
                      ) : requestView === "sent" && isLoadingSentRequests ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          Loading sent requests...
                        </div>
                      ) : requestView === "sent" &&
                        sentFollowRequests &&
                        sentFollowRequests.length > 0 ? (
                        sentFollowRequests.slice(0, 5).map((request) => (
                          <div
                            key={request.id}
                            className="flex flex-col items-start p-4"
                          >
                            <HeaderFollowRequestUser
                              user={request.target}
                              dateLabel={`Sent ${new Date(
                                request.createdAt,
                              ).toLocaleDateString()}`}
                              status={request.status}
                            />
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                          {requestView === "incoming"
                            ? "No follow requests."
                            : "No sent follow requests."}
                        </div>
                      )}
                    </div>
                    {((requestView === "incoming" &&
                      followRequests &&
                      followRequests.length > 0) ||
                      (requestView === "sent" &&
                        sentFollowRequests &&
                        sentFollowRequests.length > 0)) && (
                      <>
                        <Separator />
                        <div className="p-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full"
                            onClick={() => {
                              setIsRequestsOpen(false);
                              router.push(
                                `/profile?tab=requests&requestView=${requestView}`,
                              );
                            }}
                          >
                            {requestView === "incoming"
                              ? "View all incoming requests"
                              : "View all sent requests"}
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
                        navigator.clipboard.writeText(user?.id || authUserId || "");
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
                    <div className="flex items-center justify-between px-2 py-2">
                      <div className="flex flex-col">
                        <p className="text-sm font-medium text-foreground">
                          Theme
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Switch light and dark mode
                        </p>
                      </div>
                      <ThemeToggle />
                    </div>
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
      <MarketTickerBar />
    </header>
  );
}
