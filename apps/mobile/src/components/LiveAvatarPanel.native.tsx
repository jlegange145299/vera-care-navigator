import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { ComponentType } from "react";
import Constants, { ExecutionEnvironment } from "expo-constants";
import {
  requestLiveAvatarMobileSession,
  stopLiveAvatarMobileSession,
  type LiveAvatarMobileSessionReply,
} from "../lib/api";
import { colors } from "../theme";
import type { LiveAvatarPanelProps } from "./LiveAvatarPanel.types";
import type { LiveAvatarRoomProps } from "./LiveAvatarRoom.native";

const connectionFailureNotice =
  "LiveAvatar could not connect on this network. The portrait remains available; check Wi-Fi or VPN and retry.";
const unavailableNotice = "LiveAvatar is unavailable right now. The built-in guide remains active.";

function isConnectedSession(
  session: LiveAvatarMobileSessionReply,
): session is LiveAvatarMobileSessionReply & {
  sessionToken: string;
  sessionId: string;
  livekitUrl: string;
  livekitClientToken: string;
} {
  return Boolean(
    session.available &&
      session.sessionToken &&
      session.sessionId &&
      session.livekitUrl &&
      session.livekitClientToken,
  );
}

type ConnectedLiveAvatarSession = LiveAvatarMobileSessionReply & {
  sessionToken: string;
  sessionId: string;
  livekitUrl: string;
  livekitClientToken: string;
};

