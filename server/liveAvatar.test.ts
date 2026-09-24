import { afterEach, describe, expect, it, vi } from "vitest";
import { createLiveAvatarSession, parseSessionTokenFromResponse } from "./liveAvatar.js";

describe("parseSessionTokenFromResponse", () => {
  it("reads nested LiveAvatar API envelopes", () => {
    expect(
      parseSessionTokenFromResponse({
        code: 100,
        data: { session_id: "id", session_token: "nested-token" },
        message: "ok",
      }),
    ).toBe("nested-token");
  });

  it("reads flat session tokens for backwards compatibility", () => {
    expect(parseSessionTokenFromResponse({ session_token: "flat-token" })).toBe("flat-token");
  });
});

describe("createLiveAvatarSession", () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.LIVEAVATAR_API_KEY;

  afterEach(() => {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.LIVEAVATAR_API_KEY;
    else process.env.LIVEAVATAR_API_KEY = originalKey;
    delete process.env.LIVEAVATAR_AVATAR_ID;
  });

  it("returns not_configured without an API key", async () => {
    delete process.env.LIVEAVATAR_API_KEY;
    await expect(createLiveAvatarSession()).resolves.toEqual({ available: false, reason: "not_configured" });
  });

  it("maps nested token responses to available sessions", async () => {
    process.env.LIVEAVATAR_API_KEY = "test-key";
    process.env.LIVEAVATAR_AVATAR_ID = "00000000-0000-4000-8000-000000000001";
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        code: 100,
        data: { session_id: "00000000-0000-4000-8000-000000000002", session_token: "scoped-token" },
        message: "success",
      }),
    }) as typeof fetch;

    await expect(createLiveAvatarSession()).resolves.toEqual({
      available: true,
      session_token: "scoped-token",
    });
  });
});
