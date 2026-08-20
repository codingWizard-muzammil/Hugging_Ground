"use client";

import { useMemo } from "react";
import { IconFile, IconX } from "@/components/icons";
import { isImageFile } from "@/lib/attachments";
import { formatBytes } from "@/lib/utils";

export function AttachmentChip({
  file,
  onRemove,
}: {
  file: File;
  onRemove?: () => void;
}) {
  const preview = useMemo(() => (isImageFile(file) ? URL.createObjectURL(file) : null), [file]);

  return (
    <div className="group relative flex items-center gap-2 rounded-lg border border-border bg-bg-inset py-1 pl-1 pr-2.5">
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt={file.name} className="h-8 w-8 rounded object-cover" />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded bg-bg text-fg-subtle">
          <IconFile width={15} height={15} />
        </div>
      )}
      <div className="max-w-[9rem] leading-tight">
        <p className="truncate text-xs font-medium">{file.name}</p>
        <p className="text-[10px] text-fg-subtle">{formatBytes(file.size)}</p>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="ml-1 text-fg-subtle hover:text-danger"
          aria-label={`Remove ${file.name}`}
        >
          <IconX width={13} height={13} />
        </button>
      )}
    </div>
  );
}
