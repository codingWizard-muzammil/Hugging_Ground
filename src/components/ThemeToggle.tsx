"use client";

import { useEffect, useState } from "react";
import { IconMoon, IconSun } from "@/components/icons";
import { loadTheme, saveTheme, type ThemePreference } from "@/lib/storage";

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemePreference>("dark");

  useEffect(() => {
    const current = document.documentElement.classList.contains("dark") ? "dark" : "light";
    setTheme(current);
  }, []);

  function toggle() {
    const next: ThemePreference = theme === "dark" ? "light" : "dark";
    setTheme(next);
    saveTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-fg-muted transition-colors hover:bg-bg-inset hover:text-fg"
    >
      {theme === "dark" ? <IconSun /> : <IconMoon />}
    </button>
  );
}
