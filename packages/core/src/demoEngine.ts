import { getFactCheck, getFactCheckReplyText } from "./factCheck.js";
import type { FactCheckResult } from "./types.js";

export type PlanId = "rx-savings" | "care-access" | "prior-auth" | "wellness-connect" | "hospital-prereg";
export type Intent = PlanId | "safety" | "human-support" | "fact-check" | "general";
export type ReplyMode = "demo" | "openai" | "demo-fallback";

export interface VeraReply {
  text: string;
  intent: Intent;
  planId?: PlanId;
  mode: ReplyMode;
  factCheck?: FactCheckResult;
}

interface DemoScenario {
  intent: PlanId;
  keywords: string[];
  text: string;
}

const scenarios: DemoScenario[] = [
  {
    intent: "hospital-prereg",
    keywords: [
      "hospital",
      "pre-register",
      "preregister",
      "pre-registration",
      "pre registration",
      "nearest hospital",
      "facility",
      "outpatient",
      "procedure",
      "what to bring",
      "check in",
      "check-in",
      "gps",
      "near me",
      "admission",
    ],
    text: "Using an approximate Bloomfield, CT location from this session’s network—not a stored GPS trail—Hartford Hospital Outpatient Pavilion is the best-fit in-network site: 11 minutes away, with the shortest door-to-discharge window. Bring photo ID, your member ID card, a medication list, and a ride home if sedation is used. I can send a pre-registration packet ahead so registration and the unit already have the details. Typical timing today is about 18 minutes to check in, 4.5 hours to discharge, and 5–7 days to full recovery for this synthetic outpatient visit. Two farther hospitals take longer but offer more privacy or on-site navigation if you prefer them.",
  },
  {
    intent: "wellness-connect",
    keywords: [
      "wellness",
      "wearable",
      "fitness",
      "fitbit",
      "garmin",
      "apple health",
      "apple watch",
      "google fit",
      "health connect",
      "steps",
      "sleep",
      "activity tracker",
      "link my phone",
      "link my watch",
    ],
    text: "Yes—and it stays in your control. If you connect your phone or wearable, Vera uses weekly activity summaries only: steps, sleep duration, and active minutes. No GPS trails, no raw heart-rate streams, and nothing is sold. Based on a synthetic last-7-day snapshot, you are averaging 4,280 steps and 5.9 hours of sleep, with five sedentary evenings. I can link devices now and point you to a walk-after-dinner habit plus coaching you already have in the plan.",
  },
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

  const factCheck = getFactCheck(input);
  if (factCheck) {
    return {
      mode,
      intent: "fact-check",
      text: getFactCheckReplyText(factCheck),
      factCheck,
    };
  }

  if (humanSupportKeywords.some((keyword) => normalizedInput.includes(keyword))) {
    return {
      mode,
      intent: "human-support",
      text: "Of course. I can arrange a warm handoff to a care advocate and carry forward the context you approve, so you do not have to start over. In this demo, the handoff is simulated; no real call or case is created.",
    };
  }

  const ranked = scenarios
    .map((scenario) => ({
      scenario,
      score: scenario.keywords.filter((keyword) => normalizedInput.includes(keyword)).length,
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score);

  if (ranked[0]) {
    return {
      mode,
      intent: ranked[0].scenario.intent,
      planId: ranked[0].scenario.intent,
      text: ranked[0].scenario.text,
    };
  }

  return {
    mode,
    intent: "general",
    text: "I can help with that. For this proof of concept, try asking me to find a hospital from your location, link fitness devices, lower a prescription cost, find an in-network therapist this week, check an MRI prior authorization, or fact-check a health statement. In a connected experience, I would ground every answer in your plan, care journey, and preferences before offering an action.",
  };
}

export function isSafetyIntent(input: string) {
  const normalizedInput = input.toLowerCase();
  return safetyKeywords.some((keyword) => normalizedInput.includes(keyword));
}
