import type { ChatMessage, DemoReply, DemoScenario } from "../types";

export const demoScenarios: DemoScenario[] = [
  {
    id: "rx-savings",
    shortLabel: "Lower my medication cost",
    prompt: "Can you help me lower the cost of my asthma medication?",
    keywords: ["medication", "prescription", "asthma", "pharmacy", "drug", "cost", "refill", "home delivery"],
    response:
      "Yes. I compared the options covered by your plan, your current pharmacy pattern, and your preference for fewer errands. A 90-day home-delivery fill is the best fit: the medication stays the same, and your estimated annual out-of-pocket cost drops by $312.",
    plan: {
      id: "rx-savings",
      pillar: "Affordability",
      eyebrow: "Best-fit opportunity",
      title: "Switch to a 90-day home-delivery fill",
      summary: "Same medication, fewer refills, and a lower estimated plan cost.",
      accent: "mint",
      facts: [
        { label: "Estimated savings", value: "$312 / year", detail: "Based on 4 fills" },
        { label: "Your cost", value: "$26", detail: "per 90-day fill" },
        { label: "Convenience", value: "Free delivery", detail: "Tracking included" },
      ],
      steps: [
        { title: "Confirm your delivery address", detail: "No payment change is needed." },
        { title: "Vera requests the 90-day prescription", detail: "Your prescriber remains in control." },
        { title: "Track the first delivery", detail: "Expected in 3–5 business days." },
      ],
      cta: "Start the switch",
      source: "Your 2026 pharmacy benefit",
      sourceDetail: "Synthetic claim and formulary data • refreshed today",
    },
  },
  {
    id: "care-access",
    shortLabel: "Find a therapist this week",
    prompt: "Please help me find an in-network therapist who is available this week.",
    keywords: ["therapist", "therapy", "mental", "behavioral", "counselor", "anxiety", "appointment", "provider"],
    response:
      "I found two in-network virtual therapists who match your evening preference and have appointments this week. Your plan does not require a referral, and your estimated copay is $20. The earliest option is tomorrow at 6:30 PM.",
    plan: {
      id: "care-access",
      pillar: "Health outcomes",
      eyebrow: "Earliest matching care",
      title: "Jordan Kim, LCSW • Tomorrow at 6:30 PM",
      summary: "Virtual visit, in network, with experience in stress and sleep support.",
      accent: "blue",
      facts: [
        { label: "Your estimated cost", value: "$20", detail: "in-network copay" },
        { label: "Availability", value: "Tomorrow", detail: "6:30 PM ET" },
        { label: "Plan rule", value: "No referral", detail: "Direct booking" },
      ],
      steps: [
        { title: "Hold the appointment", detail: "Reserved for 10 minutes while you decide." },
        { title: "Review fit and consent", detail: "See credentials, focus areas, and visit format." },
        { title: "Receive a private visit link", detail: "Calendar and reminder preferences are yours." },
      ],
      cta: "Hold this appointment",
      source: "Provider directory + eligibility",
      sourceDetail: "Synthetic network and availability data • checked just now",
    },
  },
  {
    id: "prior-auth",
    shortLabel: "Check my MRI approval",
    prompt: "What is happening with the prior authorization for my MRI?",
    keywords: ["mri", "prior authorization", "prior auth", "approval", "authorization", "scan", "status", "clinical notes"],
    response:
      "Your MRI request is still open—not denied. The imaging center submitted it on September 12, and the review team needs the clinical notes from your ordering provider. I can send the provider a precise reminder now and keep you updated, so you do not have to coordinate both sides.",
    plan: {
      id: "prior-auth",
      pillar: "Member experience",
      eyebrow: "Action needed • not denied",
      title: "Clinical notes are needed from your provider",
      summary: "Vera can close the communication gap and monitor the request for you.",
      accent: "violet",
      facts: [
        { label: "Current status", value: "In review", detail: "Submitted Sep 12" },
        { label: "Missing item", value: "Clinical notes", detail: "From ordering provider" },
        { label: "Target response", value: "2 business days", detail: "After notes arrive" },
      ],
      steps: [
        { title: "Send a structured reminder", detail: "Includes the exact request and secure submission path." },
        { title: "Confirm receipt", detail: "Vera checks that the review team received the notes." },
        { title: "Notify you of the decision", detail: "No need to call for status updates." },
      ],
      cta: "Send provider reminder",
      source: "Authorization status + case notes",
      sourceDetail: "Synthetic utilization-management data • refreshed 4 minutes ago",
    },
  },
];

