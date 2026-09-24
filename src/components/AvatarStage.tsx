import { LoaderCircle, Radio, Video, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LiveAvatarSession, SessionEvent } from "@heygen/liveavatar-web-sdk";
import { requestLiveAvatarSession } from "../lib/api";
import {
  LIVEAVATAR_CONNECT_TIMEOUT_MS,
  liveAvatarFailureMessage,
  withTimeout,
} from "../lib/liveAvatarConnect";
import type { AvatarStatus, MemberProfile } from "../types";
import { VeraPortrait } from "./VeraPortrait";

interface AvatarStageProps {
  status: AvatarStatus;
  profile: MemberProfile;
  isListening: boolean;
  voiceSupported: boolean;
  interimTranscript: string;
  onToggleListening: () => void;
  compact?: boolean;
  featured?: boolean;
  onPromptReady?: (sendPrompt: ((text: string) => void) | null) => void;
}

const statusCopy: Record<AvatarStatus, { label: string; detail: string }> = {
  idle: { label: "Ready when you are", detail: "Ask naturally—Vera keeps the context." },
  listening: { label: "I’m listening", detail: "Speak in your own words." },
  thinking: { label: "Connecting the dots", detail: "Checking benefits, care, and preferences." },
  speaking: { label: "Vera is speaking", detail: "You can interrupt at any time." },
};

const avatarErrorCopy = {
  not_configured: "LiveAvatar is ready to connect when a server key is added. The interactive demo avatar remains active.",
  provider_unavailable: "LiveAvatar is temporarily unavailable. The interactive demo avatar remains active.",
  invalid_provider_response: "LiveAvatar returned an unexpected session. The safe demo avatar remains active.",
  connection_failed:
    "LiveAvatar could not open a real-time video link (firewall, VPN, or network policy). The demo avatar remains active—try another network or disable VPN.",
};

