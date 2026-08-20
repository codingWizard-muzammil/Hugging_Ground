import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UsageState {
  counts: Record<string, number>;
  recordRequest: (apiKey: string | null) => void;
  resetUsage: (apiKey: string | null) => void;
}

export const useUsageStore = create<UsageState>()(
  persist(
    (set) => ({
      counts: {},
      recordRequest: (apiKey) =>
        set((state) => {
          if (!apiKey) return state;
          return { counts: { ...state.counts, [apiKey]: (state.counts[apiKey] ?? 0) + 1 } };
        }),
      resetUsage: (apiKey) =>
        set((state) => {
          if (!apiKey || !(apiKey in state.counts)) return state;
          const next = { ...state.counts };
          delete next[apiKey];
          return { counts: next };
        }),
    }),
    { name: "hg:usage-count" }
  )
);

export function useUsageCount(apiKey: string | null): number {
  return useUsageStore((state) => (apiKey ? (state.counts[apiKey] ?? 0) : 0));
}
