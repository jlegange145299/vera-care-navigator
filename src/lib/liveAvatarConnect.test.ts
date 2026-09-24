import { describe, expect, it } from "vitest";
import { liveAvatarFailureMessage, withTimeout } from "./liveAvatarConnect";

describe("liveAvatarFailureMessage", () => {
  it("classifies WebRTC connection failures", () => {
    expect(liveAvatarFailureMessage(new Error("could not establish pc connection"))).toBe("connection_failed");
    expect(liveAvatarFailureMessage(new Error("LiveAvatar connection timed out while joining the video room."))).toBe(
      "connection_failed",
    );
  });

  it("falls back to provider_unavailable for unknown errors", () => {
    expect(liveAvatarFailureMessage(new Error("unexpected"))).toBe("provider_unavailable");
  });
});

describe("withTimeout", () => {
  it("rejects when the promise exceeds the limit", async () => {
    await expect(
      withTimeout(new Promise<void>(() => undefined), 20, "LiveAvatar connection timed out"),
    ).rejects.toThrow("timed out");
  });
});
