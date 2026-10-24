import { useEffect, useRef } from "react";
import { StyleSheet } from "react-native";
import {
  AudioSession,
  LiveKitRoom,
  VideoTrack,
  isTrackReference,
  registerGlobals,
  useRoomContext,
  useTracks,
  type TrackReferenceOrPlaceholder,
} from "@livekit/react-native";
import { Track } from "livekit-client";
import type { ChatMessage } from "@vera/core";
import type { LiveAvatarMobileSessionReply } from "../lib/api";

registerGlobals();

export interface LiveAvatarRoomProps {
  session: LiveAvatarMobileSessionReply & {
    sessionToken: string;
    sessionId: string;
    livekitUrl: string;
    livekitClientToken: string;
  };
  assistantMessage: ChatMessage | null;
  onVideoReady: () => void;
  onDisconnected: () => void;
  onError: (error: Error) => void;
}

export const startLiveAvatarAudioSession = () => AudioSession.startAudioSession();
export const stopLiveAvatarAudioSession = () => AudioSession.stopAudioSession();

function createEventId() {
  if (typeof globalThis.crypto?.randomUUID === "function") return globalThis.crypto.randomUUID();
  return `vera-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function RemoteAvatarVideo({
  assistantMessage,
  sessionId,
  onVideoReady,
  onError,
}: Pick<LiveAvatarRoomProps, "assistantMessage" | "onVideoReady" | "onError"> & { sessionId: string }) {
  const room = useRoomContext();
  const tracks = useTracks([Track.Source.Camera]);
  const avatarTrack = tracks.find(
    (track: TrackReferenceOrPlaceholder) => isTrackReference(track) && !track.participant.isLocal,
  );
  const lastSentMessageId = useRef<string | null>(null);

  useEffect(() => {
    if (avatarTrack) onVideoReady();
  }, [avatarTrack, onVideoReady]);

  useEffect(() => {
    if (
      !assistantMessage ||
      !avatarTrack ||
      room.state !== "connected" ||
      lastSentMessageId.current === assistantMessage.id
    ) {
      return;
    }

    const message = assistantMessage;
    lastSentMessageId.current = message.id;
    const command = {
      event_id: createEventId(),
      event_type: "avatar.speak_text",
      session_id: sessionId,
      source_event_id: null,
      text: message.text,
    };

    void room.localParticipant
      .publishData(new TextEncoder().encode(JSON.stringify(command)), {
        reliable: true,
        topic: "agent-control",
      })
      .catch((error: unknown) => {
        lastSentMessageId.current = null;
        onError(error instanceof Error ? error : new Error("Could not send text to LiveAvatar."));
      });
  }, [assistantMessage, avatarTrack, onError, room, sessionId]);

  return avatarTrack && isTrackReference(avatarTrack) ? (
    <VideoTrack trackRef={avatarTrack} style={styles.video} objectFit="cover" />
  ) : null;
}

export function LiveAvatarRoom({
  session,
  assistantMessage,
  onVideoReady,
  onDisconnected,
  onError,
}: LiveAvatarRoomProps) {
  return (
    <LiveKitRoom
      serverUrl={session.livekitUrl}
      token={session.livekitClientToken}
      connect
      audio={false}
      video={false}
      options={{ adaptiveStream: { pixelDensity: "screen" } }}
      onDisconnected={onDisconnected}
      onError={onError}
    >
      <RemoteAvatarVideo
        assistantMessage={assistantMessage}
        sessionId={session.sessionId}
        onVideoReady={onVideoReady}
        onError={onError}
      />
    </LiveKitRoom>
  );
}

const styles = StyleSheet.create({
  video: {
    width: "100%",
    height: "100%",
  },
});
