interface LiveAvatarEmbedResult {
  available: boolean;
  url?: string;
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

function extractEmbedUrl(payload: unknown) {
  const direct = extractString(payload, ["url", "embed_url", "embedUrl"]);
  if (direct) return direct;

  if (payload && typeof payload === "object") {
    const nested = (payload as Record<string, unknown>).data;
    const nestedUrl = extractString(nested, ["url", "embed_url", "embedUrl"]);
    if (nestedUrl) return nestedUrl;

    const script = extractString(payload, ["script"]) ?? extractString(nested, ["script"]);
    const scriptSource = script?.match(/src=["']([^"']+)["']/i)?.[1];
    if (scriptSource) return scriptSource;
  }

  return undefined;
}

function isAllowedEmbedUrl(candidate: string) {
  try {
    const url = new URL(candidate);
    const configuredHosts = (process.env.LIVEAVATAR_ALLOWED_HOSTS ?? "liveavatar.com,heygen.com")
      .split(",")
      .map((host) => host.trim().toLowerCase())
      .filter(Boolean);

    return (
      url.protocol === "https:" &&
      configuredHosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`))
    );
  } catch {
    return false;
  }
}

export async function createLiveAvatarEmbed(): Promise<LiveAvatarEmbedResult> {
  const apiKey = process.env.LIVEAVATAR_API_KEY;
  if (!apiKey) {
    return { available: false, reason: "not_configured" };
  }

  const baseUrl = (process.env.LIVEAVATAR_BASE_URL ?? "https://api.liveavatar.com").replace(/\/$/, "");
  const endpoint = process.env.LIVEAVATAR_EMBED_ENDPOINT ?? `${baseUrl}/v2/embeddings`;
  const payload: Record<string, string> = {};

  if (process.env.LIVEAVATAR_AVATAR_ID) payload.avatar_id = process.env.LIVEAVATAR_AVATAR_ID;
  if (process.env.LIVEAVATAR_CONTEXT_ID) payload.context_id = process.env.LIVEAVATAR_CONTEXT_ID;

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

    const data = (await upstreamResponse.json()) as unknown;
    const url = extractEmbedUrl(data);
    if (!url || !isAllowedEmbedUrl(url)) {
      console.warn("LiveAvatar returned an invalid or untrusted embed URL.");
      return { available: false, reason: "invalid_provider_response" };
    }

    return { available: true, url };
  } catch (error) {
    const errorName = error instanceof Error ? error.name : "UnknownError";
    console.warn(`LiveAvatar request failed (${errorName}).`);
    return { available: false, reason: "provider_unavailable" };
  }
}
