import { create } from "zustand";
import type { HubModelSummary } from "@/lib/hf/hub";

interface SelectedModelState {
  model: HubModelSummary | null;
  setModel: (model: HubModelSummary) => void;
}

export const useSelectedModelStore = create<SelectedModelState>((set) => ({
  model: null,
  setModel: (model) => set({ model }),
}));
