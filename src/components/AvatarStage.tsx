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
                  <linearGradient id="vera-jacket" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#315ff7" /><stop offset=".55" stopColor="#173ac7" /><stop offset="1" stopColor="#0b175d" /></linearGradient>
                  <linearGradient id="vera-blouse" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f8ffff" /><stop offset="1" stopColor="#b9f5e6" /></linearGradient>
                  <radialGradient id="vera-skin" cx="42%" cy="28%" r="78%"><stop offset="0" stopColor="#f4c9a9" /><stop offset=".48" stopColor="#d99a74" /><stop offset=".82" stopColor="#bd7657" /><stop offset="1" stopColor="#95523f" /></radialGradient>
                  <linearGradient id="vera-neck" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ad654d" /><stop offset=".45" stopColor="#dc9b75" /><stop offset="1" stopColor="#a85f49" /></linearGradient>
                  <linearGradient id="vera-hair" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#170d0c" /><stop offset=".34" stopColor="#3a1d18" /><stop offset=".68" stopColor="#623424" /><stop offset="1" stopColor="#281411" /></linearGradient>
                  <linearGradient id="vera-hair-shine" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#8b5538" stopOpacity="0" /><stop offset=".48" stopColor="#b9784e" stopOpacity=".58" /><stop offset="1" stopColor="#8b5538" stopOpacity="0" /></linearGradient>
                  <linearGradient id="vera-lip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a9525f" /><stop offset="1" stopColor="#71313e" /></linearGradient>
                  <radialGradient id="vera-iris" cx="38%" cy="32%" r="65%"><stop offset="0" stopColor="#a77a45" /><stop offset=".58" stopColor="#5f4028" /><stop offset="1" stopColor="#241914" /></radialGradient>
                  <filter id="portrait-shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="15" stdDeviation="11" floodColor="#02072c" floodOpacity=".42" /></filter>
                  <filter id="face-softness" x="-15%" y="-15%" width="130%" height="130%">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="1.1" result="blur" />
                    <feSpecularLighting in="blur" surfaceScale="2" specularConstant=".22" specularExponent="18" lightingColor="#fff3e7" result="light"><feDistantLight azimuth="225" elevation="52" /></feSpecularLighting>
                    <feComposite in="light" in2="SourceAlpha" operator="in" result="lit" /><feBlend in="SourceGraphic" in2="lit" mode="soft-light" />
                  </filter>
                </defs>
                <g filter="url(#portrait-shadow)">
                  <path d="M91 272C88 196 92 113 126 73c27-32 83-39 116-6 39 39 35 130 28 213-42 29-134 31-179-8Z" fill="url(#vera-hair)" />
                  <path className="avatar-body" d="M34 410c5-83 54-132 146-132 91 0 140 49 146 132H34Z" fill="url(#vera-jacket)" />
                  <path d="M113 298 151 282l29 57 29-57 39 16-14 112H126l-13-112Z" fill="url(#vera-blouse)" />
                  <path d="m113 298 40-18 27 59-48-29-16 46-18-36 15-22Zm134 0-40-18-27 59 48-29 16 46 18-36-15-22Z" fill="#0f2f9b" opacity=".96" />
                  <path d="M147 247h66v54c-6 21-18 31-33 31s-27-10-33-31v-54Z" fill="url(#vera-neck)" />
                  <path d="M148 275c19 11 45 11 64-1-4 21-15 33-32 33-16 0-27-11-32-32Z" fill="#985540" opacity=".32" />
                  <ellipse cx="114" cy="174" rx="18" ry="29" fill="#c98564" /><ellipse cx="246" cy="174" rx="18" ry="29" fill="#bd7659" />
                  <path d="M180 70c-42-1-69 29-68 87 1 43 6 76 26 99 13 15 28 24 42 24s30-9 43-24c20-23 25-56 26-99 1-58-27-88-69-87Z" fill="url(#vera-skin)" filter="url(#face-softness)" />
                  <path d="M120 158c3 55 12 86 35 106-17-6-31-22-39-45-7-20-8-42-7-62l11 1Z" fill="#8d4839" opacity=".2" />
                  <path d="M205 83c25 14 38 42 38 79 0 47-11 80-34 101 30-16 41-54 40-106-1-39-14-64-44-74Z" fill="#7f3d31" opacity=".14" />
                  <ellipse cx="150" cy="208" rx="24" ry="12" fill="#d87f73" opacity=".16" /><ellipse cx="212" cy="208" rx="24" ry="12" fill="#d87f73" opacity=".14" />
                  <path d="M108 158c-7-54 10-101 54-115 40-13 84 6 101 47 8 19 7 45 1 69-8-31-25-56-51-78-25 27-58 48-105 61v16Z" fill="url(#vera-hair)" />
                  <path d="M111 142c16-49 48-78 91-82-31 12-50 34-61 63-8 8-18 14-30 19Z" fill="#70402c" opacity=".62" />
                  <path d="M156 53c29-13 65-4 85 19-33-16-61-12-84 7-13 11-25 25-40 35 8-30 20-50 39-61Z" fill="url(#vera-hair-shine)" opacity=".76" />
                  <path d="M135 157c10-8 23-9 34-2M192 155c12-7 25-6 35 2" fill="none" stroke="#5e3329" strokeWidth="5.5" strokeLinecap="round" />
                  <path d="M135 169c9-10 24-11 35-1-9 11-25 12-35 1ZM190 168c11-10 26-9 35 1-10 11-26 10-35-1Z" fill="#fffaf5" />
                  <ellipse cx="153" cy="169" rx="7.2" ry="8" fill="url(#vera-iris)" /><ellipse cx="207" cy="169" rx="7.2" ry="8" fill="url(#vera-iris)" />
                  <circle cx="153" cy="170" r="3.6" fill="#15100e" /><circle cx="207" cy="170" r="3.6" fill="#15100e" />
                  <circle cx="150.5" cy="166.5" r="2" fill="white" /><circle cx="204.5" cy="166.5" r="2" fill="white" />
                  <path d="M135 168c10-10 24-11 35-1m20 0c11-10 26-9 35 1" fill="none" stroke="#40231f" strokeWidth="3" strokeLinecap="round" />
                  <path d="M137 165 132 161m8 2-2-5m84 7 5-4m-8 2 2-5" fill="none" stroke="#40231f" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M179 174c-4 13-8 29-5 38 3 5 9 6 15 2" fill="none" stroke="#9b5744" strokeWidth="3" strokeLinecap="round" />
                  <path d="M170 216c6 4 15 4 21-1" fill="none" stroke="#8d493c" strokeWidth="2" strokeLinecap="round" opacity=".72" />
                  <path d="M155 231c7-8 16-9 25-4 9-5 18-4 26 4-15 13-36 13-51 0Z" fill="url(#vera-lip)" />
                  <ellipse className="avatar-mouth" cx="180" cy="232" rx="16" ry="3.8" fill="#4d2029" />
                  <path d="M162 232c12 5 24 5 36 0-7 9-29 10-36 0Z" fill="#d9868f" opacity=".9" /><path d="M165 229c10-3 20-3 30 0-8 4-23 4-30 0Z" fill="#fff7ee" opacity=".82" />
                  <path d="M105 131c-8 48-4 101 17 132 10 15 24 27 41 34l7-17c-32-18-47-48-46-91l-1-53-18-5ZM255 124c11 48 9 101-11 135-10 17-25 30-44 39l-8-18c32-18 47-50 45-94l1-52 17-10Z" fill="url(#vera-hair)" />
                  <path d="M113 147c-3 51 7 94 39 126M248 140c5 50-5 96-38 131" fill="none" stroke="#9b6040" strokeWidth="5" strokeLinecap="round" opacity=".4" />
                  <path d="M101 209c-3 28 3 55 18 76M260 203c2 29-5 57-20 78" fill="none" stroke="#bc7950" strokeWidth="2.5" strokeLinecap="round" opacity=".3" />
                  <circle cx="115" cy="212" r="6" fill="#d8fff5" /><circle cx="245" cy="212" r="6" fill="#d8fff5" /><circle cx="115" cy="212" r="3.5" fill="#3ce9bb" /><circle cx="245" cy="212" r="3.5" fill="#3ce9bb" />
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
