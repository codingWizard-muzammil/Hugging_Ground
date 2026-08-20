import { clearApiKey, loadApiKey, saveApiKey } from "@/lib/storage";
import { resetUsage } from "@/lib/usage-store";

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeApiKey(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getApiKeySnapshot(): string | null {
  return loadApiKey();
}

export function getApiKeyServerSnapshot(): string | null {
  return null;
}

export function setStoredApiKey(key: string) {
  saveApiKey(key.trim());
  listeners.forEach((listener) => listener());
}

export function clearStoredApiKey(apiKey: any) {
  clearApiKey();
  resetUsage(apiKey);
  listeners.forEach((listener) => listener());
}
