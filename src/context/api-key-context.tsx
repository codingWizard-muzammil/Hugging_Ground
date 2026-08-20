"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { InferenceClient } from "@huggingface/inference";
import { clearApiKey, loadApiKey, saveApiKey } from "@/lib/storage";

interface ApiKeyContextValue {
  apiKey: string | null;
  hydrated: boolean;
  client: InferenceClient | null;
  setApiKey: (key: string) => void;
  signOut: () => void;
}

const ApiKeyContext = createContext<ApiKeyContextValue | null>(null);

export function ApiKeyProvider({ children }: { children: React.ReactNode }) {
  const [apiKey, setApiKeyState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setApiKeyState(loadApiKey());
    setHydrated(true);
  }, []);

  const setApiKey = useCallback((key: string) => {
    const trimmed = key.trim();
    saveApiKey(trimmed);
    setApiKeyState(trimmed);
  }, []);

  const signOut = useCallback(() => {
    clearApiKey();
    setApiKeyState(null);
  }, []);

  const client = useMemo(
    () => (apiKey ? new InferenceClient(apiKey) : null),
    [apiKey]
  );

  const value = useMemo(
    () => ({ apiKey, hydrated, client, setApiKey, signOut }),
    [apiKey, hydrated, client, setApiKey, signOut]
  );

  return <ApiKeyContext.Provider value={value}>{children}</ApiKeyContext.Provider>;
}

export function useApiKey() {
  const ctx = useContext(ApiKeyContext);
  if (!ctx) throw new Error("useApiKey must be used within ApiKeyProvider");
  return ctx;
}
