"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import apiClient from "../../lib/api";
import { Notification, User } from "../../lib/types";
import ThemeToggle from "../ui/ThemeToggle";

export default function Header() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isFollowersOpen, setIsFollowersOpen] = useState(false);
  const [followers, setFollowers] = useState<User[]>([]);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

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

  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await apiClient.getMyNotifications();
        const parsedData = Array.isArray(data)
          ? data
          : (data as any).notifications || [];
        parsedData.sort(
          (a: any, b: any) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        setNotifications(parsedData);
        setUnreadCount(
          parsedData.filter((n: Notification) => !n.is_read).length,
        );
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };

    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleNotificationClick = async (n: Notification) => {
    if (!n.is_read) {
      try {
        await apiClient.markNotificationRead(n.id);
        setNotifications((prev) =>
          prev.map((notif) =>
            notif.id === n.id ? { ...notif, is_read: true } : notif,
          ),
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Failed to mark notification as read", error);
      }
    }
  };

  const changePage = () => {
    if (pathname === "/feed") {
      router.push("/dashboard");
    } else {
      router.push("/feed");
    }
  };

  const handleFollowersClick = async () => {
    setIsProfileOpen(false);
    setIsFollowersOpen(true);
    setIsLoadingFollowers(true);
    try {
      const data = await apiClient.getMyFollowers();
      setFollowers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch followers", error);
    } finally {
      setIsLoadingFollowers(false);
    }
  };

  const handleLogout = () => {
    logout();
    // Close any open dropdowns
    setIsNotificationsOpen(false);
    setIsProfileOpen(false);
    setIsFollowersOpen(false);
    window.location.href = "/login";
  };

  const handleUnfollow = async (id: string) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to unfollow this user?")) return;

    try {
      await apiClient.unfollowUser(id);
      setFollowers((prev) => prev.filter((f) => f.id !== id));
    } catch (error) {
      console.error("Failed to unfollow user", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-coffee-bean/10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-4 md:px-10 lg:px-40 py-3">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between relative">
        {/* Logo */}
        <Link href="/feed" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-2xl">coffee</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold leading-none tracking-tight text-coffee-bean dark:text-slate-100">
              Ankuaru
            </h1>
          </div>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <button
                onClick={changePage}
                className="relative flex h-10 px-4 items-center justify-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-200"
                title={pathname === "/feed" ? "Go to Dashboard" : "Go to Feed"}
              >
                <span className="material-symbols-outlined">
                  {pathname === "/feed" ? "space_dashboard" : "dynamic_feed"}
                </span>
                <span className="text-sm font-semibold hidden sm:block">
                  {pathname === "/feed" ? "Dashboard" : "Feed"}
                </span>
              </button>

              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-200"
                title="Notifications"
              >
                <span className="material-symbols-outlined">notifications</span>
                {unreadCount > 0 && (
                  <span className="absolute right-2.5 top-2.5 flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                  </span>
                )}
              </button>

              <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700"></div>

              <div
                className="flex items-center gap-3 relative"
                ref={profileRef}
              >
                {user && (
                  <div className="hidden text-right md:block">
                    <p className="text-sm font-bold leading-none">
                      {user.username}
                    </p>
                    <p className="text-[11px] font-medium text-slate-500">
                      Master Roaster
                    </p>
                  </div>
                )}
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="h-10 w-10 rounded-full border-2 border-white dark:border-slate-700 bg-coffee-cream shadow-sm overflow-hidden hover:opacity-80 transition-opacity"
                >
                  <img
                    alt="Avatar"
                    className="h-full w-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAYzTLgf9Glq2aTVTcK4XYI5sjPBX-ADGt3SDQVQphrpXikLgiGDgQ4BBKFZ3Mv_BRjChOVtU2n69B24rghLJNgdDs5lYM0qgauupN1jDoxI0Udv6lZi9QafFa4R67fljtUcVAiOVlUC1ZtSO7HNsPHJLvklrDcchEy6IjHACP6jjtInyJecVWe5Oy41QTBrjHHXKB60oIksw7KpsjeAcU-wPWrcLn7dBqUYBXBX_H7O4WJkYVPMwXK57I4duHDV86iNTXFW3f1ys4"
                  />
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900 z-[100]">
                    <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                      {/* <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {user?.username || "Account"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Signed in
                      </p> */}

                      {/* User ID Section */}
                      {user?.id && (
                        <div className="mt-3 flex items-center justify-between rounded-md bg-slate-50 dark:bg-slate-800/80 p-2 border border-slate-200 dark:border-slate-700">
                          <div className="flex flex-col overflow-hidden">
                            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 mb-0.5">
                              User ID
                            </span>
                            <p
                              className="text-xs font-mono text-slate-700 dark:text-slate-300 truncate"
                              title={user.id}
                            >
                              {user.id}
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(user.id);
                              setIsCopied(true);
                              setTimeout(() => setIsCopied(false), 2000);
                            }}
                            className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md ml-2 transition-colors ${isCopied
                              ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-white text-slate-500 hover:text-primary hover:bg-primary/10 border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400"
                              }`}
                            title="Copy ID"
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {isCopied ? "check" : "content_copy"}
                            </span>
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between px-4 py-3">
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Theme
                      </p>
                      <ThemeToggle />
                    </div>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        router.push("/track");
                      }}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 border-b border-slate-100 dark:border-slate-800"
                    >
                      <span className="material-symbols-outlined text-base">
                        visibility
                      </span>
                      Track Auction
                    </button>
                    <button
                      onClick={handleFollowersClick}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50"
                    >
                      <span className="material-symbols-outlined text-base">
                        group
                      </span>
                      Followers
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <span className="material-symbols-outlined text-base">
                        logout
                      </span>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* <Link
                href="/login"
                className="bg-primary hover:bg-primary-dark active:scale-[0.98] text-white font-bold py-2.5 px-6 rounded-lg shadow-lg shadow-primary/20 transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined">login</span>
                Login
              </Link>
              <Link
                href="/register"
                className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg px-6 py-2.5 font-semibold transition-all flex items-center gap-2"
              >
                <span className="material-symbols-outlined">how_to_reg</span>
                Register
              </Link> */}
            </>
          )}
        </div>

        {/* Notifications Modal */}
        {isNotificationsOpen && (
          <div className="absolute top-16 right-0 w-[90vw] md:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 z-[100]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-900 dark:text-white">
                Notifications
              </h3>
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.slice(0, 3).map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleNotificationClick(n)}
                  className={`p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer ${!n.is_read ? "bg-slate-50 dark:bg-slate-800/50" : ""
                    }`}
                >
                  <div className="flex gap-3">
                    <span
                      className={`material-symbols-outlined text-xl ${n.type === "AUCTION_WON" || n.type === "success"
                        ? "text-primary"
                        : n.type === "fail"
                          ? "text-red-500"
                          : "text-amber-500"
                        }`}
                    >
                      {n.type === "AUCTION_WON" || n.type === "success"
                        ? "check_circle"
                        : n.type === "fail"
                          ? "error"
                          : "notifications"}
                    </span>
                    <div className="flex flex-col gap-1 w-full justify-center">
                      <p
                        className={`text-xs ${!n.is_read ? "font-bold" : "font-medium"} text-slate-800 dark:text-slate-200 leading-normal`}
                      >
                        {n.title || n.message || (n as any).text}
                      </p>
                      {n.winner_agreement_file_url && (
                        <div className="mt-1">
                          <a
                            href={n.winner_agreement_file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary transition-colors hover:bg-primary/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationClick(n);
                            }}
                          >
                            <span className="material-symbols-outlined text-[14px]">picture_as_pdf</span>
                            View PDF
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="p-6 text-center text-sm text-slate-500">
                  No notifications yet.
                </div>
              )}
            </div>
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <Link
                href="/notifications"
                onClick={() => {
                  sessionStorage.setItem("returnUrl", window.location.pathname);
                  setIsNotificationsOpen(false);
                }}
                className="block w-full text-center text-sm font-semibold text-primary hover:text-primary-dark transition-colors"
              >
                View All Notifications
              </Link>
            </div>
          </div>
        )}

        {/* Followers Modal */}
        {isFollowersOpen && (
          <div className="absolute top-16 right-0 w-[90vw] md:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 z-[100]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-900 dark:text-white">
                My Followers
              </h3>
              <button
                onClick={() => setIsFollowersOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto p-4">
              {isLoadingFollowers ? (
                <div className="flex justify-center p-4">
                  <span className="material-symbols-outlined animate-spin text-primary">
                    autorenew
                  </span>
                </div>
              ) : followers && followers.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {followers.map((f) => (
                    <div className="flex justify-between">
                      <div key={f.id} className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 text-sm font-bold uppercase">
                          {f.username?.[0] || "?"}
                        </div>
                        <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {f.username}
                        </span>
                      </div>
                      <button onClick={() => handleUnfollow(f.id)} className="text-sm font-medium text-slate-800 dark:text-slate-200 px-2 py-1 cursor-pointer rounded-md bg-red-200 dark:bg-red-200">
                        Unfollow
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">
                  No followers yet.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
