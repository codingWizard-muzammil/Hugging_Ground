import type { InferenceClient } from "@huggingface/inference";

export interface ChatAttachment {
  name: string;
  mime: string;
  size: number;
  dataUrl?: string;
  textContent?: string;
  kind: "image" | "text" | "unsupported";
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  attachments?: ChatAttachment[];
  error?: string;
  pending?: boolean;
}

type ChatContentChunk =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

function buildContent(message: ChatMessage): string | ChatContentChunk[] {
  const attachments = message.attachments ?? [];
  const images = attachments.filter((a) => a.kind === "image" && a.dataUrl);
  const textFiles = attachments.filter((a) => a.kind === "text" && a.textContent);

  let text = message.text;
  for (const file of textFiles) {
    text += `\n\n--- ${file.name} ---\n${file.textContent}`;
  }

  if (images.length === 0) return text;

  const chunks: ChatContentChunk[] = [{ type: "text", text }];
  for (const image of images) {
    chunks.push({ type: "image_url", image_url: { url: image.dataUrl! } });
  }
  return chunks;
}

export async function* streamChatCompletion(
  client: InferenceClient,
  model: string,
  history: ChatMessage[],
  options: { signal?: AbortSignal } = {}
): AsyncGenerator<string> {
  const messages = history
    .filter((m) => !m.pending)
    .map((m) => ({ role: m.role, content: buildContent(m) }));

  const stream = client.chatCompletionStream(
    { model, messages, max_tokens: 2048 },
    { signal: options.signal }
  );

  for await (const chunk of stream) {
    const delta = chunk.choices?.[0]?.delta?.content;
    if (delta) yield delta;
  }
}
