import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "../contexts/AuthContext";
import { ThemeContextProvider } from "../contexts/ThemeContext";
import ProtectedRoute from "../components/ProtectedRoute";
import "./globals.css";

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
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={`${inter.variable} font-display antialiased`}>
        <ThemeContextProvider>
          <AuthProvider>
            <ProtectedRoute>
              {children}
            </ProtectedRoute>
            <Toaster
              richColors
              position="top-center"
              toastOptions={{
                style: {
                  fontFamily: "var(--font-inter)",
                },
              }}
            />
          </AuthProvider>
        </ThemeContextProvider>
      </body>
    </html>
  );
}
