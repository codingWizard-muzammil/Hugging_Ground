export interface HfAccountInfo {
  name: string;
  isPro: boolean;
  type: "user" | "org";
  periodEnd: number | null;
}

interface RawWhoAmI {
  name?: string;
  fullname?: string;
  isPro?: boolean;
  type?: string;
  periodEnd?: number | null;
}

export async function fetchAccountInfo(apiKey: string, signal?: AbortSignal): Promise<HfAccountInfo> {
  const res = await fetch("https://huggingface.co/api/whoami-v2", {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal,
  });
  if (!res.ok) {
    throw new Error(
      res.status === 401
        ? "That API key isn't valid anymore."
        : `Couldn't load account info (${res.status}).`
    );
  }
  const data = (await res.json()) as RawWhoAmI;
  return {
    name: data.name ?? data.fullname ?? "",
    isPro: Boolean(data.isPro),
    type: data.type === "org" ? "org" : "user",
    periodEnd: typeof data.periodEnd === "number" ? data.periodEnd : null,
  };
}
