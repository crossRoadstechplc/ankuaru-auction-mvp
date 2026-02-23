"use client";

import { useEffect } from "react";
import { useTheme } from "./ThemeContext";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove("light", "dark");
    
    // Add the current theme class
    root.classList.add(theme === "system" ? 
      (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light") 
      : theme
    );
  }, [theme]);

  return <>{children}</>;
}
