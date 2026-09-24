/** LiveKit region retries can run for minutes; cap wait so the UI can recover. */
export const LIVEAVATAR_CONNECT_TIMEOUT_MS = 32_000;

export async function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error(message)), ms);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

export function liveAvatarFailureMessage(error: unknown): "connection_failed" | "provider_unavailable" {
  const message = error instanceof Error ? error.message.toLowerCase() : "";
  const name = error instanceof Error ? error.name.toLowerCase() : "";
  if (
    message.includes("timed out") ||
    message.includes("pc connection") ||
    message.includes("signal connection") ||
    message.includes("websocket") ||
    name.includes("connectionerror")
  ) {
    return "connection_failed";
  }
  return "provider_unavailable";
}
