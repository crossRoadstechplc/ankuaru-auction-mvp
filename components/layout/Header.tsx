"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const notifications = [
    {
      id: 1,
      text: "Congra you are win the bid and can to the next step smart contract",
      type: "success",
      link: "/auction/1",
    },
    {
      id: 2,
      text: "Failed: not have candidate for your last auction",
      type: "fail",
    },
    {
      id: 3,
      text: "You have issued for this auction and not read yet",
      type: "warning",
      link: "/auction/2",
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-coffee-bean/10 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md px-4 md:px-10 lg:px-40 py-3">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between relative">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-2xl">coffee</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-extrabold leading-none tracking-tight text-coffee-bean dark:text-slate-100">
              Ankuaru
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Specialty Hub</span>
          </div>
        </Link>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors hover:bg-slate-200"
          >
            <span className="material-symbols-outlined">notifications</span>
            <span className="absolute right-2.5 top-2.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
            </span>
          </button>

          <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-700"></div>

          <div className="flex items-center gap-3 relative">
            <div className="hidden text-right md:block">
              <p className="text-sm font-bold leading-none">James Arabica</p>
              <p className="text-[11px] font-medium text-slate-500">Master Roaster</p>
            </div>
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

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div className="absolute top-12 right-0 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-2 animate-in fade-in slide-in-from-top-2">
                <Link
                  href="/dashboard"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary rounded-lg transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">dashboard</span>
                  User Dashboard
                </Link>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                <button className="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-lg">logout</span>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Notifications Modal */}
        {isNotificationsOpen && (
          <div className="absolute top-16 right-0 w-[90vw] md:w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 z-[100]">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
              <h3 className="font-bold text-slate-900 dark:text-white">Notifications</h3>
              <button
                onClick={() => setIsNotificationsOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((n) => (
                <div key={n.id} className="p-4 border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex gap-3">
                    <span className={`material-symbols-outlined text-xl ${n.type === 'success' ? 'text-primary' : n.type === 'fail' ? 'text-red-500' : 'text-amber-500'
                      }`}>
                      {n.type === 'success' ? 'check_circle' : n.type === 'fail' ? 'error' : 'warning'}
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
