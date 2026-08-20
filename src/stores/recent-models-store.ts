import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RecentModelsState {
  recentModels: string[];
  pushRecentModel: (modelId: string) => void;
}

export const useRecentModelsStore = create<RecentModelsState>()(
  persist(
    (set, get) => ({
      recentModels: [],
      pushRecentModel: (modelId) => {
        const current = get().recentModels.filter((id) => id !== modelId);
        set({ recentModels: [modelId, ...current].slice(0, 8) });
      },
    }),
    { name: "hg:recent-models" }
  )
);
