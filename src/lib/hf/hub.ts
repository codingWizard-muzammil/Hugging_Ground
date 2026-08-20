export interface HubModelSummary {
  id: string;
  pipelineTag: string | null;
  likes: number;
  downloads: number;
  gated: boolean | string;
  tags: string[];
  library: string | null;
}

interface RawHubModel {
  id: string;
  pipeline_tag?: string;
  likes?: number;
  downloads?: number;
  gated?: boolean | string;
  tags?: string[];
  library_name?: string | null;
}

function normalize(raw: RawHubModel): HubModelSummary {
  return {
    id: raw.id,
    pipelineTag: raw.pipeline_tag ?? null,
    likes: raw.likes ?? 0,
    downloads: raw.downloads ?? 0,
    gated: raw.gated ?? false,
    tags: raw.tags ?? [],
    library: raw.library_name ?? null,
  };
}

/** A curated starting point so the picker isn't empty before the user searches. */
export const FEATURED_MODELS: { id: string; category: string }[] = [
  { id: "meta-llama/Llama-3.1-8B-Instruct", category: "Chat" },
  { id: "deepseek-ai/DeepSeek-V3.1", category: "Chat" },
  { id: "Qwen/Qwen2.5-VL-7B-Instruct", category: "Vision chat" },
  { id: "black-forest-labs/FLUX.1-dev", category: "Image generation" },
  { id: "stabilityai/stable-diffusion-xl-base-1.0", category: "Image generation" },
  { id: "openai/whisper-large-v3", category: "Speech to text" },
  { id: "facebook/detr-resnet-50", category: "Object detection" },
  { id: "google/vit-base-patch16-224", category: "Image classification" },
  { id: "facebook/bart-large-cnn", category: "Summarization" },
  { id: "distilbert-base-uncased-finetuned-sst-2-english", category: "Text classification" },
  { id: "sentence-transformers/all-MiniLM-L6-v2", category: "Embeddings" },
  { id: "facebook/bart-large-mnli", category: "Zero-shot classification" },
];

export async function searchModels(
  query: string,
  opts: { limit?: number; signal?: AbortSignal } = {}
): Promise<HubModelSummary[]> {
  const params = new URLSearchParams({
    limit: String(opts.limit ?? 20),
    sort: "downloads",
    direction: "-1",
  });
  if (query.trim()) params.set("search", query.trim());

  const res = await fetch(`https://huggingface.co/api/models?${params}`, {
    signal: opts.signal,
  });
  if (!res.ok) throw new Error(`Model search failed (${res.status})`);
  const data = (await res.json()) as RawHubModel[];
  return data.map(normalize);
}

export async function getModelInfo(
  modelId: string,
  signal?: AbortSignal
): Promise<HubModelSummary> {
  const res = await fetch(
    `https://huggingface.co/api/models/${modelId}`,
    { signal }
  );
  if (!res.ok) {
    throw new Error(
      res.status === 404
        ? `Model "${modelId}" was not found on Hugging Face.`
        : `Couldn't load model info (${res.status}).`
    );
  }
  const data = (await res.json()) as RawHubModel;
  return normalize(data);
}
