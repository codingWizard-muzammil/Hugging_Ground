"use client";

import { useSyncExternalStore } from "react";
import { IconMoon, IconSun } from "@/components/icons";
import {
  getThemeServerSnapshot,
  getThemeSnapshot,
  setTheme,
  subscribeTheme,
} from "@/lib/theme-store";

export function ThemeToggle() {
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getThemeServerSnapshot);

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-fg-muted transition-colors hover:bg-bg-inset hover:text-fg"
    >
      {theme === "dark" ? <IconSun /> : <IconMoon />}
    </button>
  );
}
