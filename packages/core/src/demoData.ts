import type {
  ActionCompletion,
  ChatMessage,
  DemoReply,
  DemoScenario,
  HospitalFacility,
  MemberLocation,
  VisitTimelineStage,
  WellnessDevice,
} from "./types.js";
import { getFactCheck, getFactCheckReplyText } from "./factCheck.js";

export const wellnessDevices: WellnessDevice[] = [
  { id: "apple-health", label: "iPhone Health", kind: "phone", detail: "Steps, sleep, and mindful minutes" },
  { id: "google-fit", label: "Android Health Connect", kind: "phone", detail: "Daily movement summaries" },
  { id: "fitbit", label: "Fitbit", kind: "wearable", detail: "Heart-rate zones and rest" },
  { id: "garmin", label: "Garmin", kind: "wearable", detail: "Workouts and recovery time" },
];

export const memberWellnessSnapshot = {
  steps7d: 4280,
  activeMinutes: 18,
  sleepHours: 5.9,
  sedentaryEvenings: 5,
  coachingSessionsLeft: 8,
};

export const portfolioWellness = {
  optInRate: "38%",
  optInChange: "+6.1 pts",
  medianSteps: "6,140",
  sleepRegularity: "71%",
  coachingUse: "24%",
  preventableRisk: "$412K",
  linkedMembers: "41,280",
  cohorts: [
    { label: "Low movement + 2+ chronic Rx", value: "9%", detail: "1.8× ER visits vs. peers", tone: "high" },
    { label: "Sleep under 6 hours, 4+ nights", value: "14%", detail: "Higher next-day missed Rx fills", tone: "medium" },
    { label: "Using included coaching", value: "24%", detail: "Activity up 11% in 30 days", tone: "improving" },
  ],
};

export const memberLocation: MemberLocation = {
  city: "Bloomfield",
  region: "CT",
  ipLabel: "Approximate area from this session’s network",
  gpsLabel: "More precise phone location, mapped to the same area",
};

export const hospitalFacilities: HospitalFacility[] = [
  {
    id: "hartford-outpatient",
    name: "Hartford Hospital Outpatient Pavilion",
    campus: "Hartford, CT",
    drive: "11 min",
    distance: "4.2 mi",
    recommended: true,
    whyBest: "Closest in-network site with a same-morning pre-reg slot and the shortest door-to-discharge window.",
    attractiveness: "Fastest arrival and recovery path",
    checkIn: "About 18 minutes",
    visitSpan: "About 4.5 hours door to discharge",
    recovery: "Typical full recovery 5–7 days",
    copay: "$250 facility copay",
  },
  {
    id: "saint-francis",
    name: "Saint Francis Hospital",
    campus: "Hartford, CT",
    drive: "22 min",
    distance: "8.6 mi",
    whyBest: "Longer drive and check-in, with private recovery rooms and a family lounge.",
    attractiveness: "More private stay; slower today",
    checkIn: "About 35 minutes",
    visitSpan: "About 6 hours door to discharge",
    recovery: "Typical full recovery 5–7 days",
    copay: "$250 facility copay",
  },
  {
    id: "uconn-dempsey",
    name: "UConn John Dempsey Hospital",
    campus: "Farmington, CT",
    drive: "28 min",
    distance: "11.4 mi",
    whyBest: "Teaching-hospital team plus a dedicated arrival navigator. Later arrival window today.",
    attractiveness: "More support on site; longest trip",
    checkIn: "About 42 minutes",
    visitSpan: "About 6.5 hours door to discharge",
    recovery: "Typical full recovery 5–7 days",
    copay: "$250 facility copay",
  },
];

export const hospitalChecklist = [
  "Photo ID and member ID card",
  "Medication and allergy list",
  "Procedure order or visit reason (Vera can attach this)",
  "Emergency contact and a ride home if sedation is used",
  "Completed pre-registration answers (insurance, pharmacy, advance directive status)",
];

export const hospitalTimeline: VisitTimelineStage[] = [
  { label: "Check-in", duration: "18 min", detail: "Registration already has your packet" },
  { label: "Prep & procedure", duration: "90 min", detail: "Synthetic outpatient window" },
  { label: "Same-day recovery", duration: "2–3 hrs", detail: "Until discharge criteria are met" },
  { label: "Full recovery", duration: "5–7 days", detail: "Typical range, not a clinical prediction" },
];

