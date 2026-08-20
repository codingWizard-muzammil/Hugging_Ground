"use client";

import { useRef, useState } from "react";
import { AttachmentChip } from "@/components/chat/AttachmentChip";
import { IconPaperclip, IconSend } from "@/components/icons";
import { newAttachmentId, type UiAttachment } from "@/lib/attachments";
import { cn } from "@/lib/utils";

export function Composer({
  disabled,
  streaming,
  onSend,
  onStop,
}: {
  disabled: boolean;
  streaming: boolean;
  onSend: (text: string, attachments: UiAttachment[]) => void;
  onStop: () => void;
}) {
  const [text, setText] = useState("");
  const [attachments, setAttachments] = useState<UiAttachment[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function addFiles(files: FileList | File[]) {
    const next = Array.from(files).map((file) => ({ id: newAttachmentId(), file }));
    setAttachments((prev) => [...prev, ...next]);
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  function autoGrow() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 200)}px`;
  }

  function submit() {
    if (disabled || streaming) return;
    if (!text.trim() && attachments.length === 0) return;
    onSend(text, attachments);
    setText("");
    setAttachments([]);
    requestAnimationFrame(autoGrow);
  }

  return (
    <div
      className={cn(
        "rounded-2xl border bg-bg-elevated p-2.5 shadow-sm transition-colors",
        dragOver ? "border-ring ring-2 ring-ring/30" : "border-border"
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
      }}
      onPaste={(e) => {
        const files = Array.from(e.clipboardData.files);
        if (files.length) addFiles(files);
      }}
    >
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2 px-1">
          {attachments.map((a) => (
            <AttachmentChip key={a.id} file={a.file} onRemove={() => removeAttachment(a.id)} />
          ))}
        </div>
      )}

      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          title="Attach any file"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-fg-muted transition-colors hover:bg-bg-inset hover:text-fg disabled:opacity-40"
        >
          <IconPaperclip />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) addFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            autoGrow();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          disabled={disabled}
          rows={1}
          placeholder={disabled ? "Select a model to start chatting…" : "Message the model… (Shift+Enter for a new line)"}
          className="hg-scrollbar max-h-[200px] flex-1 resize-none bg-transparent py-1.5 text-sm outline-none placeholder:text-fg-subtle disabled:opacity-50"
        />

        {streaming ? (
          <button
            onClick={onStop}
            className="flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-bg-inset px-3 text-xs font-medium text-fg hover:bg-border"
          >
            <span className="h-2 w-2 rounded-sm bg-fg" />
            Stop
          </button>
        ) : (
          <button
            onClick={submit}
            disabled={disabled || (!text.trim() && attachments.length === 0)}
            className={cn(
              "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white transition-opacity",
              disabled || (!text.trim() && attachments.length === 0)
                ? "cursor-not-allowed bg-bg-inset text-fg-subtle"
                : "hg-gradient-ring hover:opacity-90"
            )}
            aria-label="Send message"
          >
            <IconSend width={16} height={16} />
          </button>
        )}
      </div>
    </div>
  );
}