export function AvatarStage({
  status,
  profile,
  isListening: _isListening,
  voiceSupported: _voiceSupported,
  interimTranscript,
  onToggleListening: _onToggleListening,
  compact = false,
  featured = false,
  onPromptReady,
}: AvatarStageProps) {
  const copy = statusCopy[status];
  const [session, setSession] = useState<LiveAvatarSession | null>(null);
  const [avatarNotice, setAvatarNotice] = useState<string | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const requestRef = useRef<AbortController | null>(null);
  const sessionRef = useRef<LiveAvatarSession | null>(null);
  const pendingSessionRef = useRef<LiveAvatarSession | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(
    () => () => {
      requestRef.current?.abort();
      pendingSessionRef.current?.stop().catch(() => undefined);
      pendingSessionRef.current = null;
      sessionRef.current?.stop();
      onPromptReady?.(null);
    },
    [onPromptReady],
  );

  const resetLaunchState = (controller: AbortController) => {
    if (requestRef.current === controller) {
      requestRef.current = null;
      setIsLaunching(false);
    }
    pendingSessionRef.current = null;
  };

  const cancelLaunch = () => {
    requestRef.current?.abort();
    const pending = pendingSessionRef.current;
    pendingSessionRef.current = null;
    void pending?.stop();
    setIsLaunching(false);
    setAvatarNotice(null);
  };

  const launchLiveAvatar = async () => {
    if (isLaunching) {
      cancelLaunch();
      return;
    }

    const controller = new AbortController();
    requestRef.current = controller;
    setIsLaunching(true);
    setAvatarNotice(null);

    let nextSession: LiveAvatarSession | null = null;

    try {
      const liveAvatar = await requestLiveAvatarSession(controller.signal);
      if (controller.signal.aborted) return;

      if (liveAvatar.available && liveAvatar.sessionToken) {
        nextSession = new LiveAvatarSession(liveAvatar.sessionToken, {
          autoKeepAlive: true,
          voiceChat: { defaultMuted: true },
        });
        pendingSessionRef.current = nextSession;

        nextSession.on(SessionEvent.SESSION_STREAM_READY, () => {
          if (videoRef.current) nextSession?.attach(videoRef.current);
        });

        await withTimeout(
          nextSession.start(),
          LIVEAVATAR_CONNECT_TIMEOUT_MS,
          "LiveAvatar connection timed out while joining the video room.",
        );

        if (videoRef.current) nextSession.attach(videoRef.current);

        if (controller.signal.aborted) {
          void nextSession.stop();
          return;
        }

        pendingSessionRef.current = null;
        sessionRef.current = nextSession;
        setSession(nextSession);
        onPromptReady?.((text) => nextSession!.message(text));
      } else {
        setAvatarNotice(avatarErrorCopy[liveAvatar.reason ?? "provider_unavailable"]);
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      console.warn("LiveAvatar session failed to start.", error);
      void nextSession?.stop();
      const reason = liveAvatarFailureMessage(error);
      setAvatarNotice(avatarErrorCopy[reason]);
    } finally {
      resetLaunchState(controller);
    }
  };

  const closeLiveAvatar = () => {
    sessionRef.current?.stop();
    sessionRef.current = null;
    setSession(null);
    onPromptReady?.(null);
    setAvatarNotice(null);
  };

  const liveAvatarButtonLabel = session ? "Close LiveAvatar" : isLaunching ? "Cancel" : "Try LiveAvatar";

  const avatarStage = (
    <section
      className={`avatar-stage avatar-stage--${status}${compact ? " avatar-stage--header" : ""}${featured ? " avatar-stage--featured" : ""}`}
      aria-label={profile.avatarLabel}
    >
      <div className="avatar-stage__glow avatar-stage__glow--one" aria-hidden="true" />
      <div className="avatar-stage__glow avatar-stage__glow--two" aria-hidden="true" />
      <div className="avatar-stage__topline">
        <span className="live-pill"><Radio size={13} /> Matched guide for {profile.firstName}</span>
        {!compact && !featured && <button
          className="avatar-stage__mode"
          type="button"
          onClick={session ? closeLiveAvatar : launchLiveAvatar}
          disabled={false}
          title="Starts a LiveAvatar session only when explicitly selected"
        >
          {isLaunching ? <LoaderCircle className="spin" size={13} /> : session ? <X size={13} /> : <Video size={13} />}
          {liveAvatarButtonLabel}
        </button>}
        {featured && (
          <button
            className="avatar-stage__mode avatar-stage__mode--featured"
            type="button"
            onClick={session ? closeLiveAvatar : launchLiveAvatar}
            disabled={false}
            title="Starts a LiveAvatar session only when explicitly selected"
          >
            {isLaunching ? <LoaderCircle className="spin" size={13} /> : session ? <X size={13} /> : <Video size={13} />}
            {liveAvatarButtonLabel}
          </button>
        )}
      </div>

      {session || isLaunching ? (
        <div className="liveavatar-frame">
          {isLaunching && !session && (
            <span className="liveavatar-frame__label" role="status">
              <LoaderCircle className="spin" size={13} /> Connecting…
            </span>
          )}
          <video ref={videoRef} autoPlay playsInline muted aria-label="LiveAvatar session with Vera" />
        </div>
      ) : (
        <>
          <div className="avatar-visual" aria-hidden="true">
            <div className="avatar-portrait">
              <VeraPortrait status={status} profile={profile} />
            </div>
          </div>

          <div className="avatar-caption" aria-live="polite">
            <div className="avatar-caption__status"><span className="status-dot" /><strong>{copy.label}</strong><div className="voice-wave" aria-hidden="true"><i /><i /><i /><i /><i /></div></div>
            <p>{interimTranscript ? `“${interimTranscript}”` : copy.detail}</p>
          </div>

          {avatarNotice && <div className="avatar-notice" role="status">{avatarNotice}</div>}
          {isLaunching && !session && !avatarNotice && (
            <div className="avatar-notice avatar-notice--connecting" role="status">
              Connecting to LiveAvatar… Real-time video can take up to 30 seconds. Tap Cancel to stop.
            </div>
          )}
        </>
      )}
    </section>
  );

  if (compact) {
    return (
      <div className="header-avatar-slot">
        {avatarStage}
        <button
          className="header-liveavatar-button"
          type="button"
          onClick={session ? closeLiveAvatar : launchLiveAvatar}
          disabled={false}
          title="Starts a LiveAvatar session only when explicitly selected"
        >
          {isLaunching ? <LoaderCircle className="spin" size={11} /> : session ? <X size={11} /> : <Video size={11} />}
          {liveAvatarButtonLabel}
        </button>
        {avatarNotice && <div className="header-avatar-notice" role="status">{avatarNotice}</div>}
      </div>
    );
  }

  return avatarStage;
}
