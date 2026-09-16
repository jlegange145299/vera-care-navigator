export type ExperienceView = "member" | "insights";

export type AvatarStatus = "idle" | "listening" | "thinking" | "speaking";

export type JourneyId = "rx-savings" | "care-access" | "prior-auth";

export type ValuePillar = "Affordability" | "Health outcomes" | "Member experience";

export interface ActionFact {
  label: string;
  value: string;
  detail?: string;
}

export interface ActionStep {
  title: string;
  detail: string;
}

export interface ActionPlan {
  id: JourneyId;
  pillar: ValuePillar;
  eyebrow: string;
  title: string;
  summary: string;
  facts: ActionFact[];
  steps: ActionStep[];
  cta: string;
  source: string;
  sourceDetail: string;
  accent: "mint" | "blue" | "violet";
}

export interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
  timestamp: string;
  plan?: ActionPlan;
}

export interface DemoScenario {
  id: JourneyId;
  shortLabel: string;
  prompt: string;
  response: string;
  plan: ActionPlan;
  keywords: string[];
}

export interface DemoReply {
  text: string;
  plan?: ActionPlan;
  intent: JourneyId | "safety" | "general";
}
