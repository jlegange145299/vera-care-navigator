import type { MemberProfile, MemberProfileId } from "./types.js";

export type MemberProfileRecord = Omit<MemberProfile, "portraitSrc"> & { id: MemberProfileId };

export const memberProfileRecords: MemberProfileRecord[] = [
  {
    id: "jordan",
    firstName: "Jordan",
    fullName: "Jordan Lee",
    initials: "JL",
    age: 42,
    genderLabel: "Woman",
    city: "Bloomfield",
    region: "CT",
    country: "United States",
    plan: "Open Access Plus",
    coverage: "Medical + pharmacy",
    avatarLabel: "Vera guide matched to Jordan",
    greeting: "Good morning",
  },
  {
    id: "noor",
    firstName: "Noor",
    fullName: "Noor Al Mansouri",
    initials: "NA",
    age: 38,
    genderLabel: "Woman",
    city: "Dubai",
    region: "Dubai",
    country: "United Arab Emirates",
    plan: "Global Health Plus",
    coverage: "Medical + pharmacy",
    avatarLabel: "Vera guide matched to Noor",
    greeting: "Good afternoon",
  },
  {
    id: "josh",
    firstName: "Josh",
    fullName: "Josh Williams",
    initials: "JW",
    age: 65,
    genderLabel: "Man",
    city: "London",
    region: "England",
    country: "United Kingdom",
    plan: "Premier International",
    coverage: "Medical + pharmacy",
    avatarLabel: "Vera guide matched to Josh",
    greeting: "Good morning",
  },
];

export const defaultMemberProfileId: MemberProfileId = "jordan";

export function createWelcomeMessage(profile: Pick<MemberProfile, "id" | "firstName" | "greeting">) {
  return {
    id: `vera-welcome-${profile.id}`,
    role: "assistant" as const,
    timestamp: "Now",
    text: `${profile.greeting}, ${profile.firstName}. I’m Vera, your benefits guide. I can explain your coverage, match a hospital from your location, check a health statement against public sources, and help complete the next step—not just point you to another page. What would make healthcare easier today?`,
  };
}
