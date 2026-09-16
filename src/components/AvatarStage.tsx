import { LoaderCircle, Mic, MicOff, Radio, Sparkles, Video, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { requestLiveAvatarEmbed } from "../lib/api";
import type { AvatarStatus } from "../types";

interface AvatarStageProps {
  status: AvatarStatus;
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
    <section className={`avatar-stage avatar-stage--${status}`} aria-label="Vera digital guide">
      <div className="avatar-stage__glow avatar-stage__glow--one" aria-hidden="true" />
      <div className="avatar-stage__glow avatar-stage__glow--two" aria-hidden="true" />
      <div className="avatar-stage__topline">
        <span className="live-pill"><Radio size={13} /> Interactive guide</span>
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
              <svg className="vera-avatar" viewBox="0 0 360 410">
                <defs>
                  <linearGradient id="vera-jacket" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1948ff" /><stop offset="1" stopColor="#11106f" /></linearGradient>
                  <linearGradient id="vera-shirt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#44f1c1" /><stop offset="1" stopColor="#13cda0" /></linearGradient>
                  <radialGradient id="vera-skin" cx="48%" cy="35%" r="70%"><stop offset="0" stopColor="#b87555" /><stop offset="1" stopColor="#865039" /></radialGradient>
                  <filter id="soft-shadow" x="-30%" y="-30%" width="160%" height="160%"><feDropShadow dx="0" dy="14" stdDeviation="12" floodColor="#02072c" floodOpacity=".35" /></filter>
                </defs>
                <g filter="url(#soft-shadow)">
                  <path className="avatar-body" d="M45 410c4-89 52-139 135-139s131 50 135 139H45Z" fill="url(#vera-jacket)" />
                  <path d="m126 284 54 72 54-72c-15-9-33-13-54-13s-39 4-54 13Z" fill="url(#vera-shirt)" />
                  <path d="M146 259h68v52c-8 14-19 21-34 21s-26-7-34-21v-52Z" fill="url(#vera-skin)" />
                  <ellipse cx="180" cy="174" rx="88" ry="105" fill="url(#vera-skin)" />
                  <path d="M94 176c-9-74 22-132 86-132 66 0 104 51 89 136-14-37-29-65-56-87-27 29-66 50-119 57v26Z" fill="#201727" />
                  <path d="M100 161c2-77 35-111 85-111 34 0 63 20 77 55-25-29-54-39-86-29-24 8-45 36-76 52v33Z" fill="#302134" opacity=".85" />
                  <path d="M104 149c-17 3-20 25-10 42 5 9 12 13 20 12l-3-53-7-1Zm152 0c17 3 20 25 10 42-5 9-12 13-20 12l3-53 7-1Z" fill="#945a41" />
                  <path d="M134 158c12-8 24-8 36 0M190 158c12-8 24-8 36 0" fill="none" stroke="#3f2725" strokeWidth="5" strokeLinecap="round" />
                  <ellipse cx="153" cy="174" rx="6" ry="7" fill="#17131b" /><ellipse cx="207" cy="174" rx="6" ry="7" fill="#17131b" />
                  <circle cx="155" cy="172" r="1.7" fill="white" /><circle cx="209" cy="172" r="1.7" fill="white" />
                  <path d="M180 178c-5 13-7 25 2 29" fill="none" stroke="#71402f" strokeWidth="4" strokeLinecap="round" />
                  <ellipse className="avatar-mouth" cx="181" cy="226" rx="21" ry="7" fill="#5d2930" />
                  <path d="M164 224c11 8 23 8 34 0" fill="none" stroke="#f5c7b5" strokeWidth="3" strokeLinecap="round" opacity=".85" />
                  <path d="M103 178c2 57 23 95 57 113M257 178c-2 57-23 95-57 113" fill="none" stroke="#211727" strokeWidth="18" strokeLinecap="round" />
                  <circle cx="112" cy="223" r="7" fill="#3ce9bb" /><circle cx="248" cy="223" r="7" fill="#3ce9bb" />
                </g>
              </svg>
              <div className="avatar-spark avatar-spark--one"><Sparkles size={16} /></div>
              <div className="avatar-spark avatar-spark--two"><Sparkles size={12} /></div>
            </div>
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
