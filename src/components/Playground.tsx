"use client";

import { useState } from "react";
import { ChatView } from "@/components/chat/ChatView";
import { HelpModal } from "@/components/HelpModal";
import { ModelPicker } from "@/components/ModelPicker";
import { TaskView } from "@/components/task/TaskView";
import { IconAlertTriangle, IconHelpCircle, IconSparkles } from "@/components/icons";
import type { HubModelSummary } from "@/lib/hf/hub";
import { CHAT_PIPELINE_TAGS, pipelineTagLabel, taskForPipelineTag } from "@/lib/hf/tasks";
import { pushRecentModel } from "@/lib/storage";

export function Playground() {
  const [model, setModel] = useState<HubModelSummary | null>(null);

  function handleSelect(m: HubModelSummary) {
    setModel(m);
    pushRecentModel(m.id);
  }

  const isChat = model ? CHAT_PIPELINE_TAGS.has(model.pipelineTag ?? "") : false;
  const task = model && !isChat ? taskForPipelineTag(model.pipelineTag) : null;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3 sm:px-6">
        <ModelPicker value={model?.id ?? null} onSelect={handleSelect} />
        {model?.pipelineTag && (
          <span className="rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-fg-muted">
            {pipelineTagLabel(model.pipelineTag)}
          </span>
        )}
        {model?.gated && (
          <span className="flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
            <IconAlertTriangle width={12} height={12} />
            Gated model — requires access on Hugging Face
          </span>
        )}
      </div>

      {!model ? (
        <PickAModel />
      ) : isChat ? (
        <ChatView key={model.id} modelId={model.id} isVisionModel={model.pipelineTag === "image-text-to-text"} />
      ) : task ? (
        <TaskView key={model.id} modelId={model.id} task={task} />
      ) : (
        <UnsupportedTask model={model} />
      )}
    </div>
  );
}

const QUICK_STEPS = [
  "Search or paste any model id from the Hugging Face Hub",
  "We detect what it does automatically — chat, images, audio, and more",
  "Type, attach a file, and hit run — responses stream live",
];

function PickAModel() {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <div className="hg-gradient-ring flex h-12 w-12 items-center justify-center rounded-2xl text-white">
        <IconSparkles width={22} height={22} />
      </div>
      <div>
        <h2 className="text-base font-semibold">Pick a model to get started</h2>
        <p className="mt-1 max-w-sm text-sm text-fg-muted">
          Search any model on the Hugging Face Hub, or choose one of the featured
          models to try chat, image generation, speech, and more.
        </p>
      </div>

      <ol className="flex w-full max-w-sm flex-col gap-2.5 text-left">
        {QUICK_STEPS.map((step, i) => (
          <li key={step} className="flex items-start gap-2.5 text-xs text-fg-muted">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-bg-inset text-[10px] font-semibold text-fg-subtle">
              {i + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>

      <button
        onClick={() => setHelpOpen(true)}
        className="flex items-center gap-1.5 text-xs font-medium text-fg-muted hover:text-fg"
      >
        <IconHelpCircle width={14} height={14} />
        How Hugging Ground works
      </button>
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </div>
  );
}

function UnsupportedTask({ model }: { model: HubModelSummary }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <IconAlertTriangle width={28} height={28} className="text-fg-subtle" />
      <div>
        <h2 className="text-base font-semibold">
          {model.pipelineTag ? `"${pipelineTagLabel(model.pipelineTag)}" isn't wired up yet` : "Unknown task type"}
        </h2>
        <p className="mt-1 max-w-sm text-sm text-fg-muted">
          Hugging Ground doesn&apos;t have a playground UI for this model&apos;s
          task yet. Try picking a chat, image, audio, or text-classification
          model instead.
        </p>
      </div>
    </div>
  );
}
