"use client";

import { useEffect, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Composer } from "@/components/chat/Composer";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { IconPlus, IconSparkles } from "@/components/icons";
import { useInferenceClient } from "@/lib/hf/client";
import { fileToChatAttachment, type UiAttachment } from "@/lib/attachments";
import { streamChatCompletion, type ChatMessage } from "@/lib/hf/chat";
import { useApiKeyStore } from "@/stores/api-key-store";
import { EMPTY_MESSAGES, useChatStore } from "@/stores/chat-store";
import { useUsageStore } from "@/stores/usage-store";
import { getChatSettings, useChatSettingsStore } from "@/stores/chat-settings-store";
import { uid } from "@/lib/utils";

const SUGGESTIONS = [
  "Explain this concept like I'm five",
  "Write a short story about a robot who loves gardening",
  "Give me 5 creative names for a coffee shop",
  "Summarize the plot of a sci-fi movie in 3 sentences",
];

export function ChatView({
  modelId,
  isVisionModel,
}: {
  modelId: string;
  isVisionModel: boolean;
}) {
  const client = useInferenceClient();
  const apiKey = useApiKeyStore((state) => state.apiKey);
  const recordRequest = useUsageStore((state) => state.recordRequest);
  const messages = useChatStore((state) => state.messagesByModel[modelId] ?? EMPTY_MESSAGES);
  const streaming = useChatStore((state) => state.streamingByModel[modelId] ?? false);
  const startExchange = useChatStore((state) => state.startExchange);
  const appendDelta = useChatStore((state) => state.appendDelta);
  const setAssistantError = useChatStore((state) => state.setAssistantError);
  const finishAssistant = useChatStore((state) => state.finishAssistant);
  const setStreaming = useChatStore((state) => state.setStreaming);
  const clearChat = useChatStore((state) => state.clearChat);
  const savedSettings = useChatSettingsStore((state) => state.byModel[modelId]);
  const updateSettings = useChatSettingsStore((state) => state.update);
  const settings = getChatSettings(savedSettings);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const sendMutation = useMutation({
    mutationFn: async ({
      text,
      attachments,
    }: {
      text: string;
      attachments: UiAttachment[];
    }) => {
      if (!client) return;
      const chatAttachments = await Promise.all(
        attachments.map((a) => fileToChatAttachment(a.file)),
      );
      const userMsg: ChatMessage = {
        id: uid("msg"),
        role: "user",
        text,
        attachments: chatAttachments,
      };
      const assistantId = uid("msg");
      const history = [...messages, userMsg];
      startExchange(modelId, userMsg, assistantId);

      const controller = new AbortController();
      abortRef.current = controller;
      setStreaming(modelId, true);
      try {
        recordRequest(apiKey);
        for await (const delta of streamChatCompletion(client, modelId, history, {
          signal: controller.signal,
          systemPrompt: settings.systemPrompt,
          temperature: settings.temperature,
          maxTokens: settings.maxTokens,
        })) {
          appendDelta(modelId, assistantId, delta);
        }
      } catch (err) {
        const aborted = err instanceof DOMException && err.name === "AbortError";
        if (!aborted) {
          setAssistantError(
            modelId,
            assistantId,
            err instanceof Error ? err.message : "Something went wrong",
          );
        }
      } finally {
        finishAssistant(modelId, assistantId);
        setStreaming(modelId, false);
        abortRef.current = null;
      }
    },
  });

  function send(text: string, attachments: UiAttachment[]) {
    sendMutation.mutate({ text, attachments });
  }

  function newChat() {
    abortRef.current?.abort();
    clearChat(modelId);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between border-b border-border px-4 py-2 sm:px-6">
        <details className="group relative">
          <summary className="cursor-pointer list-none rounded-lg px-2.5 py-1.5 text-xs font-medium text-fg-muted hover:bg-bg-inset hover:text-fg">
            Customize chat
          </summary>
          <div className="absolute left-0 z-20 mt-2 grid w-[min(88vw,22rem)] gap-3 rounded-xl border border-border bg-bg-elevated p-4 shadow-lg">
            <label className="grid gap-1.5 text-xs font-medium text-fg-muted">
              System instructions
              <textarea
                value={settings.systemPrompt}
                onChange={(event) => updateSettings(modelId, { systemPrompt: event.target.value })}
                rows={3}
                placeholder="Tell the model how you want it to respond…"
                className="hg-scrollbar resize-y rounded-lg border border-border bg-bg px-3 py-2 text-sm font-normal text-fg outline-none placeholder:text-fg-subtle focus:border-ring"
              />
            </label>
            <label className="grid gap-1.5 text-xs font-medium text-fg-muted">
              Creativity <span className="font-mono text-fg">{settings.temperature.toFixed(1)}</span>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={settings.temperature}
                onChange={(event) => updateSettings(modelId, { temperature: Number(event.target.value) })}
                className="w-full accent-[var(--accent-solid)]"
              />
            </label>
            <label className="grid gap-1.5 text-xs font-medium text-fg-muted">
              Response length
              <select
                value={settings.maxTokens}
                onChange={(event) => updateSettings(modelId, { maxTokens: Number(event.target.value) })}
                className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus:border-ring"
              >
                <option value={512}>Short · 512 tokens</option>
                <option value={1024}>Balanced · 1,024 tokens</option>
                <option value={2048}>Long · 2,048 tokens</option>
                <option value={4096}>Very long · 4,096 tokens</option>
              </select>
            </label>
            <p className="text-[11px] leading-relaxed text-fg-subtle">Settings are saved for this model in this browser.</p>
          </div>
        </details>
        {messages.length > 0 && (
          <button
            onClick={newChat}
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-fg-muted transition-colors hover:bg-bg-inset hover:text-fg"
          >
            <IconPlus width={14} height={14} />
            New chat
          </button>
        )}
      </div>
      <div className="hg-scrollbar flex-1 overflow-y-auto px-4 py-6 sm:px-6">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
          {messages.length === 0 ? (
            <EmptyState
              modelId={modelId}
              isVisionModel={isVisionModel}
              onPick={(t) => send(t, [])}
            />
          ) : (
            messages.map((m) => <MessageBubble key={m.id} message={m} />)
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t border-border px-4 py-3 sm:px-6">
        <div className="mx-auto w-full max-w-3xl">
          <Composer
            disabled={!client}
            streaming={streaming}
            allowImages={isVisionModel}
            onSend={send}
            onStop={() => abortRef.current?.abort()}
          />
          <p className="mt-2 text-center text-[11px] text-fg-subtle">
            {isVisionModel
              ? "This model can see images — attach one and ask about it."
              : "Attach images to chat with vision models. Text files are inlined into your message."}
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  modelId,
  isVisionModel,
  onPick,
}: {
  modelId: string;
  isVisionModel: boolean;
  onPick: (text: string) => void;
}) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-16 text-center">
      <div className="bg-accent-solid flex h-12 w-12 items-center justify-center rounded-2xl text-white">
        <IconSparkles width={22} height={22} />
      </div>
      <div>
        <h2 className="text-base font-semibold">Start chatting with</h2>
        <p className="mt-1 font-mono text-sm text-fg-muted">{modelId}</p>
        {isVisionModel && (
          <p className="mt-1 text-xs text-fg-subtle">
            Supports image attachments
          </p>
        )}
      </div>
      <div className="grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="rounded-xl border border-border bg-bg-elevated px-3.5 py-2.5 text-left text-xs text-fg-muted transition-colors hover:border-border-strong hover:text-fg"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
