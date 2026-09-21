import { LoaderCircle, Mic, MicOff, Radio, Sparkles, Video, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { requestLiveAvatarEmbed } from "../lib/api";
import type { AvatarStatus, MemberProfile } from "../types";
import { VeraPortrait } from "./VeraPortrait";

interface AvatarStageProps {
  status: AvatarStatus;
  profile: MemberProfile;
  isListening: boolean;
  voiceSupported: boolean;
  interimTranscript: string;
  onToggleListening: () => void;
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
};

export function AvatarStage({
  status,
  profile,
  isListening,
  voiceSupported,
  interimTranscript,
  onToggleListening,
}: AvatarStageProps) {
  const copy = statusCopy[status];
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [avatarNotice, setAvatarNotice] = useState<string | null>(null);
  const [isLaunching, setIsLaunching] = useState(false);
  const requestRef = useRef<AbortController | null>(null);

  useEffect(
    () => () => {
      requestRef.current?.abort();
    },
    [],
  );

  const launchLiveAvatar = async () => {
    if (isLaunching) return;
    const controller = new AbortController();
    requestRef.current = controller;
    setIsLaunching(true);
    setAvatarNotice(null);

    try {
      const embed = await requestLiveAvatarEmbed(controller.signal);
      if (embed.available && embed.url) {
        setEmbedUrl(embed.url);
      } else {
        setAvatarNotice(avatarErrorCopy[embed.reason ?? "provider_unavailable"]);
      }
    } catch {
      if (!controller.signal.aborted) setAvatarNotice(avatarErrorCopy.provider_unavailable);
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setIsLaunching(false);
      }
    }
  };

  const closeLiveAvatar = () => {
    setEmbedUrl(null);
    setAvatarNotice(null);
  };

  return (
    <section className={`avatar-stage avatar-stage--${status}`} aria-label={profile.avatarLabel}>
      <div className="avatar-stage__glow avatar-stage__glow--one" aria-hidden="true" />
      <div className="avatar-stage__glow avatar-stage__glow--two" aria-hidden="true" />
      <div className="avatar-stage__topline">
        <span className="live-pill"><Radio size={13} /> Matched guide for {profile.firstName}</span>
        <button
          className="avatar-stage__mode"
          type="button"
          onClick={embedUrl ? closeLiveAvatar : launchLiveAvatar}
          disabled={isLaunching}
          title="Starts a LiveAvatar session only when explicitly selected"
        >
          {isLaunching ? <LoaderCircle className="spin" size={13} /> : embedUrl ? <X size={13} /> : <Video size={13} />}
          {embedUrl ? "Close LiveAvatar" : "Try LiveAvatar"}
        </button>
      </div>

      {embedUrl ? (
        <div className="liveavatar-frame">
          <iframe
            src={embedUrl}
            title="LiveAvatar session with Vera"
            allow="microphone; camera; autoplay; clipboard-write"
            referrerPolicy="no-referrer"
          />
          <div className="liveavatar-frame__label"><span className="status-dot" /> LiveAvatar session</div>
        </div>
      ) : (
        <>
          <div className="avatar-visual" aria-hidden="true">
            <div className="avatar-orbit avatar-orbit--one" />
            <div className="avatar-orbit avatar-orbit--two" />
            <div className="avatar-portrait">
              <VeraPortrait status={status} profile={profile} />
            </div>
            <div className="avatar-spark avatar-spark--one"><Sparkles size={16} /></div>
            <div className="avatar-spark avatar-spark--two"><Sparkles size={12} /></div>
          </div>

          <div className="avatar-caption" aria-live="polite">
            <div className="avatar-caption__status"><span className="status-dot" /><strong>{copy.label}</strong><div className="voice-wave" aria-hidden="true"><i /><i /><i /><i /><i /></div></div>
            <p>{interimTranscript ? `“${interimTranscript}”` : copy.detail}</p>
          </div>

          {avatarNotice && <div className="avatar-notice" role="status">{avatarNotice}</div>}
          <button className={`voice-orb ${isListening ? "voice-orb--active" : ""}`} type="button" onClick={onToggleListening} disabled={!voiceSupported} aria-pressed={isListening} aria-label={isListening ? "Stop listening" : "Talk to Vera"}>{isListening ? <MicOff size={24} /> : <Mic size={24} />}</button>
          <span className="voice-orb__label">{voiceSupported ? (isListening ? "Tap to stop" : "Tap to talk") : "Voice needs Chrome or Edge"}</span>
        </>
      )}
    </section>
  );
}
