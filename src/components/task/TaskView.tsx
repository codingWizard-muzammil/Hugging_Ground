"use client";

import { useState } from "react";
import { FileDropzone } from "@/components/task/FileDropzone";
import { OutputPanel } from "@/components/task/OutputPanel";
import { IconAlertTriangle, IconLoader, IconSparkles } from "@/components/icons";
import { useApiKey } from "@/context/api-key-context";
import type { TaskDef } from "@/lib/hf/tasks";
import type { TaskInput, TaskResult } from "@/lib/hf/types";
import { recordRequest } from "@/lib/usage-store";
import { cn } from "@/lib/utils";

function splitLabels(raw: string): string[] {
  return raw
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function TaskView({ modelId, task }: { modelId: string; task: TaskDef }) {
  const { client,apiKey } = useApiKey();
  const [text, setText] = useState("");
  const [text2, setText2] = useState("");
  const [labelsText, setLabelsText] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [audio, setAudio] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TaskResult | null>(null);

  function buildInput(): TaskInput | null {
    switch (task.inputKind) {
      case "prompt":
      case "text":
        return text.trim() ? { kind: task.inputKind, text } : null;
      case "text-labels": {
        const labels = splitLabels(labelsText);
        return text.trim() && labels.length ? { kind: "text-labels", text, labels } : null;
      }
      case "text-context":
        return text2.trim() && text.trim() ? { kind: "text-context", question: text, context: text2 } : null;
      case "image":
        return image ? { kind: "image", image } : null;
      case "image-labels": {
        const labels = splitLabels(labelsText);
        return image && labels.length ? { kind: "image-labels", image, labels } : null;
      }
      case "image-question":
        return image && text.trim() ? { kind: "image-question", image, question: text } : null;
      case "image-prompt":
        return image && text.trim() ? { kind: "image-prompt", image, prompt: text } : null;
      case "audio":
        return audio ? { kind: "audio", audio } : null;
      default:
        return null;
    }
  }

  const input = buildInput();

  async function run() {
    if (!client || !input) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      recordRequest(apiKey);
      const out = await task.run(client, modelId, input);
      setResult(out);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  const needsImage = ["image", "image-labels", "image-question", "image-prompt"].includes(task.inputKind);
  const needsAudio = task.inputKind === "audio";
  const needsLabels = ["text-labels", "image-labels"].includes(task.inputKind);
  const needsPrimaryText =
    task.inputKind === "prompt" ||
    task.inputKind === "text" ||
    task.inputKind === "image-question" ||
    task.inputKind === "image-prompt" ||
    task.inputKind === "text-context" ||
    task.inputKind === "text-labels";

  return (
    <div className="hg-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-6">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
        <div>
          <span className="hg-gradient-text text-xs font-semibold uppercase tracking-wide">{task.label}</span>
          <p className="mt-1 text-sm text-fg-muted">{task.hint}</p>
        </div>

        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-bg-elevated p-4">
          {needsImage && <FileDropzone kind="image" file={image} onChange={setImage} />}
          {needsAudio && <FileDropzone kind="audio" file={audio} onChange={setAudio} />}

          {task.inputKind === "text-context" && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-fg-muted">Context</label>
              <textarea
                value={text2}
                onChange={(e) => setText2(e.target.value)}
                rows={4}
                placeholder="Paste the passage that contains the answer…"
                className="hg-scrollbar w-full resize-y rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none placeholder:text-fg-subtle focus:border-ring"
              />
            </div>
          )}

          {needsPrimaryText && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-fg-muted">
                {task.inputKind === "text-context"
                  ? "Question"
                  : task.inputKind === "image-question"
                    ? "Question"
                    : task.inputKind === "image-prompt"
                      ? "Prompt"
                      : task.inputKind === "text-labels"
                        ? "Text"
                        : "Input"}
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={task.inputKind === "prompt" || task.inputKind === "text" ? 4 : 2}
                placeholder={task.placeholder ?? "Type here…"}
                className="hg-scrollbar w-full resize-y rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none placeholder:text-fg-subtle focus:border-ring"
              />
            </div>
          )}

          {needsLabels && (
            <div>
              <label className="mb-1.5 block text-xs font-medium text-fg-muted">Candidate labels</label>
              <input
                value={labelsText}
                onChange={(e) => setLabelsText(e.target.value)}
                placeholder="positive, negative, neutral"
                className="w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none placeholder:text-fg-subtle focus:border-ring"
              />
            </div>
          )}

          <button
            onClick={run}
            disabled={!input || loading || !client}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium text-white transition-opacity",
              !input || loading || !client
                ? "cursor-not-allowed bg-bg-inset text-fg-subtle"
                : "hg-gradient-ring hover:opacity-90"
            )}
          >
            {loading ? (
              <>
                <IconLoader width={15} height={15} />
                Running…
              </>
            ) : (
              <>
                <IconSparkles width={15} height={15} />
                Run
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
            <IconAlertTriangle width={16} height={16} />
            {error}
          </div>
        )}

        {result && (
          <div className="rounded-2xl border border-border bg-bg-elevated p-4 hg-animate-in">
            <OutputPanel result={result} />
          </div>
        )}
      </div>
    </div>
  );
}
