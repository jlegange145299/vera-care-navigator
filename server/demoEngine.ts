export type PlanId = "rx-savings" | "care-access" | "prior-auth";
export type Intent = PlanId | "safety" | "human-support" | "general";
export type ReplyMode = "demo" | "openai" | "demo-fallback";

export interface VeraReply {
  text: string;
  intent: Intent;
  planId?: PlanId;
  mode: ReplyMode;
}

interface DemoScenario {
  intent: PlanId;
  keywords: string[];
  text: string;
}

const scenarios: DemoScenario[] = [
  {
    intent: "rx-savings",
    keywords: ["medication", "prescription", "asthma", "pharmacy", "drug", "cost", "refill", "home delivery"],
    text: "Yes. I compared the options covered by your plan, your current pharmacy pattern, and your preference for fewer errands. A 90-day home-delivery fill is the best fit: the medication stays the same, and your estimated annual out-of-pocket cost drops by $312.",
  },
  {
    intent: "care-access",
    keywords: ["therapist", "therapy", "mental", "behavioral", "counselor", "anxiety", "appointment", "provider"],
    text: "I found two in-network virtual therapists who match your evening preference and have appointments this week. Your plan does not require a referral, and your estimated copay is $20. The earliest option is tomorrow at 6:30 PM.",
  },
  {
    intent: "prior-auth",
    keywords: ["mri", "prior authorization", "prior auth", "approval", "authorization", "scan", "status", "clinical notes"],
    text: "Your MRI request is still open—not denied. The imaging center submitted it on September 12, and the review team needs the clinical notes from your ordering provider. I can send the provider a precise reminder now and keep you updated, so you do not have to coordinate both sides.",
  },
];

const safetyKeywords = ["chest pain", "cannot breathe", "can't breathe", "suicide", "emergency", "overdose", "severe bleeding"];
const humanSupportKeywords = ["human", "care advocate", "representative", "customer service", "call me", "agent"];

export function getDeterministicReply(input: string, mode: ReplyMode = "demo"): VeraReply {
  const normalizedInput = input.toLowerCase();

  if (safetyKeywords.some((keyword) => normalizedInput.includes(keyword))) {
    return {
      mode,
      intent: "safety",
      text: "This may need immediate help. Vera is not an emergency service. If you are in the United States, call 911 now for a medical emergency. If you may hurt yourself, call or text 988. I can stay on screen while you make the call.",
    };
  }

  if (humanSupportKeywords.some((keyword) => normalizedInput.includes(keyword))) {
    return {
      mode,
      intent: "human-support",
      text: "Of course. I can arrange a warm handoff to a care advocate and carry forward the context you approve, so you do not have to start over. In this demo, the handoff is simulated; no real call or case is created.",
    };
  }

  const scenario = scenarios.find(({ keywords }) =>
    keywords.some((keyword) => normalizedInput.includes(keyword)),
  );

  if (scenario) {
    return {
      mode,
      intent: scenario.intent,
      planId: scenario.intent,
      text: scenario.text,
    };
  }

  return {
    mode,
    intent: "general",
    text: "I can help with that. For this proof of concept, try asking me to lower a prescription cost, find an in-network therapist this week, or check an MRI prior authorization. In a connected experience, I would ground every answer in your plan, care journey, and preferences before offering an action.",
  };
}

export function isSafetyIntent(input: string) {
  const normalizedInput = input.toLowerCase();
  return safetyKeywords.some((keyword) => normalizedInput.includes(keyword));
}
