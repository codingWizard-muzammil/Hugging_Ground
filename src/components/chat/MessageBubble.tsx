"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { LogoMark } from "@/components/Logo";
import { IconAlertTriangle, IconCheck, IconCopy, IconFile } from "@/components/icons";
import type { ChatMessage } from "@/lib/hf/chat";
import { cn, formatBytes } from "@/lib/utils";

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
      className="flex items-center gap-1 text-[11px] text-fg-subtle hover:text-fg"
    >
      {copied ? <IconCheck width={12} height={12} /> : <IconCopy width={12} height={12} />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3 hg-animate-in", isUser && "flex-row-reverse")}>
      {!isUser && (
        <div className="mt-0.5 shrink-0">
          <LogoMark size={26} />
        </div>
      )}

      <div className={cn("flex min-w-0 max-w-[85%] flex-col gap-1.5 sm:max-w-[75%]", isUser && "items-end")}>
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {message.attachments.map((a, i) =>
              a.kind === "image" && a.dataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={a.dataUrl}
                  alt={a.name}
                  className="h-24 w-24 rounded-lg border border-border object-cover"
                />
              ) : (
                <div
                  key={i}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-bg-inset px-2 py-1.5 text-xs"
                >
                  <IconFile width={13} height={13} className="text-fg-subtle" />
                  <span className="max-w-[10rem] truncate">{a.name}</span>
                  <span className="text-fg-subtle">{formatBytes(a.size)}</span>
                  {a.kind === "unsupported" && (
                    <span className="text-[10px] text-fg-subtle">(not sent to chat)</span>
                  )}
                </div>
              )
            )}
          </div>
        )}

        {(message.text || message.pending) && (
          <div
            className={cn(
              "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
              isUser
                ? "bg-bg-inset text-fg"
                : "border border-border bg-bg-elevated text-fg"
            )}
          >
            {message.pending && !message.text ? (
              <TypingDots />
            ) : isUser ? (
              <p className="whitespace-pre-wrap">{message.text}</p>
            ) : (
              <div className="markdown-body">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {message.error && (
          <div className="flex items-center gap-1.5 rounded-lg border border-danger/30 bg-danger/10 px-3 py-1.5 text-xs text-danger">
            <IconAlertTriangle width={13} height={13} />
            {message.error}
          </div>
        )}

        {!isUser && message.text && !message.pending && <CopyButton text={message.text} />}
      </div>
    </div>
  );
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="hg-typing-dot h-1.5 w-1.5 rounded-full bg-fg-subtle"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}
