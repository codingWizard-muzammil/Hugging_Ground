const API_KEY_STORAGE_KEY = "hg:hf-token";
const RECENT_MODELS_KEY = "hg:recent-models";
const THEME_KEY = "hg:theme";

export function loadApiKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(API_KEY_STORAGE_KEY);
  } catch {
    return null;
  }
}

export function saveApiKey(key: string) {
  try {
    window.localStorage.setItem(API_KEY_STORAGE_KEY, key);
  } catch {
    // ignore write failures (e.g. private browsing quota)
  }
}

export function clearApiKey() {
  try {
    window.localStorage.removeItem(API_KEY_STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function loadRecentModels(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_MODELS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function pushRecentModel(modelId: string) {
  try {
    const current = loadRecentModels().filter((id) => id !== modelId);
    const next = [modelId, ...current].slice(0, 8);
    window.localStorage.setItem(RECENT_MODELS_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export type ThemePreference = "light" | "dark";

export function loadTheme(): ThemePreference | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(THEME_KEY);
    return raw === "light" || raw === "dark" ? raw : null;
  } catch {
    return null;
  }
}

export function saveTheme(theme: ThemePreference) {
  try {
    window.localStorage.setItem(THEME_KEY, theme);
  } catch {
    // ignore
  }
}
