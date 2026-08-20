"use client";

import { useState } from "react";
import { ChatView } from "@/components/chat/ChatView";
import { ModelPicker } from "@/components/ModelPicker";
import { TaskView } from "@/components/task/TaskView";
import { IconAlertTriangle, IconSparkles } from "@/components/icons";
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

function PickAModel() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
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
