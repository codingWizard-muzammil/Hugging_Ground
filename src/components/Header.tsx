"use client";

import { useEffect, useRef, useState } from "react";
import { HelpModal } from "@/components/HelpModal";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { IconChevronDown, IconHelpCircle, IconKey, IconTrash } from "@/components/icons";
import { useApiKey } from "@/context/api-key-context";

function maskKey(key: string) {
  if (key.length <= 10) return "••••••••";
  return `${key.slice(0, 6)}••••${key.slice(-3)}`;
}

function KeyMenu() {
  const { apiKey, setApiKey, signOut } = useApiKey();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setEditing(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!apiKey) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs font-medium text-fg-muted transition-colors hover:bg-bg-inset hover:text-fg"
      >
        <IconKey width={14} height={14} />
        <span className="font-mono">{maskKey(apiKey)}</span>
        <IconChevronDown width={14} height={14} />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-border bg-bg-elevated p-3 shadow-lg hg-animate-in">
          {editing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (draft.trim()) {
                  setApiKey(draft);
                  setEditing(false);
                  setOpen(false);
                }
              }}
              className="flex flex-col gap-2"
            >
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="hf_..."
                className="w-full rounded-md border border-border bg-bg px-2.5 py-1.5 font-mono text-xs outline-none focus:border-ring"
              />
              <button
                type="submit"
                className="rounded-md hg-gradient-ring py-1.5 text-xs font-medium text-white hover:opacity-90"
              >
                Save key
              </button>
            </form>
          ) : (
            <div className="flex flex-col gap-1">
              <p className="px-1 pb-1 text-[11px] text-fg-subtle">
                Stored locally in this browser only.
              </p>
              <button
                onClick={() => {
                  setDraft("");
                  setEditing(true);
                }}
                className="rounded-md px-2 py-1.5 text-left text-xs font-medium text-fg hover:bg-bg-inset"
              >
                Change key
              </button>
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs font-medium text-danger hover:bg-bg-inset"
              >
                <IconTrash width={13} height={13} />
                Remove key
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function Header() {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-border bg-bg/80 px-4 backdrop-blur-md sm:px-6">
      <Logo size={26} />
      <div className="flex items-center gap-2">
        <button
          onClick={() => setHelpOpen(true)}
          aria-label="How Hugging Ground works"
          title="How Hugging Ground works"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-fg-muted transition-colors hover:bg-bg-inset hover:text-fg"
        >
          <IconHelpCircle width={17} height={17} />
        </button>
        <KeyMenu />
        <ThemeToggle />
      </div>
      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
    </header>
  );
}
