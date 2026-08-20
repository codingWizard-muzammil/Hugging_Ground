import type { InferenceClient } from "@huggingface/inference";
import type { InputKind, TaskInput, TaskResult } from "./types";

export interface TaskDef {
  label: string;
  hint: string;
  inputKind: InputKind;
  outputKind: TaskResult["kind"];
  placeholder?: string;
  run: (client: InferenceClient, model: string, input: TaskInput) => Promise<TaskResult>;
}

function blobUrl(blob: Blob): string {
  return URL.createObjectURL(blob);
}

export const CHAT_PIPELINE_TAGS = new Set([
  "text-generation",
  "image-text-to-text",
  "conversational",
]);

export const TASKS: Record<string, TaskDef> = {
  "text-to-image": {
    label: "Text to image",
    hint: "Describe the image you want to generate.",
    inputKind: "prompt",
    outputKind: "image",
    placeholder: "A cinematic photo of a fox reading a book in a library, warm light",
    run: async (client, model, input) => {
      if (input.kind !== "prompt") throw new Error("bad input");
      const blob = await client.textToImage(
        { model, inputs: input.text },
        { outputType: "blob" }
      );
      return { kind: "image", url: blobUrl(blob) };
    },
  },
  "image-to-image": {
    label: "Image to image",
    hint: "Upload an image and describe how it should change.",
    inputKind: "image-prompt",
    outputKind: "image",
    run: async (client, model, input) => {
      if (input.kind !== "image-prompt") throw new Error("bad input");
      const blob = await client.imageToImage({
        model,
        inputs: input.image,
        parameters: { prompt: input.prompt },
      });
      return { kind: "image", url: blobUrl(blob) };
    },
  },
  "text-to-speech": {
    label: "Text to speech",
    hint: "Type the text you want spoken out loud.",
    inputKind: "prompt",
    outputKind: "audio",
    placeholder: "Hello there! This is Hugging Ground speaking.",
    run: async (client, model, input) => {
      if (input.kind !== "prompt") throw new Error("bad input");
      const blob = await client.textToSpeech({ model, inputs: input.text });
      return { kind: "audio", url: blobUrl(blob) };
    },
  },
  "automatic-speech-recognition": {
    label: "Speech to text",
    hint: "Upload or record an audio clip to transcribe.",
    inputKind: "audio",
    outputKind: "text",
    run: async (client, model, input) => {
      if (input.kind !== "audio") throw new Error("bad input");
      const out = await client.automaticSpeechRecognition({ model, inputs: input.audio });
      return { kind: "text", text: out.text };
    },
  },
  "audio-classification": {
    label: "Audio classification",
    hint: "Upload an audio clip to classify.",
    inputKind: "audio",
    outputKind: "labels",
    run: async (client, model, input) => {
      if (input.kind !== "audio") throw new Error("bad input");
      const out = await client.audioClassification({ model, inputs: input.audio });
      return { kind: "labels", items: out };
    },
  },
  "audio-to-audio": {
    label: "Audio to audio",
    hint: "Upload an audio clip to transform (e.g. source separation).",
    inputKind: "audio",
    outputKind: "audio",
    run: async (client, model, input) => {
      if (input.kind !== "audio") throw new Error("bad input");
      const out = await client.audioToAudio({ model, inputs: input.audio });
      const first = out[0];
      if (!first) throw new Error("No audio returned by the model.");
      const contentType = first["content-type"] || "audio/wav";
      return { kind: "audio", url: `data:${contentType};base64,${first.blob}` };
    },
  },
  "image-classification": {
    label: "Image classification",
    hint: "Upload an image to classify.",
    inputKind: "image",
    outputKind: "labels",
    run: async (client, model, input) => {
      if (input.kind !== "image") throw new Error("bad input");
      const out = await client.imageClassification({ model, inputs: input.image });
      return { kind: "labels", items: out };
    },
  },
  "object-detection": {
    label: "Object detection",
    hint: "Upload an image to detect objects in.",
    inputKind: "image",
    outputKind: "boxes",
    run: async (client, model, input) => {
      if (input.kind !== "image") throw new Error("bad input");
      const out = await client.objectDetection({ model, inputs: input.image });
      return { kind: "boxes", items: out, imageUrl: blobUrl(input.image) };
    },
  },
  "image-segmentation": {
    label: "Image segmentation",
    hint: "Upload an image to segment.",
    inputKind: "image",
    outputKind: "masks",
    run: async (client, model, input) => {
      if (input.kind !== "image") throw new Error("bad input");
      const out = await client.imageSegmentation({ model, inputs: input.image });
      return {
        kind: "masks",
        imageUrl: blobUrl(input.image),
        items: out.map((s) => ({
          label: s.label,
          score: s.score,
          maskDataUrl: s.mask.startsWith("data:") ? s.mask : `data:image/png;base64,${s.mask}`,
        })),
      };
    },
  },
  "image-to-text": {
    label: "Image captioning",
    hint: "Upload an image to caption.",
    inputKind: "image",
    outputKind: "text",
    run: async (client, model, input) => {
      if (input.kind !== "image") throw new Error("bad input");
      const out = await client.imageToText({ model, inputs: input.image });
      return { kind: "text", text: out.generated_text ?? "" };
    },
  },
  "zero-shot-image-classification": {
    label: "Zero-shot image classification",
    hint: "Upload an image and list candidate labels, comma separated.",
    inputKind: "image-labels",
    outputKind: "labels",
    run: async (client, model, input) => {
      if (input.kind !== "image-labels") throw new Error("bad input");
      const out = await client.zeroShotImageClassification({
        model,
        inputs: { image: input.image },
        parameters: { candidate_labels: input.labels },
      });
      return { kind: "labels", items: out };
    },
  },
  "visual-question-answering": {
    label: "Visual question answering",
    hint: "Upload an image and ask a question about it.",
    inputKind: "image-question",
    outputKind: "answer",
    run: async (client, model, input) => {
      if (input.kind !== "image-question") throw new Error("bad input");
      const out = await client.visualQuestionAnswering({
        model,
        inputs: { image: input.image, question: input.question },
      });
      return { kind: "answer", answer: out.answer ?? "", score: out.score };
    },
  },
  "document-question-answering": {
    label: "Document question answering",
    hint: "Upload a document image and ask a question about it.",
    inputKind: "image-question",
    outputKind: "answer",
    run: async (client, model, input) => {
      if (input.kind !== "image-question") throw new Error("bad input");
      const out = await client.documentQuestionAnswering({
        model,
        inputs: { image: input.image, question: input.question },
      });
      return { kind: "answer", answer: out.answer, score: out.score };
    },
  },
  summarization: {
    label: "Summarization",
    hint: "Paste the text you want summarized.",
    inputKind: "text",
    outputKind: "text",
    run: async (client, model, input) => {
      if (input.kind !== "text") throw new Error("bad input");
      const out = await client.summarization({ model, inputs: input.text });
      return { kind: "text", text: out.summary_text };
    },
  },
  translation: {
    label: "Translation",
    hint: "Paste the text you want translated.",
    inputKind: "text",
    outputKind: "text",
    run: async (client, model, input) => {
      if (input.kind !== "text") throw new Error("bad input");
      const out = await client.translation({ model, inputs: input.text });
      const result = Array.isArray(out) ? out[0] : out;
      return { kind: "text", text: result.translation_text };
    },
  },
  "text-classification": {
    label: "Text classification",
    hint: "Paste text to classify (e.g. sentiment).",
    inputKind: "text",
    outputKind: "labels",
    run: async (client, model, input) => {
      if (input.kind !== "text") throw new Error("bad input");
      const out = await client.textClassification({ model, inputs: input.text });
      return { kind: "labels", items: out };
    },
  },
  "token-classification": {
    label: "Named entity recognition",
    hint: "Paste text to extract entities from.",
    inputKind: "text",
    outputKind: "entities",
    run: async (client, model, input) => {
      if (input.kind !== "text") throw new Error("bad input");
      const out = await client.tokenClassification({ model, inputs: input.text });
      return {
        kind: "entities",
        sourceText: input.text,
        items: out.map((e) => ({
          label: e.entity_group ?? e.entity ?? "entity",
          word: e.word,
          score: e.score,
          start: e.start,
          end: e.end,
        })),
      };
    },
  },
  "zero-shot-classification": {
    label: "Zero-shot classification",
    hint: "Paste text and list candidate labels, comma separated.",
    inputKind: "text-labels",
    outputKind: "labels",
    run: async (client, model, input) => {
      if (input.kind !== "text-labels") throw new Error("bad input");
      const out = await client.zeroShotClassification({
        model,
        inputs: input.text,
        parameters: { candidate_labels: input.labels },
      });
      const items = Array.isArray(out) ? out : [out];
      return { kind: "labels", items: items.flat() };
    },
  },
  "fill-mask": {
    label: "Fill mask",
    hint: "Paste text containing a [MASK] token.",
    inputKind: "text",
    outputKind: "labels",
    placeholder: "The capital of France is [MASK].",
    run: async (client, model, input) => {
      if (input.kind !== "text") throw new Error("bad input");
      const out = await client.fillMask({ model, inputs: input.text });
      return { kind: "labels", items: out.map((o) => ({ label: o.sequence, score: o.score })) };
    },
  },
  "question-answering": {
    label: "Question answering",
    hint: "Provide a context passage and a question about it.",
    inputKind: "text-context",
    outputKind: "answer",
    run: async (client, model, input) => {
      if (input.kind !== "text-context") throw new Error("bad input");
      const out = await client.questionAnswering({
        model,
        inputs: { question: input.question, context: input.context },
      });
      return { kind: "answer", answer: out.answer, score: out.score };
    },
  },
  "sentence-similarity": {
    label: "Sentence similarity",
    hint: "Paste a sentence, then candidate sentences separated by new lines.",
    inputKind: "text-labels",
    outputKind: "labels",
    run: async (client, model, input) => {
      if (input.kind !== "text-labels") throw new Error("bad input");
      const out = await client.sentenceSimilarity({
        model,
        inputs: { source_sentence: input.text, sentences: input.labels },
      });
      return {
        kind: "labels",
        items: input.labels.map((label, i) => ({ label, score: out[i] ?? 0 })),
      };
    },
  },
  "feature-extraction": {
    label: "Feature extraction",
    hint: "Paste text to embed into a vector.",
    inputKind: "text",
    outputKind: "json",
    run: async (client, model, input) => {
      if (input.kind !== "text") throw new Error("bad input");
      const out = await client.featureExtraction({ model, inputs: input.text });
      return { kind: "json", data: out };
    },
  },
};

export function taskForPipelineTag(pipelineTag: string | null): TaskDef | null {
  if (!pipelineTag) return null;
  return TASKS[pipelineTag] ?? null;
}

export function pipelineTagLabel(pipelineTag: string | null): string {
  if (!pipelineTag) return "Unknown task";
  if (CHAT_PIPELINE_TAGS.has(pipelineTag)) {
    return pipelineTag === "image-text-to-text" ? "Vision chat" : "Chat";
  }
  return TASKS[pipelineTag]?.label ?? pipelineTag.replace(/-/g, " ");
}
