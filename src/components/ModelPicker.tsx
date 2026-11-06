"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  getModelInfo,
  searchModels,
  type HubModelSummary,
} from "@/lib/hf/hub";
import { pipelineTagLabel } from "@/lib/hf/tasks";
import { cn, formatCompactNumber } from "@/lib/utils";
import { IconChevronDown, IconLoader, IconSearch } from "@/components/icons";

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function ModelPicker({
  value,
  onSelect,
}: {
  value: string | null;
  onSelect: (model: HubModelSummary) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebouncedValue(query, 280);

  const {
    data: results = [],
    isLoading: loading,
    error: searchError,
  } = useQuery({
    queryKey: ["hf-model-search", debouncedQuery],
    queryFn: ({ signal }) => searchModels(debouncedQuery, { limit: 25, signal }),
    enabled: open,
  });

  const pickByIdMutation = useMutation({
    mutationFn: (id: string) => getModelInfo(id.trim()),
    onSuccess: (info) => pick(info),
  });

  const error = searchError
    ? searchError instanceof Error
      ? searchError.message
      : "Search failed"
    : pickByIdMutation.error
      ? pickByIdMutation.error instanceof Error
        ? pickByIdMutation.error.message
        : "Couldn't load that model"
      : null;

  function toggleOpen() {
    setOpen((v) => !v);
  }

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

  function pick(model: HubModelSummary) {
    onSelect(model);
    setOpen(false);
    setQuery("");
  }

  function pickById(id: string) {
    pickByIdMutation.mutate(id);
  }

  const showFeatured = query.trim().length === 0;
  const exactMatch = results.some((r) => r.id.toLowerCase() === query.trim().toLowerCase());

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={toggleOpen}
        className="flex h-10 w-full min-w-0 items-center gap-2 rounded-lg border border-border bg-bg-elevated px-3 text-sm hover:border-border-strong sm:w-auto sm:min-w-70"
      >
        <span className="bg-accent-solid h-2 w-2 shrink-0 rounded-full" />
        <span className="min-w-0 flex-1 truncate text-left font-medium">
          {value ?? "Select an available model…"}
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
              placeholder="Search available models or paste a model id…"
              className="w-full rounded-lg bg-transparent py-2 pl-7 pr-2 text-sm outline-none placeholder:text-fg-subtle"
            />
          </div>

          <div className="hg-scrollbar max-h-80 overflow-y-auto p-1.5">
            {loading && (
              <div className="flex items-center gap-2 px-3 py-3 text-xs text-fg-subtle">
                <IconLoader width={14} height={14} />
                Finding available models…
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

            {!loading && !error && showFeatured && (
              <ModelGroup label="Available now">
                {results.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => pick(model)}
                    className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-bg-inset"
                  >
                    <span className="min-w-0 truncate font-mono text-xs">{model.id}</span>
                    <span className="shrink-0 rounded-full bg-bg-inset px-2 py-0.5 text-[10px] text-fg-muted">
                      {model.pipelineTag ? pipelineTagLabel(model.pipelineTag) : "Model"}
                    </span>
                  </button>
                ))}
                {results.length === 0 && (
                  <p className="px-3 py-4 text-center text-xs text-fg-subtle">No available models found.</p>
                )}
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
