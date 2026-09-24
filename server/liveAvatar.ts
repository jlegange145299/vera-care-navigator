interface LiveAvatarSessionResult {
  available: boolean;
  session_token?: string;
  reason?: "not_configured" | "provider_unavailable" | "invalid_provider_response";
}

function extractString(source: unknown, keys: string[]): string | undefined {
  if (!source || typeof source !== "object") return undefined;
  const record = source as Record<string, unknown>;
  for (const key of keys) {
    if (typeof record[key] === "string" && record[key].length > 0) return record[key];
  }
  return undefined;
}

/** LiveAvatar wraps tokens in `{ data: { session_token } }` (see SDKSessionTokenSchema). */
export function parseSessionTokenFromResponse(data: unknown): string | undefined {
  const direct = extractString(data, ["session_token", "sessionToken"]);
  if (direct) return direct;
  if (!data || typeof data !== "object") return undefined;
  const nested = (data as Record<string, unknown>).data;
  return extractString(nested, ["session_token", "sessionToken"]);
}

export async function createLiveAvatarSession(): Promise<LiveAvatarSessionResult> {
  const apiKey = process.env.LIVEAVATAR_API_KEY;
  if (!apiKey) {
    return { available: false, reason: "not_configured" };
  }

  const baseUrl = (process.env.LIVEAVATAR_BASE_URL ?? "https://api.liveavatar.com").replace(/\/$/, "");
  const endpoint = process.env.LIVEAVATAR_SESSION_TOKEN_ENDPOINT ?? `${baseUrl}/v1/sessions/token`;

  const avatarId = process.env.LIVEAVATAR_AVATAR_ID?.trim();
  const voiceId = process.env.LIVEAVATAR_VOICE_ID?.trim();
  const contextId = process.env.LIVEAVATAR_CONTEXT_ID?.trim();
  const payload: Record<string, unknown> = {
    mode: "FULL",
    is_sandbox: process.env.LIVEAVATAR_SANDBOX?.toLowerCase() === "true",
  };
  if (avatarId) payload.avatar_id = avatarId;

  const persona: Record<string, unknown> = { language: process.env.LIVEAVATAR_LANGUAGE ?? "en" };
  if (voiceId) persona.voice_id = voiceId;
  if (contextId) persona.context_id = contextId;
  if (voiceId || contextId) payload.avatar_persona = persona;

  try {
    const upstreamResponse = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": apiKey,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(12_000),
    });

    if (!upstreamResponse.ok) {
      console.warn(`LiveAvatar embed request failed with status ${upstreamResponse.status}.`);
      return { available: false, reason: "provider_unavailable" };
    }

    const data = (await upstreamResponse.json()) as Record<string, unknown>;
    const sessionToken = parseSessionTokenFromResponse(data);
    if (!sessionToken) {
      const message = extractString(data, ["message"]);
      console.warn("LiveAvatar returned no session token.", message ? { message } : undefined);
      return { available: false, reason: "invalid_provider_response" };
    }

    return { available: true, session_token: sessionToken };
  } catch (error) {
    const errorName = error instanceof Error ? error.name : "UnknownError";
    console.warn(`LiveAvatar request failed (${errorName}).`);
    return { available: false, reason: "provider_unavailable" };
  }
}
