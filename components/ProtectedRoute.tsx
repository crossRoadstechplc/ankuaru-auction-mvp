"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";

// Routes that don't require authentication
const PUBLIC_ROUTES = ["/login", "/register"];

interface ProtectedRouteProps {
    children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    const isPublicRoute = PUBLIC_ROUTES.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
    );

    const [minLoadingTimeReached, setMinLoadingTimeReached] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setMinLoadingTimeReached(true);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!isLoading && minLoadingTimeReached && !isAuthenticated && !isPublicRoute) {
            router.replace("/login");
        }
    }, [isLoading, minLoadingTimeReached, isAuthenticated, isPublicRoute, router]);

    // While auth state is being loaded, show a loading screen for protected routes
    if ((isLoading || !minLoadingTimeReached) && !isPublicRoute) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="flex flex-col items-center gap-6 animate-pulse">
                    <div className="flex items-center gap-3">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-xl shadow-primary/30">
                            <span className="material-symbols-outlined text-4xl">coffee</span>
                        </div>

                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-bold uppercase tracking-[0.2em]">
                        Loading Experience...
                    </p>
                </div>
            </div>
        );
    }

    // Don't render protected content if not authenticated (redirect is in progress)
    if (!isAuthenticated && !isPublicRoute) {
        return null;
    }

    return <>{children}</>;
}
