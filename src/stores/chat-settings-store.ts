import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ChatSettings {
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

const DEFAULT_SETTINGS: ChatSettings = {
  systemPrompt: "",
  temperature: 0.7,
  maxTokens: 2048,
};

interface ChatSettingsState {
  byModel: Record<string, ChatSettings>;
  update: (modelId: string, settings: Partial<ChatSettings>) => void;
}

export const useChatSettingsStore = create<ChatSettingsState>()(
  persist(
    (set) => ({
      byModel: {},
      update: (modelId, settings) =>
        set((state) => ({
          byModel: {
            ...state.byModel,
            [modelId]: { ...DEFAULT_SETTINGS, ...state.byModel[modelId], ...settings },
          },
        })),
    }),
    { name: "hg:chat-settings" },
  ),
);

export function getChatSettings(settings?: Partial<ChatSettings>) {
  return { ...DEFAULT_SETTINGS, ...settings };
}
