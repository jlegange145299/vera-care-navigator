interface LiveAvatarSessionResult {
  available: boolean;
  session_token?: string;
  reason?: "not_configured" | "provider_unavailable" | "invalid_provider_response";
}

function extractString(source: unknown, keys: string[]): string | undefined {
  if (!source || typeof source !== "object") return undefined;
  const record = source as Record<string, unknown>;
  for (const key of keys) {
    if (typeof record[key] === "string") return record[key];
  }
  return undefined;
}

export async function createLiveAvatarSession(): Promise<LiveAvatarSessionResult> {
  const apiKey = process.env.LIVEAVATAR_API_KEY;
  if (!apiKey) {
    return { available: false, reason: "not_configured" };
  }

  const baseUrl = (process.env.LIVEAVATAR_BASE_URL ?? "https://api.liveavatar.com").replace(/\/$/, "");
  const endpoint = process.env.LIVEAVATAR_SESSION_TOKEN_ENDPOINT ?? `${baseUrl}/v1/sessions/token`;
  const payload = {
    mode: "FULL",
    avatar_id: process.env.LIVEAVATAR_AVATAR_ID,
    avatar_persona: {
      voice_id: process.env.LIVEAVATAR_VOICE_ID,
      context_id: process.env.LIVEAVATAR_CONTEXT_ID,
      language: process.env.LIVEAVATAR_LANGUAGE ?? "en",
    },
  };

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
    const sessionToken = extractString(data, ["session_token", "sessionToken"]);
    if (!sessionToken) {
      console.warn("LiveAvatar returned no session token.");
      return { available: false, reason: "invalid_provider_response" };
    }

    return { available: true, session_token: sessionToken };
  } catch (error) {
    const errorName = error instanceof Error ? error.name : "UnknownError";
    console.warn(`LiveAvatar request failed (${errorName}).`);
    return { available: false, reason: "provider_unavailable" };
  }
}
