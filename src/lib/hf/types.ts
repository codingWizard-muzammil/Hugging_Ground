export interface LabelScore {
  label: string;
  score: number;
}

export interface EntityItem {
  label: string;
  word: string;
  score: number;
  start?: number;
  end?: number;
}

export interface DetectionBox {
  label: string;
  score: number;
  box: { xmin: number; ymin: number; xmax: number; ymax: number };
}

export interface SegmentMask {
  label: string;
  score?: number;
  maskDataUrl: string;
}

export type TaskResult =
  | { kind: "text"; text: string }
  | { kind: "image"; url: string }
  | { kind: "audio"; url: string }
  | { kind: "labels"; items: LabelScore[] }
  | { kind: "entities"; items: EntityItem[]; sourceText: string }
  | { kind: "boxes"; items: DetectionBox[]; imageUrl: string }
  | { kind: "masks"; items: SegmentMask[]; imageUrl: string }
  | { kind: "answer"; answer: string; score?: number }
  | { kind: "json"; data: unknown };

export type InputKind =
  | "prompt"
  | "prompt-with-image"
  | "text"
  | "text-labels"
  | "text-context"
  | "image"
  | "image-labels"
  | "image-question"
  | "image-prompt"
  | "audio";

export type TaskInput =
  | { kind: "prompt"; text: string }
  | { kind: "prompt-with-image"; text: string; image?: Blob }
  | { kind: "text"; text: string }
  | { kind: "text-labels"; text: string; labels: string[] }
  | { kind: "text-context"; question: string; context: string }
  | { kind: "image"; image: Blob }
  | { kind: "image-labels"; image: Blob; labels: string[] }
  | { kind: "image-question"; image: Blob; question: string }
  | { kind: "image-prompt"; image: Blob; prompt: string }
  | { kind: "audio"; audio: Blob };
