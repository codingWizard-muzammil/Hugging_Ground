"use client";

import { useState } from "react";
import { IconCheck, IconCopy, IconDownload } from "@/components/icons";
import type { TaskResult } from "@/lib/hf/types";
import { cn } from "@/lib/utils";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
      className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-fg-muted hover:text-fg"
    >
      {copied ? <IconCheck width={12} height={12} /> : <IconCopy width={12} height={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function DownloadLink({ url, filename }: { url: string; filename: string }) {
  return (
    <a
      href={url}
      download={filename}
      className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[11px] text-fg-muted hover:text-fg"
    >
      <IconDownload width={12} height={12} />
      Download
    </a>
  );
}

function LabelBars({ items }: { items: { label: string; score: number }[] }) {
  const sorted = [...items].sort((a, b) => b.score - a.score).slice(0, 20);
  const max = Math.max(...sorted.map((i) => i.score), 0.0001);
  return (
    <div className="flex flex-col gap-2.5">
      {sorted.map((item, i) => (
        <div key={i}>
          <div className="mb-1 flex items-baseline justify-between gap-2 text-xs">
            <span className="truncate font-medium">{item.label}</span>
            <span className="shrink-0 font-mono text-fg-muted">{(item.score * 100).toFixed(1)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-inset">
            <div
              className="bg-accent-solid h-full rounded-full"
              style={{ width: `${Math.max(2, (item.score / max) * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function EntityHighlights({
  items,
  sourceText,
}: {
  items: { label: string; word: string; score: number; start?: number; end?: number }[];
  sourceText: string;
}) {
  const withSpans = items.filter(
    (e): e is typeof e & { start: number; end: number } =>
      typeof e.start === "number" && typeof e.end === "number"
  );

  if (withSpans.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        {items.map((e, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-xs">
            <span className="font-medium">{e.word}</span>
            <span className="rounded-full bg-bg-inset px-2 py-0.5 text-[10px] text-fg-muted">{e.label}</span>
          </div>
        ))}
      </div>
    );
  }

  const sorted = [...withSpans].sort((a, b) => a.start - b.start);
  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  sorted.forEach((e, i) => {
    if (e.start > cursor) nodes.push(<span key={`t-${i}`}>{sourceText.slice(cursor, e.start)}</span>);
    nodes.push(
      <mark
        key={`m-${i}`}
        title={`${e.label} · ${(e.score * 100).toFixed(1)}%`}
        className="rounded bg-accent-solid/20 px-0.5 py-0.5 font-medium text-fg"
      >
        {sourceText.slice(e.start, e.end)}
        <sup className="ml-0.5 text-[9px] font-semibold uppercase text-accent-solid">{e.label}</sup>
      </mark>
    );
    cursor = Math.max(cursor, e.end);
  });
  if (cursor < sourceText.length) nodes.push(<span key="tail">{sourceText.slice(cursor)}</span>);

  return <p className="whitespace-pre-wrap text-sm leading-relaxed">{nodes}</p>;
}

function DetectionOverlay({
  items,
  imageUrl,
}: {
  items: { label: string; score: number; box: { xmin: number; ymin: number; xmax: number; ymax: number } }[];
  imageUrl: string;
}) {
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative inline-block max-w-full overflow-hidden rounded-xl border border-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt="detection subject"
          className="block max-w-full"
          onLoad={(e) => {
            const img = e.currentTarget;
            setNatural({ w: img.naturalWidth, h: img.naturalHeight });
          }}
        />
        {natural &&
          items.map((item, i) => {
            const left = (item.box.xmin / natural.w) * 100;
            const top = (item.box.ymin / natural.h) * 100;
            const width = ((item.box.xmax - item.box.xmin) / natural.w) * 100;
            const height = ((item.box.ymax - item.box.ymin) / natural.h) * 100;
            return (
              <div
                key={i}
                className="absolute border-2 border-accent-solid"
                style={{ left: `${left}%`, top: `${top}%`, width: `${width}%`, height: `${height}%` }}
              >
                <span className="absolute -top-5 left-0 whitespace-nowrap rounded bg-accent-solid px-1.5 py-0.5 text-[10px] font-medium text-white">
                  {item.label} {(item.score * 100).toFixed(0)}%
                </span>
              </div>
            );
          })}
      </div>
      <ul className="flex flex-wrap gap-1.5">
        {items.map((item, i) => (
          <li key={i} className="rounded-full bg-bg-inset px-2.5 py-1 text-[11px] text-fg-muted">
            {item.label} · {(item.score * 100).toFixed(0)}%
          </li>
        ))}
      </ul>
    </div>
  );
}

function MaskGallery({
  items,
  imageUrl,
}: {
  items: { label: string; score?: number; maskDataUrl: string }[];
  imageUrl: string;
}) {
  return (
    <div className="flex flex-col gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt="segmentation subject" className="max-h-72 rounded-xl border border-border object-contain" />
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {items.map((item, i) => (
          <div key={i} className="overflow-hidden rounded-lg border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.maskDataUrl} alt={item.label} className="aspect-square w-full bg-bg-inset object-cover" />
            <p className="truncate px-1.5 py-1 text-[10px] text-fg-muted">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function OutputPanel({ result }: { result: TaskResult }) {
  switch (result.kind) {
    case "text":
      return (
        <div className="flex flex-col gap-2">
          <div className="flex justify-end">
            <CopyButton text={result.text} />
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">{result.text}</p>
        </div>
      );

    case "answer":
      return (
        <div className="flex flex-col gap-2">
          <p className="text-base font-medium leading-relaxed">{result.answer}</p>
          {typeof result.score === "number" && (
            <p className="text-xs text-fg-muted">Confidence {(result.score * 100).toFixed(1)}%</p>
          )}
        </div>
      );

    case "image":
      return (
        <div className="flex flex-col gap-2">
          <div className="flex justify-end">
            <DownloadLink url={result.url} filename="result.png" />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result.url} alt="Generated result" className="max-h-[520px] w-full rounded-xl border border-border object-contain" />
        </div>
      );

    case "audio":
      return (
        <div className="flex flex-col gap-2">
          <audio src={result.url} controls className="w-full" />
          <div className="flex justify-end">
            <DownloadLink url={result.url} filename="result.wav" />
          </div>
        </div>
      );

    case "labels":
      return <LabelBars items={result.items} />;

    case "entities":
      return <EntityHighlights items={result.items} sourceText={result.sourceText} />;

    case "boxes":
      return <DetectionOverlay items={result.items} imageUrl={result.imageUrl} />;

    case "masks":
      return <MaskGallery items={result.items} imageUrl={result.imageUrl} />;

    case "json":
      return (
        <pre className={cn("hg-scrollbar overflow-x-auto rounded-lg bg-bg-inset p-3 text-xs")}>
          {JSON.stringify(result.data, null, 2)}
        </pre>
      );

    default:
      return null;
  }
}
