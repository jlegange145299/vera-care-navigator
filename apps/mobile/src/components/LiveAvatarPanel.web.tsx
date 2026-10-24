import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { LiveAvatarSession, SessionEvent } from "@heygen/liveavatar-web-sdk";
import {
  LIVEAVATAR_CONNECT_TIMEOUT_MS,
  liveAvatarFailureMessage,
  withTimeout,
} from "../../../../src/lib/liveAvatarConnect";
import { requestLiveAvatarWebSession } from "../lib/api";
import { colors } from "../theme";
import type { LiveAvatarPanelProps } from "./LiveAvatarPanel.types";

const failureNotices: Record<
  "not_configured" | "provider_unavailable" | "invalid_provider_response" | "credits_unavailable" | "connection_failed",
  string
> = {
  not_configured: "LiveAvatar is not configured. The portrait remains available.",
  provider_unavailable: "LiveAvatar is unavailable right now. The portrait remains available.",
  invalid_provider_response: "LiveAvatar returned an invalid session. The portrait remains available.",
  credits_unavailable: "LiveAvatar has no session credits available. The portrait remains available.",
  connection_failed: "LiveAvatar could not connect on this network. Check Wi-Fi or VPN and retry.",
};

export function LiveAvatarPanel({ portrait, assistantMessage }: LiveAvatarPanelProps) {
  const [session, setSession] = useState<LiveAvatarSession | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [hasVideo, setHasVideo] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const sessionRef = useRef<LiveAvatarSession | null>(null);
  const lastSpokenMessageId = useRef(assistantMessage?.id ?? null);

  const handleFailure = useCallback((error: unknown) => {
    console.warn("Mobile web LiveAvatar session failed.", error);
    const reason = liveAvatarFailureMessage(error);
    const activeSession = sessionRef.current;
    sessionRef.current = null;
    if (activeSession) {
      void activeSession.stop().catch((stopError: unknown) => {
        console.warn("Mobile web LiveAvatar cleanup failed.", stopError);
      });
    }
    setNotice(failureNotices[reason]);
    setSession(null);
    setIsConnecting(false);
    setHasVideo(false);
  }, []);

  useEffect(() => {
    if (session && videoRef.current) session.attach(videoRef.current);
  }, [session]);

  useEffect(() => {
    const controller = new AbortController();
    let pendingSession: LiveAvatarSession | null = null;
    let cancelled = false;
    setIsConnecting(true);
    setNotice(null);
    setHasVideo(false);

    void (async () => {
      try {
        const result = await requestLiveAvatarWebSession(controller.signal);
        if (cancelled) return;
        if (!result.available || !result.sessionToken) {
          const reason = result.reason ?? "provider_unavailable";
          setNotice(failureNotices[reason]);
          setIsConnecting(false);
          return;
        }

        pendingSession = new LiveAvatarSession(result.sessionToken, {
          autoKeepAlive: true,
          voiceChat: { defaultMuted: true },
        });
        sessionRef.current = pendingSession;
        pendingSession.on(SessionEvent.SESSION_STREAM_READY, () => {
          if (cancelled) return;
          if (videoRef.current) pendingSession?.attach(videoRef.current);
          setHasVideo(true);
        });
        pendingSession.on(SessionEvent.SESSION_DISCONNECTED, () => {
          if (cancelled) return;
          sessionRef.current = null;
          setSession(null);
          setHasVideo(false);
          setIsConnecting(false);
          setNotice(failureNotices.connection_failed);
        });

        await withTimeout(
          pendingSession.start(),
          LIVEAVATAR_CONNECT_TIMEOUT_MS,
          "LiveAvatar connection timed out while joining the video room.",
        );
        if (cancelled) {
          void pendingSession.stop();
          return;
        }

        setSession(pendingSession);
        setIsConnecting(false);
      } catch (error) {
        if (cancelled) return;
        handleFailure(error);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
      const activeSession = sessionRef.current;
      sessionRef.current = null;
      if (activeSession) {
        void activeSession.stop().catch((error: unknown) => {
          console.warn("Could not stop the mobile web LiveAvatar session.", error);
        });
      }
    };
  }, [attempt, handleFailure]);

  useEffect(() => {
    if (
      !session ||
      !hasVideo ||
      !assistantMessage ||
      lastSpokenMessageId.current === assistantMessage.id
    ) {
      return;
    }

    const messageId = assistantMessage.id;
    try {
      session.message(assistantMessage.text);
      lastSpokenMessageId.current = messageId;
    } catch (error) {
      handleFailure(error);
    }
  }, [assistantMessage, handleFailure, hasVideo, session]);

  return (
    <View style={styles.card} accessibilityLabel="Vera guide">
      <Image source={portrait} style={[styles.portrait, hasVideo && styles.hidden]} resizeMode="contain" />
      <video
        ref={videoRef}
        autoPlay
        playsInline
        aria-label="LiveAvatar session with Vera"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: hasVideo ? "block" : "none",
          position: "absolute",
          inset: 0,
        }}
      />
      <View style={styles.caption}>
        <Text style={styles.title}>{hasVideo ? "Vera · LiveAvatar" : "Vera"}</Text>
        <Text style={styles.detail}>
          {hasVideo ? "Ready to help" : isConnecting ? "Connecting to LiveAvatar…" : "The built-in guide is ready"}
        </Text>
      </View>
      {isConnecting && !hasVideo ? <ActivityIndicator style={styles.spinner} color={colors.surface} /> : null}
      {!hasVideo && notice ? (
        <View style={styles.noticeRow}>
          <Text style={styles.notice} accessibilityRole="alert">{notice}</Text>
          <Pressable onPress={() => setAttempt((current) => current + 1)} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 210,
    marginHorizontal: 12,
    marginBottom: 6,
    overflow: "hidden",
    borderRadius: 12,
    backgroundColor: colors.navy950,
  },
  portrait: { width: "100%", height: "100%", position: "absolute" },
  hidden: { opacity: 0 },
  caption: { position: "absolute", left: 12, right: 12, bottom: 9 },
  title: { color: colors.surface, fontSize: 13, fontWeight: "700" },
  detail: { color: colors.surface, fontSize: 10, marginTop: 2 },
  spinner: { position: "absolute", right: 12, top: 12 },
  noticeRow: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: colors.surface,
  },
  notice: { flex: 1, color: colors.ink700, fontSize: 10, lineHeight: 14 },
  retryButton: { paddingHorizontal: 10, paddingVertical: 7 },
  retryText: { color: colors.brandBlue, fontSize: 11, fontWeight: "700" },
});
