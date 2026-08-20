export interface HfAccountInfo {
  name: string;
  fullname: string;
  avatarUrl: string | null;
  isPro: boolean;
  type: "user" | "org";
  periodEnd: number | null;
}

interface RawWhoAmI {
  name?: string;
  fullname?: string;
  avatarUrl?: string;
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
  const avatarUrl = data.avatarUrl
    ? data.avatarUrl.startsWith("http")
      ? data.avatarUrl
      : `https://huggingface.co${data.avatarUrl}`
    : null;
  return {
    name: data.name ?? "",
    fullname: data.fullname ?? data.name ?? "",
    avatarUrl,
    isPro: Boolean(data.isPro),
    type: data.type === "org" ? "org" : "user",
    periodEnd: typeof data.periodEnd === "number" ? data.periodEnd : null,
  };
}
