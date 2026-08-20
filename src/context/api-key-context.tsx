"use client";

import { createContext, useContext, useMemo, useSyncExternalStore } from "react";
import { InferenceClient } from "@huggingface/inference";
import {
  clearStoredApiKey,
  getApiKeyServerSnapshot,
  getApiKeySnapshot,
  setStoredApiKey,
  subscribeApiKey,
} from "@/lib/api-key-store";

interface ApiKeyContextValue {
  apiKey: string | null;
  client: InferenceClient | null;
  setApiKey: (key: string) => void;
  signOut: (apiKey: string | null) => void;
}

const ApiKeyContext = createContext<ApiKeyContextValue | null>(null);

export function ApiKeyProvider({ children }: { children: React.ReactNode }) {
  const apiKey = useSyncExternalStore(subscribeApiKey, getApiKeySnapshot, getApiKeyServerSnapshot);

  const client = useMemo(() => (apiKey ? new InferenceClient(apiKey) : null), [apiKey]);

  const value = useMemo(
    () => ({
      apiKey,
      client,
      setApiKey: setStoredApiKey,
      signOut: (apiKey: any) => clearStoredApiKey(apiKey),
    }),
    [apiKey, client],
  );

  return <ApiKeyContext.Provider value={value}>{children}</ApiKeyContext.Provider>;
}

export function useApiKey() {
  const ctx = useContext(ApiKeyContext);
  if (!ctx) throw new Error("useApiKey must be used within ApiKeyProvider");
  return ctx;
}
