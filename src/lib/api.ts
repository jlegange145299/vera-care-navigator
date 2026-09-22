import type { FactCheckResult, JourneyId } from "../types";

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

export interface LiveAvatarSessionReply {
  available: boolean;
  sessionToken?: string;
  reason?: "not_configured" | "provider_unavailable" | "invalid_provider_response";
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
  const response = await fetch("/api/chat", {
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

export async function requestLiveAvatarSession(signal?: AbortSignal): Promise<LiveAvatarSessionReply> {
  const response = await fetch("/api/avatar/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{}",
    signal,
  });
  if (!response.ok) throw new Error(`Avatar API returned ${response.status}`);

  const data = (await response.json()) as unknown;
  if (!data || typeof data !== "object" || typeof (data as Record<string, unknown>).available !== "boolean") {
    throw new Error("Avatar API returned an invalid response");
  }
  return data as LiveAvatarSessionReply;
}
