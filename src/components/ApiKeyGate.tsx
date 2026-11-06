"use client";

import { useState } from "react";
import { Logo } from "@/components/Logo";
import { IconAlertTriangle, IconExternalLink, IconEye, IconEyeOff, IconKey } from "@/components/icons";
import { useApiKeyStore } from "@/stores/api-key-store";
import { cn } from "@/lib/utils";

const TOKEN_URL =
  "https://huggingface.co/settings/tokens/new?ownUserPermissions=inference.serverless.write&tokenType=fineGrained";

export function ApiKeyGate({ children }: { children: React.ReactNode }) {
  const apiKey = useApiKeyStore((state) => state.apiKey);
  const setApiKey = useApiKeyStore((state) => state.setApiKey);
  const [draft, setDraft] = useState("");
  const [reveal, setReveal] = useState(false);

  if (apiKey) return <>{children}</>;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (draft.trim()) setApiKey(draft);
  }

  const looksValid = draft.trim().length === 0 || draft.trim().startsWith("hf_");

  return (
    <div className="hg-scrollbar flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-4 py-12">
      <div className="w-full max-w-md hg-animate-in">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <Logo size={44} showWordmark={false} />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Welcome to <span className="text-accent-solid">Hugging Ground</span>
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">
              Paste your Hugging Face API key to start playing with any model on
              the Hub — no account, no signup, nothing stored anywhere but your
              own browser.
            </p>
          </div>
        </div>

        <form
          onSubmit={submit}
          className="rounded-2xl border border-border bg-bg-elevated p-5 shadow-sm"
        >
          <label htmlFor="hf-token" className="mb-2 block text-xs font-medium text-fg-muted">
            Hugging Face API key
          </label>
          <div className="relative">
            <IconKey className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-subtle" />
            <input
              id="hf-token"
              type={reveal ? "text" : "password"}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              autoComplete="off"
              spellCheck={false}
              className="w-full rounded-lg border border-border bg-bg py-2.5 pl-10 pr-10 font-mono text-sm outline-none ring-ring/40 placeholder:text-fg-subtle focus:border-ring focus:ring-2"
            />
            <button
              type="button"
              onClick={() => setReveal((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-fg-subtle hover:text-fg"
              aria-label={reveal ? "Hide key" : "Show key"}
            >
              {reveal ? <IconEyeOff /> : <IconEye />}
            </button>
          </div>

          {!looksValid && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-danger">
              <IconAlertTriangle width={14} height={14} />
              Hugging Face tokens usually start with &quot;hf_&quot; — double check yours.
            </p>
          )}

          <button
            type="submit"
            disabled={!draft.trim()}
            className={cn(
              "mt-4 flex w-full items-center justify-center rounded-lg py-2.5 text-sm font-medium text-white transition-opacity",
              draft.trim() ? "bg-accent-solid hover:opacity-90" : "cursor-not-allowed bg-bg-inset text-fg-subtle"
            )}
          >
            Continue to the playground
          </button>

          <a
            href={TOKEN_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center justify-center gap-1.5 text-xs font-medium text-fg-muted hover:text-fg"
          >
            Don&apos;t have a key? Create one for free
            <IconExternalLink width={13} height={13} />
          </a>
        </form>

        <p className="mt-5 text-center text-xs leading-relaxed text-fg-subtle">
          Your key is saved only in this browser&apos;s local storage and is sent
          directly to Hugging Face — it never touches any server of ours.
        </p>
      </div>
    </div>
  );
}
