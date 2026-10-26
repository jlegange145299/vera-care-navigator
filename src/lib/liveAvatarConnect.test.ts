import { describe, expect, it, vi } from "vitest";
import { liveAvatarFailureMessage, withTimeout } from "./liveAvatarConnect";

describe("liveAvatarFailureMessage", () => {
  it("classifies sessions rejected because the account has no credits", () => {
    expect(liveAvatarFailureMessage(new Error("No credits available for start session"))).toBe("credits_unavailable");
  });

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

  it("runs cleanup if the promise resolves after the timeout", async () => {
    let resolveConnection!: () => void;
    const lateCleanup = vi.fn();
    const connection = new Promise<void>((resolve) => {
      resolveConnection = resolve;
    });

    await expect(
      withTimeout(connection, 20, "LiveAvatar connection timed out", lateCleanup),
    ).rejects.toThrow("timed out");

    resolveConnection();
    await Promise.resolve();

    expect(lateCleanup).toHaveBeenCalledOnce();
  });
});
