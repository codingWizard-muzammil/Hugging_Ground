const USAGE_KEY = "hg:usage-count";

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeUsage(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getUsageSnapshot(apiKey: string | null): number {
  if (typeof window === "undefined" || !apiKey) return 0;
  try {
    return (
      Number(window.localStorage.getItem(`${USAGE_KEY}:${apiKey}`) ?? "0") || 0
    );
  } catch {
    return 0;
  }
}

export function getUsageServerSnapshot(): number {
  return 0;
}

export function recordRequest(apiKey: string | null) {
  try {
    window.localStorage.setItem(
      `${USAGE_KEY}:${apiKey}`,
      String(getUsageSnapshot(apiKey) + 1),
    );
  } catch {
    // ignore write failures (e.g. private browsing quota)
  }
  listeners.forEach((listener) => listener());
}

export function resetUsage(apiKey: string | null) {
  try {
    window.localStorage.removeItem(`${USAGE_KEY}:${apiKey}`);
  } catch {
    // ignore
  }
  listeners.forEach((listener) => listener());
}
