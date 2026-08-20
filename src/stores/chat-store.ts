import { create } from "zustand";
import type { ChatMessage } from "@/lib/hf/chat";

/** Stable reference so selectors falling back to "no messages yet" don't retrigger on every read. */
export const EMPTY_MESSAGES: ChatMessage[] = [];

interface ChatState {
  messagesByModel: Record<string, ChatMessage[]>;
  streamingByModel: Record<string, boolean>;
  startExchange: (modelId: string, userMessage: ChatMessage, assistantId: string) => void;
  appendDelta: (modelId: string, assistantId: string, delta: string) => void;
  setAssistantError: (modelId: string, assistantId: string, error: string) => void;
  finishAssistant: (modelId: string, assistantId: string) => void;
  setStreaming: (modelId: string, streaming: boolean) => void;
}

function mapMessage(
  state: ChatState,
  modelId: string,
  assistantId: string,
  update: (m: ChatMessage) => ChatMessage
): Pick<ChatState, "messagesByModel"> {
  const list = state.messagesByModel[modelId] ?? [];
  return {
    messagesByModel: {
      ...state.messagesByModel,
      [modelId]: list.map((m) => (m.id === assistantId ? update(m) : m)),
    },
  };
}

export const useChatStore = create<ChatState>((set) => ({
  messagesByModel: {},
  streamingByModel: {},

  startExchange: (modelId, userMessage, assistantId) =>
    set((state) => {
      const existing = state.messagesByModel[modelId] ?? [];
      const assistantPlaceholder: ChatMessage = {
        id: assistantId,
        role: "assistant",
        text: "",
        pending: true,
      };
      return {
        messagesByModel: {
          ...state.messagesByModel,
          [modelId]: [...existing, userMessage, assistantPlaceholder],
        },
      };
    }),

  appendDelta: (modelId, assistantId, delta) =>
    set((state) =>
      mapMessage(state, modelId, assistantId, (m) => ({
        ...m,
        text: m.text + delta,
        pending: false,
      }))
    ),

  setAssistantError: (modelId, assistantId, error) =>
    set((state) =>
      mapMessage(state, modelId, assistantId, (m) => ({ ...m, pending: false, error }))
    ),

  finishAssistant: (modelId, assistantId) =>
    set((state) => mapMessage(state, modelId, assistantId, (m) => ({ ...m, pending: false }))),

  setStreaming: (modelId, streaming) =>
    set((state) => ({ streamingByModel: { ...state.streamingByModel, [modelId]: streaming } })),
}));
