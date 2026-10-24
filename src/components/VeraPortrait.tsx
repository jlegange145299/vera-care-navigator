import { useEffect, useState, type CSSProperties } from "react";
import type { AvatarStatus, MemberProfile } from "../types";

const BLINK_CLOSED_MS = 150;

interface VeraPortraitProps {
  status: AvatarStatus;
  profile: MemberProfile;
  speechMouthOpen?: number;
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

function blinkInterval(status: AvatarStatus) {
  if (status === "speaking") return [2200, 4800] as const;
  if (status === "thinking") return [2700, 5700] as const;
  if (status === "listening") return [3000, 6200] as const;
  return [3500, 7600] as const;
}

/**
 * Credential-free fallback guide: one synthetic still portrait with a jaw layer,
 * mouth cavity, and eyelid layer composited on top so Vera can speak and blink
 * without a provider session. Landmark offsets live in styles.css as custom
 * properties because they are measured against this specific image.
 */
export function VeraPortrait({ status, profile, speechMouthOpen = 0.3 }: VeraPortraitProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    setHasFailed(false);
  }, [profile.id]);

  useEffect(() => {
    if (!isLoaded || prefersReducedMotion()) return;

    setIsBlinking(false);
    let closeTimer = 0;
    let openTimer = 0;
    let secondBlinkTimer = 0;

    const scheduleBlink = () => {
      const [minimum, maximum] = blinkInterval(status);
      const gap = minimum + Math.random() * (maximum - minimum);
      closeTimer = window.setTimeout(() => {
        setIsBlinking(true);
        openTimer = window.setTimeout(() => {
          setIsBlinking(false);
          if (Math.random() < 0.14) {
            secondBlinkTimer = window.setTimeout(() => {
              setIsBlinking(true);
              openTimer = window.setTimeout(() => {
                setIsBlinking(false);
                scheduleBlink();
              }, BLINK_CLOSED_MS);
            }, 180 + Math.random() * 100);
          } else {
            scheduleBlink();
          }
        }, BLINK_CLOSED_MS + Math.random() * 55);
      }, gap);
    };

    scheduleBlink();

    return () => {
      window.clearTimeout(closeTimer);
      window.clearTimeout(openTimer);
      window.clearTimeout(secondBlinkTimer);
    };
  }, [isLoaded, status]);

  const portraitStyle: CSSProperties & { "--speech-mouth-open": number } = {
    "--speech-mouth-open": speechMouthOpen,
  };

  return (
    <div
      className={`vera-photo vera-photo--${profile.id}${isBlinking ? " vera-photo--blinking" : ""}`}
      style={portraitStyle}
    >
      {/* Stays mounted underneath so a slow or failed image never leaves an empty stage. */}
      <div className="vera-photo__placeholder">{profile.initials}</div>

      {!hasFailed && (
        <div className={`vera-photo__stage${isLoaded ? " vera-photo__stage--ready" : ""}`}>
          <img
            className="vera-photo__layer vera-photo__base"
            src={profile.portraitSrc}
            alt=""
            draggable={false}
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasFailed(true)}
          />
          <span className="vera-photo__mouth" />
          <img className="vera-photo__layer vera-photo__jaw" src={profile.portraitSrc} alt="" draggable={false} />
          <img className="vera-photo__layer vera-photo__lid vera-photo__lid--left" src={profile.portraitSrc} alt="" draggable={false} />
          <img className="vera-photo__layer vera-photo__lid vera-photo__lid--right" src={profile.portraitSrc} alt="" draggable={false} />
        </div>
      )}

      <span className="vera-photo__vignette" />
    </div>
  );
}
