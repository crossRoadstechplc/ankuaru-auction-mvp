"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
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

    useEffect(() => {
        if (!isLoading && !isAuthenticated && !isPublicRoute) {
            router.replace("/login");
        }
    }, [isLoading, isAuthenticated, isPublicRoute, router]);

    // While auth state is being loaded, show a loading screen for protected routes
    if (isLoading && !isPublicRoute) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="flex flex-col items-center gap-4">
                    <div className="size-12 bg-primary flex items-center justify-center rounded-xl text-white shadow-lg shadow-primary/20 animate-pulse">
                        <svg
                            className="w-8 h-8"
                            fill="none"
                            viewBox="0 0 48 48"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M4 4H17.3334V17.3334H30.6666V30.6666H44V44H4V4Z"
                                fill="currentColor"
                            />
                        </svg>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium animate-pulse">
                        Loading...
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