export const initialMessages: ChatMessage[] = [
  {
    id: "vera-welcome",
    role: "assistant",
    timestamp: "Now",
    text: "Good morning, Jordan. I’m Vera, your benefits guide. I can explain your coverage, compare cost and access options, and help complete the next step—not just point you to another page. What would make healthcare easier today?",
  },
];

export const actionConfirmations: Record<DemoScenario["id"], string> = {
  "rx-savings":
    "Done—I’ve prepared the switch request for your review. Your prescriber still approves the prescription, and I’ll let you know when the first delivery is ready to track.",
  "care-access":
    "I’m holding tomorrow’s 6:30 PM appointment for 10 minutes. I’ve also surfaced the provider’s credentials and privacy details for you to review before confirming.",
  "prior-auth":
    "The structured reminder is ready and addressed to the ordering provider’s authorization team. I’ll monitor receipt and update you here, so you do not need to call either office.",
};

const safetyKeywords = ["chest pain", "cannot breathe", "can't breathe", "suicide", "emergency", "overdose", "severe bleeding"];

export function getDemoReply(input: string): DemoReply {
  const normalizedInput = input.toLowerCase();

  if (safetyKeywords.some((keyword) => normalizedInput.includes(keyword))) {
    return {
      intent: "safety",
      text:
        "This may need immediate help. Vera is not an emergency service. If you are in the United States, call 911 now for a medical emergency. If you may hurt yourself, call or text 988. I can stay on screen while you make the call.",
    };
  }

  const scenario = demoScenarios.find(({ keywords }) =>
    keywords.some((keyword) => normalizedInput.includes(keyword)),
  );

  if (scenario) {
    return {
      intent: scenario.id,
      text: scenario.response,
      plan: scenario.plan,
    };
  }

  return {
    intent: "general",
    text:
      "I can help with that. For this proof of concept, try asking me to lower a prescription cost, find an in-network therapist this week, or check an MRI prior authorization. In a connected experience, I would ground every answer in your plan, care journey, and preferences before offering an action.",
  };
}

export const opportunitySignals = [
  { label: "Medication affordability", value: 84, amount: "$742K", color: "mint" },
  { label: "Care access delays", value: 68, amount: "$486K", color: "blue" },
  { label: "Authorization friction", value: 57, amount: "$351K", color: "violet" },
  { label: "Billing clarity", value: 41, amount: "$263K", color: "lavender" },
];

export const frictionJourneys = [
  { journey: "Find & access care", stage: "Availability", conversations: "8,420", change: "+14%", severity: "high" },
  { journey: "Understand a bill", stage: "Explanation", conversations: "6,185", change: "+8%", severity: "medium" },
  { journey: "Prior authorization", stage: "Status handoff", conversations: "5,740", change: "−6%", severity: "improving" },
  { journey: "Use pharmacy benefits", stage: "Compare options", conversations: "4,930", change: "+11%", severity: "medium" },
];

export const signalFeed = [
  {
    time: "2 min ago",
    title: "Evening behavioral-care availability is driving drop-off",
    detail: "214 de-identified conversations • Northeast region",
    tag: "Access",
  },
  {
    time: "18 min ago",
    title: "Members confuse ‘in review’ with ‘denied’ in MRI cases",
    detail: "92 conversations • teach-back confidence below target",
    tag: "Clarity",
  },
  {
    time: "41 min ago",
    title: "90-day fill opportunity detected after retail refill questions",
    detail: "$18.4K projected annual member savings",
    tag: "Affordability",
  },
];
