import { useEffect, useState } from "react";
import portraitSrc from "../assets/vera-portrait.jpg";
import type { AvatarStatus } from "../types";

const BLINK_CLOSED_MS = 150;
const BLINK_GAP_MIN_MS = 3200;
const BLINK_GAP_MAX_MS = 7000;

interface VeraPortraitProps {
  status: AvatarStatus;
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

/**
 * Credential-free fallback guide: one synthetic still portrait with a jaw layer,
 * mouth cavity, and eyelid layer composited on top so Vera can speak and blink
 * without a provider session. Landmark offsets live in styles.css as custom
 * properties because they are measured against this specific image.
 */
export function VeraPortrait({ status }: VeraPortraitProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const [isBlinking, setIsBlinking] = useState(false);

  useEffect(() => {
    if (!isLoaded || prefersReducedMotion()) return;

    let closeTimer = 0;
    let openTimer = 0;

    const scheduleBlink = () => {
      const gap = BLINK_GAP_MIN_MS + Math.random() * (BLINK_GAP_MAX_MS - BLINK_GAP_MIN_MS);
      closeTimer = window.setTimeout(() => {
        setIsBlinking(true);
        openTimer = window.setTimeout(() => {
          setIsBlinking(false);
          scheduleBlink();
        }, BLINK_CLOSED_MS);
      }, gap);
    };

    scheduleBlink();

    return () => {
      window.clearTimeout(closeTimer);
      window.clearTimeout(openTimer);
    };
  }, [isLoaded]);

  // A blink on every turn boundary reads as Vera reacting to the member.
  useEffect(() => {
    if (status === "idle" || !isLoaded || prefersReducedMotion()) return;

    setIsBlinking(true);
    const openTimer = window.setTimeout(() => setIsBlinking(false), BLINK_CLOSED_MS);

    return () => window.clearTimeout(openTimer);
  }, [status, isLoaded]);

  return (
    <div className={`vera-photo${isBlinking ? " vera-photo--blinking" : ""}`}>
      {/* Stays mounted underneath so a slow or failed image never leaves an empty stage. */}
      <div className="vera-photo__placeholder">V</div>

      {!hasFailed && (
        <div className={`vera-photo__stage${isLoaded ? " vera-photo__stage--ready" : ""}`}>
          <img
            className="vera-photo__layer vera-photo__base"
            src={portraitSrc}
            alt=""
            draggable={false}
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasFailed(true)}
          />
          <span className="vera-photo__mouth" />
          <img className="vera-photo__layer vera-photo__jaw" src={portraitSrc} alt="" draggable={false} />
          <img className="vera-photo__layer vera-photo__lid vera-photo__lid--left" src={portraitSrc} alt="" draggable={false} />
          <img className="vera-photo__layer vera-photo__lid vera-photo__lid--right" src={portraitSrc} alt="" draggable={false} />
        </div>
      )}

      <span className="vera-photo__vignette" />
    </div>
  );
}
