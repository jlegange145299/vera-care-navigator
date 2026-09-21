export type ExperienceView = "member" | "insights";

export type AvatarStatus = "idle" | "listening" | "thinking" | "speaking";

export type MemberProfileId = "jordan" | "noor" | "josh";

export interface MemberProfile {
  id: MemberProfileId;
  firstName: string;
  fullName: string;
  initials: string;
  age: number;
  genderLabel: string;
  city: string;
  region: string;
  country: string;
  plan: string;
  coverage: string;
  portraitSrc: string;
  avatarLabel: string;
  greeting: string;
}

export type JourneyId = "rx-savings" | "care-access" | "prior-auth" | "wellness-connect" | "hospital-prereg";

export type ValuePillar = "Affordability" | "Health outcomes" | "Member experience";

export type WellnessDeviceId = "apple-health" | "google-fit" | "fitbit" | "garmin";

export interface WellnessDevice {
  id: WellnessDeviceId;
  label: string;
  kind: "phone" | "wearable";
  detail: string;
}

export interface ActionFact {
  label: string;
  value: string;
  detail?: string;
}

export interface ActionStep {
  title: string;
  detail: string;
}

export type LocationMethod = "ip" | "gps";

export interface HospitalFacility {
  id: string;
  name: string;
  campus: string;
  drive: string;
  distance: string;
  recommended?: boolean;
  whyBest: string;
  attractiveness: string;
  checkIn: string;
  visitSpan: string;
  recovery: string;
  copay: string;
}

export interface VisitTimelineStage {
  label: string;
  duration: string;
  detail: string;
}

export interface MemberLocation {
  city: string;
  region: string;
  ipLabel: string;
  gpsLabel: string;
}

export interface ActionCompletion {
  deviceIds?: WellnessDeviceId[];
  facilityId?: string;
  locationMethod?: LocationMethod;
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
  accent: "mint" | "blue" | "violet" | "coral" | "teal";
  devices?: WellnessDevice[];
  facilities?: HospitalFacility[];
  checklist?: string[];
  timeline?: VisitTimelineStage[];
  location?: MemberLocation;
}

export type FactCheckVerdict = "true" | "partly-true" | "false" | "unverified";

export interface FactCheckSource {
  name: string;
  organization: string;
  detail: string;
}

export interface FactCheckResult {
  id: string;
  verdict: FactCheckVerdict;
  claim: string;
  finding: string;
  sources: FactCheckSource[];
}

export interface ChatMessage {
  id: string;
  role: "assistant" | "user";
  text: string;
  timestamp: string;
  plan?: ActionPlan;
  factCheck?: FactCheckResult;
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
  factCheck?: FactCheckResult;
  intent: JourneyId | "safety" | "fact-check" | "general";
}
