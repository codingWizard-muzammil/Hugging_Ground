"use client";

import { useEffect, useRef, useState } from "react";
import {
  FEATURED_MODELS,
  searchModels,
  type HubModelSummary,
} from "@/lib/hf/hub";
import { pipelineTagLabel } from "@/lib/hf/tasks";
import { loadRecentModels } from "@/lib/storage";
import { cn, formatCompactNumber } from "@/lib/utils";
import { IconChevronDown, IconLoader, IconSearch } from "@/components/icons";

export function ModelPicker({
  value,
  onSelect,
}: {
  value: string | null;
  onSelect: (model: HubModelSummary) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<HubModelSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setRecent(loadRecentModels());
  }, [open]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 0);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    const timer = setTimeout(async () => {
      try {
        const data = await searchModels(query, { limit: 25, signal: controller.signal });
        setResults(data);
      } catch (err) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          setError(err instanceof Error ? err.message : "Search failed");
        }
      } finally {
        setLoading(false);
      }
    }, 280);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, open]);

  function pick(model: HubModelSummary) {
    onSelect(model);
    setOpen(false);
    setQuery("");
  }

  async function pickById(id: string) {
    try {
      const { getModelInfo } = await import("@/lib/hf/hub");
      const info = await getModelInfo(id.trim());
      pick(info);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't load that model");
    }
  }

  const showFeatured = query.trim().length === 0;
  const exactMatch = results.some((r) => r.id.toLowerCase() === query.trim().toLowerCase());

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-10 w-full min-w-0 items-center gap-2 rounded-lg border border-border bg-bg-elevated px-3 text-sm hover:border-border-strong sm:w-auto sm:min-w-[280px]"
      >
        <span className="hg-gradient-ring h-2 w-2 shrink-0 rounded-full" />
        <span className="min-w-0 flex-1 truncate text-left font-medium">
          {value ?? "Select a model…"}
        </span>
        <IconChevronDown width={15} height={15} className="shrink-0 text-fg-subtle" />
      </button>

      {open && (
        <div className="absolute left-0 z-30 mt-2 w-[min(92vw,26rem)] rounded-xl border border-border bg-bg-elevated shadow-lg hg-animate-in">
          <div className="relative border-b border-border p-2">
            <IconSearch width={15} height={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-fg-subtle" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && query.trim() && !exactMatch) pickById(query);
              }}
              placeholder="Search any model on the Hub, or paste an id…"
              className="w-full rounded-lg bg-transparent py-2 pl-7 pr-2 text-sm outline-none placeholder:text-fg-subtle"
            />
          </div>

          <div className="hg-scrollbar max-h-80 overflow-y-auto p-1.5">
            {loading && (
              <div className="flex items-center gap-2 px-3 py-3 text-xs text-fg-subtle">
                <IconLoader width={14} height={14} />
                Searching the Hub…
              </div>
            )}

            {!loading && error && (
              <div className="px-3 py-3 text-xs text-danger">{error}</div>
            )}

            {!loading && !error && query.trim() && !exactMatch && (
              <button
                onClick={() => pickById(query)}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-bg-inset"
              >
                <span className="text-fg-muted">Use model id</span>
                <span className="truncate font-mono text-xs">{query.trim()}</span>
              </button>
            )}

            {!loading && !error && showFeatured && recent.length > 0 && (
              <ModelGroup label="Recent">
                {recent.map((id) => (
                  <button
                    key={id}
                    onClick={() => pickById(id)}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-bg-inset"
                  >
                    <span className="truncate font-mono text-xs">{id}</span>
                  </button>
                ))}
              </ModelGroup>
            )}

            {!loading && !error && showFeatured && (
              <ModelGroup label="Featured">
                {FEATURED_MODELS.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => pickById(m.id)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-bg-inset"
                  >
                    <span className="truncate font-mono text-xs">{m.id}</span>
                    <span className="shrink-0 rounded-full bg-bg-inset px-2 py-0.5 text-[10px] text-fg-muted">
                      {m.category}
                    </span>
                  </button>
                ))}
              </ModelGroup>
            )}

            {!loading && !error && !showFeatured && (
              <ModelGroup label={`${results.length} result${results.length === 1 ? "" : "s"}`}>
                {results.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => pick(model)}
                    className={cn(
                      "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-bg-inset",
                      model.id === value && "bg-bg-inset"
                    )}
                  >
                    <span className="min-w-0 truncate font-mono text-xs">{model.id}</span>
                    <span className="flex shrink-0 items-center gap-2 text-[10px] text-fg-subtle">
                      {model.pipelineTag && (
                        <span className="rounded-full bg-bg-inset px-2 py-0.5 text-fg-muted">
                          {pipelineTagLabel(model.pipelineTag)}
                        </span>
                      )}
                      {model.likes > 0 && <span>♥ {formatCompactNumber(model.likes)}</span>}
                    </span>
                  </button>
                ))}
                {results.length === 0 && (
                  <p className="px-3 py-4 text-center text-xs text-fg-subtle">No models found.</p>
                )}
              </ModelGroup>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ModelGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-1">
      <p className="px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-fg-subtle">
        {label}
      </p>
      {children}
    </div>
  );
}
