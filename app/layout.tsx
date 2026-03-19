import type { Metadata } from "next";
import { Manrope, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import ClientErrorBoundary from "../components/error-handling/ClientErrorBoundary";
import { ToastContainer } from "../components/error-handling/ToastContainer";
import ProtectedRoute from "../components/ProtectedRoute";
import { ThemeContextProvider } from "../contexts/ThemeContext";
import AuthHydrator from "./auth-hydrator";
import "./globals.css";
import Providers from "./providers";
import { cn } from "@/lib/utils";

const bodyFont = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const headingFont = Manrope({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ankuaru - Premium Coffee Auctions",
  description: "Specialty Hub for B2B Coffee Auctions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn(bodyFont.variable, headingFont.variable)}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          <ClientErrorBoundary>
            <AuthHydrator />
            <ThemeContextProvider>
              <ProtectedRoute>{children}</ProtectedRoute>
              <Toaster
                richColors
                position="top-center"
                toastOptions={{
                  style: {
                    fontFamily: "var(--font-body)",
                  },
                }}
              />
              <ToastContainer />
            </ThemeContextProvider>
          </ClientErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
