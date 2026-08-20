"use client";

import { useMemo, useRef, useState } from "react";
import { IconAudio, IconImage, IconX } from "@/components/icons";
import { cn, formatBytes } from "@/lib/utils";

export function FileDropzone({
  kind,
  file,
  onChange,
}: {
  kind: "image" | "audio";
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  if (file && preview) {
    return (
      <div className="rounded-xl border border-border bg-bg-inset p-3">
        <div className="flex items-center gap-3">
          {kind === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt={file.name} className="h-16 w-16 rounded-lg object-cover" />
          ) : (
            <audio src={preview} controls className="h-10 max-w-55" />
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{file.name}</p>
            <p className="text-[11px] text-fg-subtle">{formatBytes(file.size)}</p>
          </div>
          <button
            onClick={() => onChange(null)}
            className="text-fg-subtle hover:text-danger"
            aria-label="Remove file"
          >
            <IconX width={15} height={15} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) onChange(f);
      }}
      className={cn(
        "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-8 text-center transition-colors",
        dragOver ? "border-ring bg-ring/5" : "border-border hover:border-border-strong"
      )}
    >
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-inset text-fg-muted">
        {kind === "image" ? <IconImage width={17} height={17} /> : <IconAudio width={17} height={17} />}
      </div>
      <p className="text-xs text-fg-muted">
        Drop a{kind === "audio" ? "n" : ""} {kind} file here, or click to browse
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={kind === "image" ? "image/*" : "audio/*"}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onChange(f);
          e.target.value = "";
        }}
      />
    </button>
  );
}
