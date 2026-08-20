import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useUsageStore } from "@/stores/usage-store";

interface ApiKeyState {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  signOut: () => void;
}

export const useApiKeyStore = create<ApiKeyState>()(
  persist(
    (set, get) => ({
      apiKey: null,
      setApiKey: (key) => set({ apiKey: key.trim() }),
      signOut: () => {
        useUsageStore.getState().resetUsage(get().apiKey);
        set({ apiKey: null });
      },
    }),
    { name: "hg:hf-token" }
  )
);
