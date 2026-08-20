import { loadTheme, saveTheme, type ThemePreference } from "@/lib/storage";

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeTheme(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getThemeSnapshot(): ThemePreference {
  return loadTheme() ?? "dark";
}

export function getThemeServerSnapshot(): ThemePreference {
  return "dark";
}

export function setTheme(theme: ThemePreference) {
  saveTheme(theme);
  document.documentElement.classList.toggle("dark", theme === "dark");
  listeners.forEach((listener) => listener());
}
