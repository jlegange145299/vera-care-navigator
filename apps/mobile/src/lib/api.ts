import type { FactCheckResult, JourneyId } from "@vera/core";

export type ApiReplyMode = "demo" | "openai" | "demo-fallback";

export interface ConversationHistoryItem {
  role: "assistant" | "user";
  content: string;
}

export interface VeraApiReply {
  text: string;
  intent: JourneyId | "safety" | "human-support" | "fact-check" | "general";
  planId?: JourneyId;
  mode: ApiReplyMode;
  factCheck?: FactCheckResult;
}

const DEV_API = "http://localhost:8787";
const REQUEST_TIMEOUT_MS = 8000;

function apiBaseUrl(): string | null {
  const configured = process.env.EXPO_PUBLIC_VERA_API_URL?.trim().replace(/\/$/, "");
  if (configured) return configured;
  if (typeof __DEV__ !== "undefined" && __DEV__) return DEV_API;
  return null;
}

export function isRemoteVeraApiConfigured() {
  return Boolean(process.env.EXPO_PUBLIC_VERA_API_URL?.trim());
}

function isVeraApiReply(value: unknown): value is VeraApiReply {
  if (!value || typeof value !== "object") return false;
  const reply = value as Record<string, unknown>;
  return typeof reply.text === "string" && typeof reply.intent === "string" && typeof reply.mode === "string";
}

export async function requestVeraReply(
  message: string,
  history: ConversationHistoryItem[],
  signal?: AbortSignal,
): Promise<VeraApiReply> {
  const base = apiBaseUrl();
  if (!base) throw new Error("Vera API URL is not configured for this build");

  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS);

  const onExternalAbort = () => timeoutController.abort();
  signal?.addEventListener("abort", onExternalAbort);

  try {
    const response = await fetch(`${base}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
      signal: timeoutController.signal,
    });

    if (!response.ok) throw new Error(`Vera API returned ${response.status}`);
    const data = (await response.json()) as unknown;
    if (!isVeraApiReply(data)) throw new Error("Vera API returned an invalid response");
    return data;
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener("abort", onExternalAbort);
  }
}