export const demoScenarios: DemoScenario[] = [
  {
    id: "hospital-prereg",
    shortLabel: "Find the right hospital",
    prompt: "I need to go to the hospital for an outpatient procedure. Which facility is best from my location, and can you pre-register me?",
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
    response:
      "Using an approximate Bloomfield, CT location from this session’s network—not a stored GPS trail—Hartford Hospital Outpatient Pavilion is the best-fit in-network site: 11 minutes away, with the shortest door-to-discharge window. Bring photo ID, your member ID card, a medication list, and a ride home if sedation is used. I can send a pre-registration packet ahead so registration and the unit already have the details. Typical timing today is about 18 minutes to check in, 4.5 hours to discharge, and 5–7 days to full recovery for this synthetic outpatient visit. Two farther hospitals take longer but offer more privacy or on-site navigation if you prefer them.",
    plan: {
      id: "hospital-prereg",
      pillar: "Member experience",
      eyebrow: "Location-matched hospital visit",
      title: "Pre-register at the closest ready facility",
      summary: "Vera uses city-level location only, lists what to bring, notifies the hospital, and shows slower options that some members prefer.",
      accent: "teal",
      location: memberLocation,
      facilities: hospitalFacilities,
      checklist: hospitalChecklist,
      timeline: hospitalTimeline,
      facts: [
        { label: "Best-fit drive", value: "11 min", detail: "Hartford Outpatient Pavilion" },
        { label: "Door to discharge", value: "4.5 hrs", detail: "Typical today, not a guarantee" },
        { label: "Full recovery range", value: "5–7 days", detail: "Educational estimate only" },
      ],
      steps: [
        { title: "Confirm location source", detail: "Network estimate by default; optional phone GPS stays on-device." },
        { title: "Send the arrival packet", detail: "Plan ID, visit type, and what you are bringing—simulated, not a live EHR write." },
        { title: "Arrive with less paperwork", detail: "Registration and the unit already have the same story." },
      ],
      cta: "Pre-register and notify the hospital",
      source: "Network directory + city-level location",
      sourceDetail: "Synthetic facilities • IP area by default • coordinates are not stored",
    },
  },
  {
    id: "wellness-connect",
    shortLabel: "Link my fitness devices",
    prompt: "Can I link my phone and wearable so Vera can help with wellness?",
    keywords: ["wellness", "wearable", "fitness", "fitbit", "garmin", "apple health", "apple watch", "google fit", "health connect", "steps", "sleep", "activity tracker", "link my phone", "link my watch"],
    response:
      "Yes—and it stays in your control. If you connect your phone or wearable, Vera uses weekly activity summaries only: steps, sleep duration, and active minutes. No GPS trails, no raw heart-rate streams, and nothing is sold. Based on a synthetic last-7-day snapshot, you are averaging 4,280 steps and 5.9 hours of sleep, with five sedentary evenings. I can link devices now and point you to a walk-after-dinner habit plus coaching you already have in the plan.",
    plan: {
      id: "wellness-connect",
      pillar: "Health outcomes",
      eyebrow: "Opt-in wellness benefit",
      title: "Connect your phone and wearables",
      summary: "Choose which devices share weekly summaries. You can disconnect any time; this demo never leaves the browser.",
      accent: "coral",
      devices: wellnessDevices,
      facts: [
        { label: "What Vera sees", value: "Summaries", detail: "7-day steps, sleep, active minutes" },
        { label: "What Vera never sees", value: "Location", detail: "No GPS, video, or raw biometrics" },
        { label: "Plan benefit waiting", value: "8 sessions", detail: "Digital coaching included" },
      ],
      steps: [
        { title: "Pick phone, wearable, or both", detail: "Each source is optional and labeled." },
        { title: "Confirm the summary-only consent", detail: "Portfolio analytics use de-identified cohorts, never your name." },
        { title: "Get one habit and one benefit to use", detail: "Advice is educational, not a diagnosis or care plan." },
      ],
      cta: "Connect selected devices",
      source: "Wellness benefit + device consent",
      sourceDetail: "Synthetic activity summaries • member-authorized for this demo session",
    },
  },
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
    text: "Good morning, Jordan. I’m Vera, your benefits guide. I can explain your coverage, match a hospital from your location, check a health statement against public sources, and help complete the next step—not just point you to another page. What would make healthcare easier today?",
  },
];

export const actionConfirmations: Record<DemoScenario["id"], string> = {
  "hospital-prereg":
    "Pre-registration is queued for Hartford Hospital Outpatient Pavilion (simulated). Registration and the unit will see your plan ID, visit type, arrival window, and the documents you are bringing. Typical timing remains about 18 minutes to check in, 4.5 hours to discharge, and 5–7 days to full recovery for this synthetic outpatient visit. This is not a live hospital message or medical advice.",
  "wellness-connect":
    "Devices are linked for this demo session. Over the last 7 days you averaged 4,280 steps, 18 active minutes a day, and 5.9 hours of sleep, with five sedentary evenings after 8 PM. Two next steps that use benefits you already have: a 12-minute walk after dinner, and booking 3 of your 8 included digital-coaching sessions this week. This is wellness guidance, not medical advice or a diagnosis.",
  "rx-savings":
    "Done—I’ve prepared the switch request for your review. Your prescriber still approves the prescription, and I’ll let you know when the first delivery is ready to track.",
  "care-access":
    "I’m holding tomorrow’s 6:30 PM appointment for 10 minutes. I’ve also surfaced the provider’s credentials and privacy details for you to review before confirming.",
  "prior-auth":
    "The structured reminder is ready and addressed to the ordering provider’s authorization team. I’ll monitor receipt and update you here, so you do not need to call either office.",
};

