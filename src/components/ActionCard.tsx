import { ArrowRight, Check, CheckCircle2, Database, ShieldCheck } from "lucide-react";
import type { ActionPlan } from "../types";

interface ActionCardProps {
  plan: ActionPlan;
  completed: boolean;
  onComplete: (plan: ActionPlan) => void;
}

export function ActionCard({ plan, completed, onComplete }: ActionCardProps) {
  return (
    <article className={`action-card action-card--${plan.accent}`} aria-label={plan.title}>
      <div className="action-card__header">
        <div>
          <span className="action-card__pillar">{plan.pillar}</span>
          <p className="action-card__eyebrow">{plan.eyebrow}</p>
          <h3>{plan.title}</h3>
          <p className="action-card__summary">{plan.summary}</p>
        </div>
        <span className="confidence-badge"><ShieldCheck size={15} /> Plan verified</span>
      </div>

      <div className="action-facts">
        {plan.facts.map((fact) => (
          <div className="action-fact" key={fact.label}>
            <span>{fact.label}</span>
            <strong>{fact.value}</strong>
            {fact.detail && <small>{fact.detail}</small>}
          </div>
        ))}
      </div>

      <details className="action-details">
        <summary>See how this works</summary>
        <ol>
          {plan.steps.map((step) => (
            <li key={step.title}>
              <span className="step-check"><Check size={12} /></span>
              <div><strong>{step.title}</strong><small>{step.detail}</small></div>
            </li>
          ))}
        </ol>
      </details>

      <div className="action-card__footer">
        <div className="source-note">
          <Database size={15} />
          <span><strong>{plan.source}</strong><small>{plan.sourceDetail}</small></span>
        </div>
        <button
          className={`action-button ${completed ? "action-button--complete" : ""}`}
          type="button"
          onClick={() => onComplete(plan)}
          disabled={completed}
        >
          {completed ? <><CheckCircle2 size={17} /> Started</> : <>{plan.cta}<ArrowRight size={17} /></>}
        </button>
      </div>
    </article>
  );
}
