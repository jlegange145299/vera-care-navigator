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

function apiBaseUrl() {
  const configured = process.env.EXPO_PUBLIC_VERA_API_URL?.replace(/\/$/, "");
  if (configured) return configured;
  if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
  return "http://localhost:8787";
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
  const response = await fetch(`${apiBaseUrl()}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history }),
    signal,
  });

  if (!response.ok) throw new Error(`Vera API returned ${response.status}`);
  const data = (await response.json()) as unknown;
  if (!isVeraApiReply(data)) throw new Error("Vera API returned an invalid response");
  return data;
}
