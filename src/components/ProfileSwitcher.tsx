import { Check, ChevronDown, MapPin, Users, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { memberProfiles } from "../data/memberProfiles";
import type { MemberProfile } from "../types";

interface ProfileSwitcherProps {
  profile: MemberProfile;
  onSelect: (profile: MemberProfile) => void;
}

export function ProfileSwitcher({ profile, onSelect }: ProfileSwitcherProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent && event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event instanceof MouseEvent && !rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div className="profile-switcher" ref={rootRef}>
      <button
        className="profile-button"
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label={`Current member ${profile.fullName}. Switch member profile`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <img src={profile.portraitSrc} alt="" />
        <span className="profile-button__copy">
          <strong>{profile.firstName}</strong>
          <small>{profile.age} · {profile.city}</small>
        </span>
        <ChevronDown size={14} />
      </button>

      {open && (
        <div className="profile-menu" role="menu" aria-label="Illustrative member profiles">
          <header>
            <span><Users size={16} /></span>
            <div>
              <strong>Choose a member</strong>
              <small>See Vera adapt to each profile</small>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close member profiles">
              <X size={16} />
            </button>
          </header>
          <div className="profile-menu__list">
            {memberProfiles.map((candidate) => (
              <button
                className={candidate.id === profile.id ? "profile-option profile-option--active" : "profile-option"}
                type="button"
                role="menuitem"
                key={candidate.id}
                onClick={() => {
                  onSelect(candidate);
                  setOpen(false);
                }}
              >
                <img src={candidate.portraitSrc} alt="" />
                <span>
                  <strong>{candidate.fullName}</strong>
                  <small>{candidate.age} · {candidate.genderLabel}</small>
                  <em><MapPin size={11} /> {candidate.city}, {candidate.country}</em>
                </span>
                {candidate.id === profile.id && <Check size={16} />}
              </button>
            ))}
          </div>
          <p>All profiles and portraits are synthetic demonstration personas.</p>
        </div>
      )}
    </div>
  );
}
