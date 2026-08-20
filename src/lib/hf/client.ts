import { useMemo } from "react";
import { InferenceClient } from "@huggingface/inference";
import { useApiKeyStore } from "@/stores/api-key-store";

export function useInferenceClient(): InferenceClient | null {
  const apiKey = useApiKeyStore((state) => state.apiKey);
  return useMemo(() => (apiKey ? new InferenceClient(apiKey) : null), [apiKey]);
}
