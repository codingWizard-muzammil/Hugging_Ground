import type { ChatAttachment } from "@/lib/hf/chat";
import { fileToDataUrl, uid } from "@/lib/utils";

const TEXT_EXTENSIONS = [
  ".txt", ".md", ".csv", ".tsv", ".json", ".yml", ".yaml", ".xml", ".log",
  ".py", ".js", ".jsx", ".ts", ".tsx", ".html", ".css", ".sql", ".sh", ".rs", ".go", ".java", ".c", ".cpp", ".rb",
];
const MAX_INLINE_TEXT_BYTES = 150_000;

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

export function isAudioFile(file: File): boolean {
  return file.type.startsWith("audio/");
}

function looksLikeText(file: File): boolean {
  if (file.type.startsWith("text/") || file.type === "application/json") return true;
  const lower = file.name.toLowerCase();
  return TEXT_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export interface UiAttachment {
  id: string;
  file: File;
}

export async function fileToChatAttachment(file: File): Promise<ChatAttachment> {
  const base = { name: file.name, mime: file.type || "application/octet-stream", size: file.size };

  if (isImageFile(file)) {
    const dataUrl = await fileToDataUrl(file);
    return { ...base, kind: "image", dataUrl };
  }

  if (looksLikeText(file) && file.size <= MAX_INLINE_TEXT_BYTES) {
    const textContent = await file.text();
    return { ...base, kind: "text", textContent };
  }

  return { ...base, kind: "unsupported" };
}

export function newAttachmentId() {
  return uid("att");
}
