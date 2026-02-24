"use client";

import { useEffect, useState } from "react";
import apiClient from "../../lib/api";
import { Notification } from "../../lib/types";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [returnUrl, setReturnUrl] = useState('/feed');
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated) {
            router.push("/login");
            return;
        }

        const fetchNotifications = async () => {
            try {
                const data = await apiClient.getMyNotifications();
                const parsedData = Array.isArray(data) ? data : ((data as any).notifications || []);
                parsedData.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                setNotifications(parsedData);
            } catch (error) {
                console.error("Failed to fetch notifications", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchNotifications();
        }

        if (typeof sessionStorage !== 'undefined') {
            setReturnUrl(sessionStorage.getItem('returnUrl') || '/feed');
        }
    }, [isAuthenticated, isAuthLoading, router]);

    const handleNotificationClick = async (n: Notification) => {
        if (!n.is_read) {
            try {
                await apiClient.markNotificationRead(n.id);
                setNotifications((prev) =>
                    prev.map(notif => notif.id === n.id ? { ...notif, is_read: true } : notif)
                );
            } catch (error) {
                console.error("Failed to mark notification as read", error);
            }
        }
    };

    const markAllAsRead = async () => {
        const unreadNotifications = notifications.filter(n => !n.is_read);

        for (const n of unreadNotifications) {
            try {
                await apiClient.markNotificationRead(n.id);
            } catch (error) {
                console.error(`Failed to mark notification ${n.id} as read`, error);
            }
        }

        setNotifications((prev) =>
            prev.map(notif => ({ ...notif, is_read: true }))
        );
    };

    if (isAuthLoading || isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>
            </div>
        );
    }

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className="container mx-auto max-w-4xl px-4 py-8">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push(returnUrl)}
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Go back"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                            Notifications
                        </h1>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                            Stay updated with your latest bids and auctions
                        </p>
                    </div>
                </div>
                {unreadCount > 0 && (
                    <button
                        onClick={markAllAsRead}
                        className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
                    >
                        Mark all as read
                    </button>
                )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
                {notifications.length > 0 ? (
                    <div className="flex flex-col">
                        {notifications.map((n) => (
                            <div
                                key={n.id}
                                onClick={() => handleNotificationClick(n)}
                                className={`flex cursor-pointer items-start gap-4 border-b border-slate-100 p-6 transition-colors last:border-b-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50 ${!n.is_read ? "bg-slate-50 dark:bg-slate-800/30" : ""
                                    }`}
                            >
                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                                    <span
                                        className={`material-symbols-outlined text-2xl ${n.type === "AUCTION_WON" || n.type === "success"
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
                                </div>

                                <div className="flex w-full flex-col gap-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1 pr-4">
                                            <p className={`text-base flex-1 ${!n.is_read ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'} leading-relaxed`}>
                                                {n.title || n.message || (n as any).text}
                                            </p>
                                            {n.winner_agreement_file_url && (
                                                <div className="mt-2">
                                                    <a
                                                        href={n.winner_agreement_file_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleNotificationClick(n);
                                                        }}
                                                    >
                                                        <span className="material-symbols-outlined text-base">picture_as_pdf</span>
                                                        View Agreement PDF
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                        {!n.is_read && (
                                            <span className="mt-1 flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-primary" />
                                        )}
                                    </div>
                                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                        {new Date(n.created_at).toLocaleString(undefined, {
                                            month: 'short',
                                            day: 'numeric',
                                            hour: 'numeric',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                            <span className="material-symbols-outlined text-3xl text-slate-400">
                                notifications_off
                            </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                            No notifications yet
                        </h3>
                        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                            When you get bids or updates on your auctions, they'll show up here.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
