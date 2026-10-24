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

export interface LiveAvatarMobileSessionReply {
  available: boolean;
  sessionToken?: string;
  sessionId?: string;
  livekitUrl?: string;
  livekitClientToken?: string;
  reason?: "not_configured" | "provider_unavailable" | "invalid_provider_response";
}

export interface LiveAvatarWebSessionReply {
  available: boolean;
  sessionToken?: string;
  reason?: "not_configured" | "provider_unavailable" | "invalid_provider_response";
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

export async function requestLiveAvatarMobileSession(
  signal?: AbortSignal,
): Promise<LiveAvatarMobileSessionReply> {
  const base = apiBaseUrl();
  if (!base) throw new Error("Vera API URL is not configured for this build");

  const response = await fetch(`${base}/api/avatar/mobile-session`, {
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
  const session = data as Record<string, unknown>;
  if (
    session.available &&
    (typeof session.sessionToken !== "string" ||
      typeof session.sessionId !== "string" ||
      typeof session.livekitUrl !== "string" ||
      typeof session.livekitClientToken !== "string")
  ) {
    throw new Error("Avatar API returned an incomplete mobile session");
  }
  return data as LiveAvatarMobileSessionReply;
}

export async function requestLiveAvatarWebSession(
  signal?: AbortSignal,
): Promise<LiveAvatarWebSessionReply> {
  const base = apiBaseUrl();
  if (!base) throw new Error("Vera API URL is not configured for this build");

  const response = await fetch(`${base}/api/avatar/session`, {
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
  const session = data as Record<string, unknown>;
  if (session.available && typeof session.sessionToken !== "string") {
    throw new Error("Avatar API returned an incomplete web session");
  }
  return data as LiveAvatarWebSessionReply;
}

export async function stopLiveAvatarMobileSession(sessionToken: string): Promise<void> {
  const base = apiBaseUrl();
  if (!base) throw new Error("Vera API URL is not configured for this build");

  const response = await fetch(`${base}/api/avatar/mobile-session/stop`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionToken }),
  });
  if (!response.ok) throw new Error(`Avatar API returned ${response.status}`);
}
