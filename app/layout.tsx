import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import { Toaster } from "sonner";
import ClientErrorBoundary from "../components/error-handling/ClientErrorBoundary";
import { ToastContainer } from "../components/error-handling/ToastContainer";
import ProtectedRoute from "../components/ProtectedRoute";
import { ThemeContextProvider } from "../contexts/ThemeContext";
import AuthHydrator from "./auth-hydrator";
import "./globals.css";
import Providers from "./providers";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
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
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-display antialiased`}>
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
                    fontFamily: "var(--font-inter)",
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