export function getActionConfirmation(planId: DemoScenario["id"], extras: ActionCompletion = {}) {
  const base = actionConfirmations[planId];
  if (planId === "hospital-prereg") {
    const facility =
      hospitalFacilities.find((item) => item.id === extras.facilityId) ?? hospitalFacilities[0];
    const locationNote =
      extras.locationMethod === "gps"
        ? "Phone location refined the same Bloomfield, CT area; coordinates were not stored."
        : "Location used the session’s network estimate for Bloomfield, CT.";
    if (!facility) return base;
    return `Pre-registration is queued for ${facility.name} (simulated). ${locationNote} Registration and the unit will see your plan ID, visit type, arrival window, and the documents you are bringing. Typical timing there is ${facility.checkIn} to check in, ${facility.visitSpan.toLowerCase()}, and ${facility.recovery.toLowerCase()}. This is not a live hospital message or medical advice.`;
  }
  if (planId !== "wellness-connect" || !extras.deviceIds?.length) return base;

  const labels = extras.deviceIds
    .map((id) => wellnessDevices.find((device) => device.id === id)?.label)
    .filter((label): label is string => Boolean(label));
  if (labels.length === 0) return base;
  return `${labels.join(" and ")} ${labels.length === 1 ? "is" : "are"} linked for this demo session. ${base.slice(base.indexOf("Over the last 7 days"))}`;
}

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

  const factCheck = getFactCheck(input);
  if (factCheck) {
    return {
      intent: "fact-check",
      text: getFactCheckReplyText(factCheck),
      factCheck,
    };
  }

  const ranked = demoScenarios
    .map((scenario) => ({
      scenario,
      score: scenario.keywords.filter((keyword) => normalizedInput.includes(keyword)).length,
    }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score);

  if (ranked[0]) {
    return {
      intent: ranked[0].scenario.id,
      text: ranked[0].scenario.response,
      plan: ranked[0].scenario.plan,
    };
  }

  return {
    intent: "general",
    text:
      "I can help with that. For this proof of concept, try asking me to find a hospital from your location, link fitness devices, lower a prescription cost, find an in-network therapist this week, check an MRI prior authorization, or fact-check a health statement. In a connected experience, I would ground every answer in your plan, care journey, and preferences before offering an action.",
  };
}

export const opportunitySignals = [
  { label: "Medication affordability", value: 84, amount: "$742K", color: "mint" },
  { label: "Care access delays", value: 68, amount: "$486K", color: "blue" },
  { label: "Hospital arrival friction", value: 59, amount: "$298K", color: "teal" },
  { label: "Preventable wellness risk", value: 62, amount: "$412K", color: "coral" },
  { label: "Authorization friction", value: 57, amount: "$351K", color: "violet" },
  { label: "Billing clarity", value: 41, amount: "$263K", color: "lavender" },
];

export const frictionJourneys = [
  { journey: "Find & access care", stage: "Availability", conversations: "8,420", change: "+14%", severity: "high" },
  { journey: "Hospital arrival", stage: "Pre-registration", conversations: "2,840", change: "+17%", severity: "high" },
  { journey: "Understand a bill", stage: "Explanation", conversations: "6,185", change: "+8%", severity: "medium" },
  { journey: "Prior authorization", stage: "Status handoff", conversations: "5,740", change: "−6%", severity: "improving" },
  { journey: "Use pharmacy benefits", stage: "Compare options", conversations: "4,930", change: "+11%", severity: "medium" },
  { journey: "Activate wellness devices", stage: "Opt-in & consent", conversations: "3,610", change: "+22%", severity: "high" },
];

export const signalFeed = [
  {
    time: "4 min ago",
    title: "Incomplete hospital pre-reg is adding same-day check-in delay",
    detail: "2,840 de-identified arrival conversations • city-level location only",
    tag: "Hospital",
  },
  {
    time: "6 min ago",
    title: "Members who link a wearable complete coaching 2.4× more often",
    detail: "3,610 de-identified opt-ins • summary data only",
    tag: "Wellness",
  },
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
