"use client";

import { useTheme } from "../../contexts/ThemeContext";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const getThemeIcon = (currentTheme: string) => {
    switch (currentTheme) {
      case "light":
        return "light_mode";
      case "dark":
        return "dark_mode";
      default:
        return "light_mode";
    }
  };

  const getThemeLabel = (currentTheme: string) => {
    switch (currentTheme) {
      case "light":
        return "Light";
      case "dark":
        return "Dark";
      default:
        return "Light";
    }
  };

  return (
    <button
      onClick={cycleTheme}
      className="group relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 transition-all duration-200"
      title={`Current theme: ${getThemeLabel(theme)}. Click to cycle themes.`}
    >
      <span className="material-symbols-outlined text-lg text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors">
        {getThemeIcon(theme)}
      </span>
    </button>
  );
}