export function LiveAvatarPanel({ portrait, assistantMessage }: LiveAvatarPanelProps) {
  const [attempt, setAttempt] = useState(0);
  const [session, setSession] = useState<ConnectedLiveAvatarSession | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [hasVideo, setHasVideo] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const sessionRef = useRef<string | null>(null);
  const stopAudioSessionRef = useRef<(() => Promise<void>) | null>(null);
  const [RoomRenderer, setRoomRenderer] = useState<ComponentType<LiveAvatarRoomProps> | null>(null);
  const onVideoReady = useCallback(() => setHasVideo(true), []);

  const stopSession = useCallback(async (sessionToken: string) => {
    try {
      await stopLiveAvatarMobileSession(sessionToken);
    } catch (error) {
      console.warn("Could not stop the native LiveAvatar session.", error);
    }
  }, []);

  const handleRoomError = useCallback((error: Error) => {
    console.warn("Native LiveAvatar room connection failed.", error);
    setNotice(connectionFailureNotice);
    setIsConnecting(false);
    setHasVideo(false);
    setSession(null);
    const token = sessionRef.current;
    sessionRef.current = null;
    if (token) void stopSession(token);
    const stopAudioSession = stopAudioSessionRef.current;
    stopAudioSessionRef.current = null;
    if (stopAudioSession) {
      void stopAudioSession().catch((stopError: unknown) => {
        console.warn("Could not stop the native LiveAvatar audio session.", stopError);
      });
    }
  }, [stopSession]);

  useEffect(() => {
    if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
      setIsConnecting(false);
      setNotice("LiveAvatar needs a native development build. Expo Go continues with the built-in guide.");
      return;
    }

    let cancelled = false;
    setIsConnecting(true);
    void import("./LiveAvatarRoom.native").then(({ LiveAvatarRoom }) => {
      if (cancelled) return;
      setRoomRenderer(() => LiveAvatarRoom);
    }).catch((error: unknown) => {
      if (cancelled) return;
      console.warn("Native LiveAvatar support could not be loaded.", error);
      setIsConnecting(false);
      setNotice(unavailableNotice);
    });
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  useEffect(() => {
    if (Constants.executionEnvironment === ExecutionEnvironment.StoreClient) {
      setIsConnecting(false);
      setNotice("LiveAvatar needs a native development build. Expo Go continues with the built-in guide.");
      return;
    }
    if (!RoomRenderer) return;

    let cancelled = false;
    setIsConnecting(true);
    setHasVideo(false);
    setNotice(null);

    void (async () => {
      try {
        const nativeModule = await import("./LiveAvatarRoom.native");
        if (cancelled) return;
        stopAudioSessionRef.current = nativeModule.stopLiveAvatarAudioSession;
        await nativeModule.startLiveAvatarAudioSession();
        if (cancelled) return;

        const result = await requestLiveAvatarMobileSession();
        if (cancelled) {
          if (result.sessionToken) void stopSession(result.sessionToken);
          return;
        }
        if (!isConnectedSession(result)) {
          const stopAudioSession = stopAudioSessionRef.current;
          stopAudioSessionRef.current = null;
          if (stopAudioSession) await stopAudioSession();
          setIsConnecting(false);
          setNotice(
            result.reason === "not_configured"
              ? "LiveAvatar is not configured. The built-in guide remains active."
              : unavailableNotice,
          );
          return;
        }

        sessionRef.current = result.sessionToken;
        setSession(result);
      } catch (error) {
        if (cancelled) return;
        console.warn("Native LiveAvatar session could not start.", error);
        const stopAudioSession = stopAudioSessionRef.current;
        stopAudioSessionRef.current = null;
        if (stopAudioSession) {
          await stopAudioSession().catch((stopError: unknown) => {
            console.warn("Could not stop the native LiveAvatar audio session.", stopError);
          });
        }
        setIsConnecting(false);
        setNotice(unavailableNotice);
      }
    })();

    return () => {
      cancelled = true;
      const token = sessionRef.current;
      sessionRef.current = null;
      if (token) void stopSession(token);
      const stopAudioSession = stopAudioSessionRef.current;
      stopAudioSessionRef.current = null;
      if (stopAudioSession) {
        void stopAudioSession().catch((error: unknown) => {
          console.warn("Could not stop the native LiveAvatar audio session.", error);
        });
      }
    };
  }, [attempt, stopSession, RoomRenderer]);

  useEffect(() => {
    if (!session || hasVideo) return;
    const timeout = setTimeout(() => handleRoomError(new Error("LiveAvatar video connection timed out.")), 35_000);
    return () => clearTimeout(timeout);
  }, [handleRoomError, hasVideo, session]);

  const retry = () => {
    setNotice(null);
    setAttempt((current) => current + 1);
  };

  return (
    <View style={styles.card} accessibilityLabel="LiveAvatar guide">
      <View style={styles.media}>
        <Image source={portrait} style={[styles.portrait, hasVideo && styles.hidden]} resizeMode="contain" />
        {session && RoomRenderer ? (
          <RoomRenderer
            session={session}
            assistantMessage={assistantMessage}
            onVideoReady={onVideoReady}
            onDisconnected={() => {
              if (sessionRef.current) handleRoomError(new Error("LiveAvatar room disconnected."));
            }}
            onError={handleRoomError}
          />
        ) : null}
        <View style={styles.caption}>
          <Text style={styles.captionTitle}>{hasVideo ? "Vera · LiveAvatar" : "Vera"}</Text>
          <Text style={styles.captionDetail}>
            {hasVideo ? "Ready to help" : isConnecting ? "Connecting to LiveAvatar…" : "Built-in guide is ready"}
          </Text>
        </View>
        {isConnecting && !hasVideo ? <ActivityIndicator style={styles.spinner} color={colors.surface} /> : null}
      </View>
      {!hasVideo && notice ? (
        <View style={styles.noticeRow}>
          <Text style={styles.notice} accessibilityRole="alert">
            {notice}
          </Text>
          <Pressable onPress={retry} style={styles.retryButton} accessibilityRole="button">
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginBottom: 6,
    overflow: "hidden",
    borderRadius: 12,
    backgroundColor: colors.navy950,
  },
  media: {
    height: 210,
    overflow: "hidden",
    backgroundColor: colors.navy950,
  },
  portrait: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  hidden: { opacity: 0 },
  caption: {
    position: "absolute",
    left: 12,
    bottom: 9,
  },
  captionTitle: { color: colors.surface, fontSize: 13, fontWeight: "700" },
  captionDetail: { color: colors.surface, fontSize: 10, marginTop: 2 },
  spinner: { position: "absolute", right: 12, top: 12 },
  noticeRow: {
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
