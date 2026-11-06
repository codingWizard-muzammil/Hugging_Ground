export interface HubModelSummary {
  id: string;
  pipelineTag: string | null;
  likes: number;
  downloads: number;
  gated: boolean | string;
  tags: string[];
  library: string | null;
  providers: string[];
  available: boolean;
}

interface RawHubModel {
  id: string;
  pipeline_tag?: string;
  likes?: number;
  downloads?: number;
  gated?: boolean | string;
  tags?: string[];
  library_name?: string | null;
  inferenceProviderMapping?:
    | Record<string, { provider?: string; status?: string; task?: string }>
    | { provider?: string; status?: string; task?: string }[];
}

function normalize(raw: RawHubModel): HubModelSummary {
  const mappings = Array.isArray(raw.inferenceProviderMapping)
    ? raw.inferenceProviderMapping.map((mapping) => [mapping.provider ?? "", mapping] as const)
    : Object.entries(raw.inferenceProviderMapping ?? {});
  const liveMappings = mappings.filter(
    ([provider, mapping]) => Boolean(provider) && mapping.status === "live",
  );
  const providers = liveMappings.map(([provider]) => provider);
  return {
    id: raw.id,
    pipelineTag: raw.pipeline_tag ?? liveMappings[0]?.[1].task ?? null,
    likes: raw.likes ?? 0,
    downloads: raw.downloads ?? 0,
    gated: raw.gated ?? false,
    tags: raw.tags ?? [],
    library: raw.library_name ?? null,
    providers,
    available: providers.length > 0,
  };
}

export async function searchModels(
  query: string,
  opts: { limit?: number; signal?: AbortSignal } = {}
): Promise<HubModelSummary[]> {
  const params = new URLSearchParams({
    limit: String(opts.limit ?? 20),
    sort: "downloads",
    direction: "-1",
    inference_provider: "all",
  });
  params.append("expand[]", "inferenceProviderMapping");
  if (query.trim()) params.set("search", query.trim());

  const res = await fetch(`https://huggingface.co/api/models?${params}`, {
    signal: opts.signal,
  });
  if (!res.ok) throw new Error(`Model search failed (${res.status})`);
  const data = (await res.json()) as RawHubModel[];
  return data.map(normalize).filter((model) => model.available);
}

export async function getModelInfo(
  modelId: string,
  signal?: AbortSignal
): Promise<HubModelSummary> {
  const res = await fetch(
    `https://huggingface.co/api/models/${modelId}?expand[]=inferenceProviderMapping`,
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
  const model = normalize(data);
  if (!model.available) {
    throw new Error(`"${modelId}" has no live Hugging Face Inference Provider right now.`);
  }
  return model;
}
