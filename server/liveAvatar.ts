interface LiveAvatarSessionResult {
  available: boolean;
  session_token?: string;
  reason?: "not_configured" | "provider_unavailable" | "invalid_provider_response";
}

interface LiveAvatarStartedSessionResult {
  available: boolean;
  session_token?: string;
  session_id?: string;
  livekit_url?: string;
  livekit_client_token?: string;
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

function getLiveAvatarBaseUrl() {
  return (process.env.LIVEAVATAR_BASE_URL ?? "https://api.liveavatar.com").replace(/\/$/, "");
}

async function stopLiveAvatarSessionIfNeeded(sessionToken: string) {
  try {
    await stopLiveAvatarSession(sessionToken);
  } catch (error) {
    const errorName = error instanceof Error ? error.name : "UnknownError";
    console.warn(`LiveAvatar cleanup failed (${errorName}).`);
  }
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

  const baseUrl = getLiveAvatarBaseUrl();
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

export async function createStartedLiveAvatarSession(): Promise<LiveAvatarStartedSessionResult> {
  const session = await createLiveAvatarSession();
  if (!session.available || !session.session_token) {
    return { available: false, reason: session.reason ?? "provider_unavailable" };
  }

  try {
    const response = await fetch(`${getLiveAvatarBaseUrl()}/v1/sessions/start`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.session_token}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(12_000),
    });
    if (!response.ok) {
      console.warn(`LiveAvatar mobile session start failed with status ${response.status}.`);
      await stopLiveAvatarSessionIfNeeded(session.session_token);
      return { available: false, reason: "provider_unavailable" };
    }

    const body = (await response.json()) as Record<string, unknown>;
    const data = body.data && typeof body.data === "object" ? (body.data as Record<string, unknown>) : body;
    const sessionId = extractString(data, ["session_id", "sessionId"]);
    const livekitUrl = extractString(data, ["livekit_url", "livekitUrl"]);
    const livekitClientToken = extractString(data, ["livekit_client_token", "livekitClientToken"]);
    if (!sessionId || !livekitUrl || !livekitClientToken) {
      console.warn("LiveAvatar mobile session response omitted required room details.");
      await stopLiveAvatarSessionIfNeeded(session.session_token);
      return { available: false, reason: "invalid_provider_response" };
    }

    return {
      available: true,
      session_token: session.session_token,
      session_id: sessionId,
      livekit_url: livekitUrl,
      livekit_client_token: livekitClientToken,
    };
  } catch (error) {
    const errorName = error instanceof Error ? error.name : "UnknownError";
    console.warn(`LiveAvatar mobile session start failed (${errorName}).`);
    await stopLiveAvatarSessionIfNeeded(session.session_token);
    return { available: false, reason: "provider_unavailable" };
  }
}

export async function stopLiveAvatarSession(sessionToken: string): Promise<void> {
  const response = await fetch(`${getLiveAvatarBaseUrl()}/v1/sessions/stop`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sessionToken}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) {
    throw new Error(`LiveAvatar session stop failed with status ${response.status}`);
  }
}
