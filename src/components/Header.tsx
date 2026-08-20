"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { HelpModal } from "@/components/HelpModal";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  IconActivity,
  IconChevronDown,
  IconExternalLink,
  IconHelpCircle,
  IconKey,
  IconTrash,
} from "@/components/icons";
import { useApiKeyStore } from "@/stores/api-key-store";
import { fetchAccountInfo, type HfAccountInfo } from "@/lib/hf/account";
import { useUsageCount } from "@/stores/usage-store";
import { formatCompactNumber } from "@/lib/utils";

function maskKey(key: string) {
  if (key.length <= 10) return "••••••••";
  return `${key.slice(0, 6)}••••${key.slice(-3)}`;
}

function ProfileSection({
  account,
  loading,
  accountError,
}: {
  account: HfAccountInfo | undefined;
  loading: boolean;
  accountError: boolean;
}) {
  if (loading || accountError || !account) return null;

  return (
    <a
      href={`https://huggingface.co/${account.name}`}
      target="_blank"
      rel="noopener noreferrer"
      className="mb-2 flex items-center gap-2.5 rounded-lg border border-border bg-bg p-2.5 hover:bg-bg-inset"
    >
      {account.avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={account.avatarUrl}
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 shrink-0 rounded-full"
        />
      ) : (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg-inset text-xs font-semibold text-fg-muted">
          {account.name.slice(0, 1).toUpperCase()}
        </div>
      )}
      <div className="min-w-0">
        <p className="truncate text-xs font-semibold text-fg">
          {account.fullname || account.name}
        </p>
        <p className="truncate text-[11px] text-fg-muted">@{account.name}</p>
      </div>
    </a>
  );
}

function UsageSection({
  apiKey,
  account,
  loading,
  accountError,
}: {
  apiKey: string;
  account: HfAccountInfo | undefined;
  loading: boolean;
  accountError: boolean;
}) {
  const requestCount = useUsageCount(apiKey);

  return (
    <div className="mb-2 rounded-lg border border-border bg-bg p-2.5">
      <p className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-fg-subtle">
        <IconActivity width={12} height={12} />
        Usage
      </p>
      <div className="flex items-center justify-between text-xs">
        <span className="text-fg-muted">Requests sent (this browser)</span>
        <span className="font-mono font-medium">
          {formatCompactNumber(requestCount)}
        </span>
      </div>
      <div className="mt-1.5 flex items-center justify-between text-xs">
        <span className="text-fg-muted">Plan</span>
        <span className="font-medium">
          {loading ? "…" : accountError ? "—" : account?.isPro ? "PRO" : "Free"}
        </span>
      </div>
      <p className="mt-1.5 text-[10px] leading-relaxed text-fg-subtle">
        Hugging Face doesn&apos;t expose exact credit balance via API — check
        the billing page for the full picture.
      </p>
      <a
        href="https://huggingface.co/settings/billing"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 flex items-center justify-center gap-1.5 rounded-md border border-border py-1.5 text-[11px] font-medium text-fg-muted hover:bg-bg-inset hover:text-fg"
      >
        View usage & billing
        <IconExternalLink width={11} height={11} />
      </a>
    </div>
  );
}

function KeyMenu() {
  const apiKey = useApiKeyStore((state) => state.apiKey);
  if (!apiKey) return null;
  return <KeyMenuPanel key={apiKey} apiKey={apiKey} />;
}

function KeyMenuPanel({ apiKey }: { apiKey: string }) {
  const setApiKey = useApiKeyStore((state) => state.setApiKey);
  const signOut = useApiKeyStore((state) => state.signOut);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const {
    data: account,
    isPending: accountLoading,
    isError: accountError,
  } = useQuery<HfAccountInfo>({
    queryKey: ["hf-account", apiKey],
    queryFn: ({ signal }) => fetchAccountInfo(apiKey, signal),
  });

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

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs font-medium text-fg-muted transition-colors hover:bg-bg-inset hover:text-fg"
      >
        {account?.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={account.avatarUrl}
            alt=""
            width={16}
            height={16}
            className="h-4 w-4 rounded-full"
          />
        ) : (
          <IconKey width={14} height={14} />
        )}
        <span className="font-mono">
          {account?.name ? account.name : maskKey(apiKey)}
        </span>
        <IconChevronDown width={14} height={14} />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-72 rounded-xl border border-border bg-bg-elevated p-3 shadow-lg hg-animate-in">
          <ProfileSection
            account={account}
            loading={accountLoading}
            accountError={accountError}
          />
          <UsageSection
            apiKey={apiKey}
            account={account}
            loading={accountLoading}
            accountError={accountError}
          />
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
              <button
                onClick={() => {
                  setDraft("");
                  setEditing(true);
                }}
                className="rounded-md px-2 py-1.5 text-left text-xs font-medium text-fg hover:bg-bg-inset"
              >
                Change key from {" "}
                <span className="text-blue-400">
                {maskKey(apiKey)}
                </span>
              </button>
              <button
                onClick={() => signOut()}
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
