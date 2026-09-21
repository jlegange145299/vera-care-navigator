import { Moon, PersonStanding, Sparkles, Timer } from "lucide-react";
import { memberWellnessSnapshot } from "../data/demoData";

export function WellnessPulse() {
  return (
    <aside className="wellness-pulse" aria-label="Synthetic 7-day activity summary">
      <header>
        <Sparkles size={14} />
        <div>
          <strong>Your last 7 days</strong>
          <p>Weekly summaries only • synthetic demo data</p>
        </div>
      </header>
      <dl>
        <div>
          <dt><PersonStanding size={14} /> Steps / day</dt>
          <dd>{memberWellnessSnapshot.steps7d.toLocaleString()}</dd>
        </div>
        <div>
          <dt><Timer size={14} /> Active minutes</dt>
          <dd>{memberWellnessSnapshot.activeMinutes}</dd>
        </div>
        <div>
          <dt><Moon size={14} /> Sleep hours</dt>
          <dd>{memberWellnessSnapshot.sleepHours}</dd>
        </div>
      </dl>
      <p className="wellness-pulse__habit">Habit to try: 12-minute walk after dinner on the five sedentary evenings.</p>
    </aside>
  );
}
