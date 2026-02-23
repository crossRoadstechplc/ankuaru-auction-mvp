"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const changePage = () => {
    if (pathname === "/feed") {
      router.push("/dashboard");
    } else {
      router.push("/feed");
    }
  };

  const handleLogout = () => {
    logout();
    // Close any open dropdowns
    setIsNotificationsOpen(false);
    setIsProfileOpen(false);
    window.location.href = "/login";
  };

  const notifications = [
    {
      id: 1,
      text: "You have 3 new bids",
      type: "success",
      link: "/feed",
    },
    {
      id: 2,
      text: "Auction ending soon",
      type: "warning",
      link: "/feed",
    },
  ];

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
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
              Specialty Hub
            </span>
          </div>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <button
                onClick={changePage}
                className="relative flex h-10 px-4 items-center justify-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-200"
                title={pathname === "/feed" ? "Go to Dashboard" : "Go toFeed"}
              >
                <span className="material-symbols-outlined">
                  {pathname === "/feed" ? "space_dashboard" : "dynamic_feed"}
                </span>
                <span className="text-sm font-semibold hidden sm:block">
                  {pathname === "/feed" ? "Dashboard" : "Feed"}
                </span>
              </button>

              <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700"></div>

              <div className="flex items-center gap-3 relative">
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
                  <div className="absolute right-0 top-12 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900 z-[100]">
                    <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {user?.username || "Account"}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Signed in
                      </p>
                    </div>
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
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex gap-3">
                    <span
                      className={`material-symbols-outlined text-xl ${n.type === "success"
                        ? "text-primary"
                        : n.type === "fail"
                          ? "text-red-500"
                          : "text-amber-500"
                        }`}
                    >
                      {n.type === "success"
                        ? "check_circle"
                        : n.type === "fail"
                          ? "error"
                          : "warning"}
                    </span>
                    <div className="flex flex-col gap-1">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-normal">
                        {n.text}
                      </p>
                      {n.link && (
                        <Link
                          href={n.link}
                          className="text-[10px] font-bold text-primary uppercase tracking-widest hover:underline mt-1"
                          onClick={() => setIsNotificationsOpen(false)}
                        >
                          View Detail
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
