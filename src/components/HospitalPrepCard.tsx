import { useState } from "react";
import { ArrowRight, Building2, Check, CheckCircle2, Clock3, MapPin, Navigation, ShieldCheck } from "lucide-react";
import type { ActionCompletion, ActionPlan, LocationMethod } from "../types";

interface HospitalPrepCardProps {
  plan: ActionPlan;
  completed: boolean;
  onComplete: (plan: ActionPlan, extras?: ActionCompletion) => void;
}

export function HospitalPrepCard({ plan, completed, onComplete }: HospitalPrepCardProps) {
  const recommendedId = plan.facilities?.find((facility) => facility.recommended)?.id ?? plan.facilities?.[0]?.id;
  const [facilityId, setFacilityId] = useState(recommendedId ?? "");
  const [locationMethod, setLocationMethod] = useState<LocationMethod>("ip");
  const [gpsNote, setGpsNote] = useState<string | null>(null);

  const selected = plan.facilities?.find((facility) => facility.id === facilityId);
  const location = plan.location;

  const useGps = () => {
    if (completed) return;
    if (!navigator.geolocation) {
      setGpsNote("Phone location is not available here. Vera is staying with the network estimate.");
      setLocationMethod("ip");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        setLocationMethod("gps");
        setGpsNote("Phone location refined the Bloomfield, CT area. Coordinates are not stored or sent.");
      },
      () => {
        setLocationMethod("ip");
        setGpsNote("Phone location was declined. Vera is using the network estimate only.");
      },
      { enableHighAccuracy: false, timeout: 8_000, maximumAge: 60_000 },
    );
  };

  return (
    <article className="action-card action-card--teal hospital-card" aria-label={plan.title}>
      <div className="action-card__header">
        <div>
          <span className="action-card__pillar">{plan.pillar}</span>
          <p className="action-card__eyebrow">{plan.eyebrow}</p>
          <h3>{plan.title}</h3>
          <p className="action-card__summary">{plan.summary}</p>
        </div>
        <span className="confidence-badge"><ShieldCheck size={15} /> In-network match</span>
      </div>

      <div className="hospital-location">
        <MapPin size={16} />
        <div>
          <strong>
            {location?.city}, {location?.region}
          </strong>
          <small>{locationMethod === "gps" ? location?.gpsLabel : location?.ipLabel}</small>
          {gpsNote && <small>{gpsNote}</small>}
        </div>
        <button type="button" onClick={useGps} disabled={completed || locationMethod === "gps"}>
          <Navigation size={14} /> {locationMethod === "gps" ? "GPS used" : "Use phone GPS"}
        </button>
      </div>

      <div className="hospital-facilities" role="radiogroup" aria-label="Hospital options">
        {plan.facilities?.map((facility) => {
          const selectedFacility = facility.id === facilityId;
          return (
            <button
              key={facility.id}
              className={`hospital-facility${selectedFacility ? " hospital-facility--selected" : ""}${facility.recommended ? " hospital-facility--best" : ""}`}
              type="button"
              role="radio"
              aria-checked={selectedFacility}
              onClick={() => !completed && setFacilityId(facility.id)}
              disabled={completed}
            >
              <span className="hospital-facility__icon"><Building2 size={16} /></span>
              <span className="hospital-facility__copy">
                <strong>{facility.name}</strong>
                <small>
                  {facility.drive} · {facility.distance} · {facility.campus}
                </small>
                <em>{facility.recommended ? facility.whyBest : facility.attractiveness}</em>
              </span>
              {facility.recommended && <span className="hospital-facility__tag">Best fit</span>}
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="action-facts">
          <div className="action-fact">
            <span>Check-in</span>
            <strong>{selected.checkIn}</strong>
            <small>With packet already sent</small>
          </div>
          <div className="action-fact">
            <span>Visit span</span>
            <strong>{selected.visitSpan}</strong>
            <small>Check-in through discharge</small>
          </div>
          <div className="action-fact">
            <span>Full recovery</span>
            <strong>{selected.recovery}</strong>
            <small>Range, not a diagnosis</small>
          </div>
        </div>
      )}

      {plan.timeline && (
        <ol className="hospital-timeline" aria-label="Check-in to recovery">
          {plan.timeline.map((stage) => (
            <li key={stage.label}>
              <Clock3 size={13} />
              <div>
                <strong>{stage.label}</strong>
                <span>{stage.duration}</span>
                <small>{stage.detail}</small>
              </div>
            </li>
          ))}
        </ol>
      )}

      {plan.checklist && (
        <div className="hospital-checklist">
          <p>Bring these</p>
          <ul>
            {plan.checklist.map((item) => (
              <li key={item}>
                <Check size={12} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="action-card__footer">
        <div className="source-note">
          <ShieldCheck size={15} />
          <span>
            <strong>{plan.source}</strong>
            <small>{plan.sourceDetail}</small>
          </span>
        </div>
        <button
          className={`action-button ${completed ? "action-button--complete" : ""}`}
          type="button"
          onClick={() => onComplete(plan, { facilityId, locationMethod })}
          disabled={completed || !facilityId}
        >
          {completed ? (
            <>
              <CheckCircle2 size={17} /> Packet queued
            </>
          ) : (
            <>
              {plan.cta}
              <ArrowRight size={17} />
            </>
          )}
        </button>
      </div>
    </article>
  );
}
