"use client";

import { useEffect } from "react";
import { IconExternalLink, IconPaperclip, IconSparkles, IconWand, IconX } from "@/components/icons";
import { TASKS } from "@/lib/hf/tasks";

const TOKEN_URL = "https://huggingface.co/settings/tokens/new?ownUserPermissions=inference.serverless.write&tokenType=fineGrained";

const STEPS = [
  {
    title: "Paste your Hugging Face key",
    body: "It's free to create. Your key is saved only in this browser's local storage and is sent directly to Hugging Face — never to any server of ours.",
  },
  {
    title: "Search or pick any model",
    body: "Type a name or paste an exact model id from the Hub. Hugging Ground reads the model's task automatically — no configuration needed.",
  },
  {
    title: "Chat, generate, or run it",
    body: "Conversational models open a chat with streaming replies. Every other task (images, audio, classification…) gets a matching input form.",
  },
  {
    title: "Attach almost anything",
    body: "Drop images, audio, or text files onto the composer or a task's dropzone. Vision models can see attached images right in the chat.",
  },
];

const TASK_GROUPS: { label: string; tasks: string[] }[] = [
  { label: "Chat", tasks: ["Chat", "Vision chat"] },
  {
    label: "Images",
    tasks: [TASKS["text-to-image"].label, TASKS["image-to-image"].label, TASKS["image-classification"].label, TASKS["object-detection"].label, TASKS["image-segmentation"].label, TASKS["image-to-text"].label],
  },
  {
    label: "Audio",
    tasks: [TASKS["automatic-speech-recognition"].label, TASKS["text-to-speech"].label, TASKS["audio-classification"].label],
  },
  {
    label: "Text",
    tasks: [TASKS.summarization.label, TASKS.translation.label, TASKS["question-answering"].label, TASKS["zero-shot-classification"].label, TASKS["token-classification"].label],
  },
];

export function HelpModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm hg-animate-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="hg-scrollbar max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-bg-elevated shadow-xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-bg-elevated px-5 py-4">
          <div className="flex items-center gap-2">
            <IconWand width={17} height={17} className="text-accent-solid" />
            <h2 className="text-sm font-semibold">How Hugging Ground works</h2>
          </div>
          <button
            onClick={onClose}
            className="text-fg-subtle hover:text-fg"
            aria-label="Close"
          >
            <IconX width={17} height={17} />
          </button>
        </div>

        <div className="flex flex-col gap-6 px-5 py-5">
          <ol className="flex flex-col gap-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="flex gap-3">
                <span className="hg-gradient-ring flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-fg-muted">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-fg-subtle">
              <IconSparkles width={13} height={13} />
              What you can play with
            </p>
            <div className="flex flex-col gap-2.5">
              {TASK_GROUPS.map((group) => (
                <div key={group.label} className="flex flex-wrap items-center gap-1.5">
                  <span className="text-xs font-medium text-fg-muted">{group.label}:</span>
                  {group.tasks.map((t) => (
                    <span key={t} className="rounded-full bg-bg-inset px-2 py-0.5 text-[11px] text-fg-muted">
                      {t}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-border bg-bg-inset px-3.5 py-3 text-xs leading-relaxed text-fg-muted">
            <IconPaperclip width={14} height={14} className="mt-0.5 shrink-0" />
            <p>
              Chat models accept image attachments (as vision input) and text
              files (inlined into your message). Other file types are kept
              with the message but noted as not sendable to chat — use a
              task-specific model instead for audio or documents.
            </p>
          </div>

          <a
            href={TOKEN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs font-medium text-fg-muted hover:border-border-strong hover:text-fg"
          >
            Get a free Hugging Face key
            <IconExternalLink width={13} height={13} />
          </a>
        </div>
      </div>
    </div>
  );
}
