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

interface CatalogEntry {
  id: string;
  verdict: Exclude<FactCheckVerdict, "unverified">;
  claim: string;
  finding: string;
  reply: string;
  required: string[];
  keywords: string[];
  sources: FactCheckSource[];
}

const librarySources: FactCheckSource[] = [
  {
    name: "CDC",
    organization: "Centers for Disease Control and Prevention",
    detail: "U.S. public-health guidance used in this demo library",
  },
  {
    name: "NIH MedlinePlus",
    organization: "National Institutes of Health",
    detail: "Consumer health summaries from NIH and the National Library of Medicine",
  },
  {
    name: "American Heart Association",
    organization: "American Heart Association",
    detail: "Heart and lifestyle recommendations used when a claim is about activity or heart health",
  },
];

const catalog: CatalogEntry[] = [
  {
    id: "vaccines-autism",
    verdict: "false",
    claim: "Vaccines cause autism.",
    finding:
      "Large studies and CDC vaccine-safety reviews have not found a link between vaccines—including MMR—and autism. The original paper that claimed a link was retracted and is not treated as evidence.",
    reply:
      "That statement is completely false. Vaccines have not been shown to cause autism. I am citing CDC vaccine-safety summaries, not a diagnosis or a personal medical opinion.",
    required: ["autism"],
    keywords: ["vaccine", "vaccines", "mmr", "immunization", "immunisation", "shot"],
    sources: [
      {
        name: "CDC Vaccine Safety",
        organization: "Centers for Disease Control and Prevention",
        detail: "Autism and vaccines: no link found in vaccine-safety research",
      },
      {
        name: "Immunization Safety Review",
        organization: "National Academy of Medicine (formerly IOM)",
        detail: "Independent reviews rejected a causal vaccine–autism relationship",
      },
    ],
  },
  {
    id: "antibiotics-cold",
    verdict: "false",
    claim: "Antibiotics treat the common cold or other viral illnesses.",
    finding:
      "Colds and most flu-like illnesses are caused by viruses. Antibiotics act on bacteria, so they do not shorten a typical cold and can cause side effects or resistance when used unnecessarily.",
    reply:
      "That statement is completely false. Antibiotics do not treat the common cold. CDC antibiotic-use guidance is the source, and this is not a prescription decision.",
    required: ["antibiotic"],
    keywords: ["cold", "colds", "flu", "virus", "viral", "sore throat"],
    sources: [
      {
        name: "Antibiotic Use",
        organization: "Centers for Disease Control and Prevention",
        detail: "Antibiotics do not work on viruses such as those that cause colds",
      },
    ],
  },
  {
    id: "activity-150",
    verdict: "true",
    claim: "About 150 minutes a week of moderate activity supports heart health for most adults.",
    finding:
      "U.S. Physical Activity Guidelines and American Heart Association recommendations both support at least 150 minutes a week of moderate-intensity aerobic activity, or 75 minutes of vigorous activity, plus muscle-strengthening on two or more days, for most adults.",
    reply:
      "That statement is true for most adults, according to HHS Physical Activity Guidelines and the American Heart Association. How much is right for you still depends on your clinician’s advice.",
    required: ["150"],
    keywords: ["minute", "minutes", "exercise", "activity", "aerobic", "heart", "week"],
    sources: [
      {
        name: "Physical Activity Guidelines for Americans",
        organization: "U.S. Department of Health and Human Services",
        detail: "Adults: 150 minutes moderate or 75 minutes vigorous activity per week",
      },
      {
        name: "Recommendations for Physical Activity in Adults",
        organization: "American Heart Association",
        detail: "AHA aligns with the 150-minute moderate-activity target for heart health",
      },
    ],
  },
  {
    id: "vitamin-c-colds",
    verdict: "partly-true",
    claim: "Vitamin C prevents the common cold.",
    finding:
      "NIH Office of Dietary Supplements reports that routine vitamin C does not prevent colds for most people. It may slightly shorten duration for some, and it may help people under brief extreme physical stress. It is not a proven cold cure.",
    reply:
      "That statement is partly true. Vitamin C is not a reliable way to prevent colds for most people, though some studies show a small effect on duration. Source: NIH Office of Dietary Supplements.",
    required: ["vitamin c"],
    keywords: ["cold", "colds", "flu", "prevent", "prevention", "immune"],
    sources: [
      {
        name: "Vitamin C fact sheet for consumers",
        organization: "NIH Office of Dietary Supplements",
        detail: "Routine vitamin C does not prevent colds in the general population",
      },
    ],
  },
  {
    id: "eight-glasses",
    verdict: "partly-true",
    claim: "Everyone needs exactly eight glasses of water a day.",
    finding:
      "Total water needs vary with body size, climate, activity, and food. The National Academies set adequate-intake ranges for total water from drinks and food—not a universal eight-glass rule. Eight glasses can be a reasonable reminder for some people, not a medical requirement for everyone.",
    reply:
      "That statement is partly true. Hydration matters, but there is no single eight-glass rule for every adult. The National Academies’ water-intake ranges are the source.",
    required: ["water"],
    keywords: ["8 glass", "8 glasses", "eight glass", "eight glasses", "8 cup", "eight cup", "eight cups"],
    sources: [
      {
        name: "Dietary Reference Intakes for Water",
        organization: "National Academies of Sciences, Engineering, and Medicine",
        detail: "Adequate intake is a range from food and fluids, not a fixed eight glasses",
      },
    ],
  },
  {
    id: "sugar-hyperactivity",
    verdict: "false",
    claim: "Sugar makes children hyperactive.",
    finding:
      "CDC materials on ADHD and controlled studies have not shown that sugar causes hyperactivity in children. Behavior can still change around sugary foods for other reasons, such as excitement or sleep, but sugar is not established as the cause of ADHD or typical “sugar highs.”",
    reply:
      "That statement is completely false as a medical claim. CDC summaries and controlled studies have not shown that sugar causes hyperactivity. Parenting context can still matter, and this is not a diagnosis.",
    required: ["sugar"],
    keywords: ["hyperactive", "hyperactivity", "adhd", "children", "kids", "child"],
    sources: [
      {
        name: "About ADHD",
        organization: "Centers for Disease Control and Prevention",
        detail: "Research does not support the view that ADHD is caused by eating too much sugar",
      },
    ],
  },
  {
    id: "detox-cleanse",
    verdict: "false",
    claim: "Detox teas or cleanses flush toxins from the body.",
    finding:
      "NIH’s National Center for Complementary and Integrative Health reports that there is little evidence that commercial detoxes or cleanses remove toxins. The liver and kidneys already do that work. Some products can cause diarrhea, dehydration, or dangerous interactions.",
    reply:
      "That statement is completely false. Commercial detox teas and cleanses have not been shown to flush toxins. NIH NCCIH is the source. Your liver and kidneys already handle that job.",
    required: ["detox"],
    keywords: ["tea", "cleanse", "flush", "toxin", "toxins", "juice"],
    sources: [
      {
        name: "Detoxes and Cleanses",
        organization: "NIH National Center for Complementary and Integrative Health",
        detail: "Little evidence that detox products remove toxins; some can cause harm",
      },
    ],
  },
  {
    id: "sunscreen-skin",
    verdict: "true",
    claim: "Regular sunscreen use helps protect skin from ultraviolet damage.",
    finding:
      "CDC skin-cancer prevention guidance recommends sunscreen with SPF 15 or higher, plus shade and protective clothing, to reduce ultraviolet exposure that can damage skin and raise cancer risk.",
    reply:
      "That statement is true. CDC skin-cancer prevention guidance supports regular sunscreen as one part of sun protection, along with shade and clothing.",
    required: ["sunscreen"],
    keywords: ["sun", "uv", "ultraviolet", "spf", "skin", "cancer", "protect"],
    sources: [
      {
        name: "Sun Safety",
        organization: "Centers for Disease Control and Prevention",
        detail: "Sunscreen SPF 15 or higher is part of recommended UV protection",
      },
    ],
  },
];

const factCheckCues = [
  "is it true",
  "is that true",
  "is this true",
  "is it false",
  "true or false",
  "fact check",
  "fact-check",
  "factcheck",
  "check this claim",
  "health claim",
  "i heard that",
  "i read that",
  "is it a myth",
  "myth that",
  "does science",
  "according to science",
];

function includesAny(input: string, terms: string[]) {
  return terms.some((term) => input.includes(term));
}

function scoreEntry(input: string, entry: CatalogEntry) {
  if (!entry.required.every((term) => input.includes(term))) return 0;
  const keywordHits = entry.keywords.filter((keyword) => input.includes(keyword)).length;
  return 1 + keywordHits;
}

function unverifiedResult(): FactCheckResult {
  return {
    id: "unverified",
    verdict: "unverified",
    claim: "A health statement that is not in Vera’s approved library for this demo.",
    finding:
      "Vera only rates claims that match her CDC, NIH, and American Heart Association library. I will not guess a true, partly true, or false label without that match. A clinician can review the specific statement with you.",
    sources: librarySources,
  };
}

export function getFactCheck(input: string): FactCheckResult | null {
  const normalizedInput = input.toLowerCase().replace(/vitamins?\s*c/g, "vitamin c");
  const cued = includesAny(normalizedInput, factCheckCues);

  const ranked = catalog
    .map((entry) => ({ entry, score: scoreEntry(normalizedInput, entry) }))
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score);

  const best = ranked[0];
  if (best && (best.score >= 2 || (cued && best.score >= 1))) {
    const { entry } = best;
    return {
      id: entry.id,
      verdict: entry.verdict,
      claim: entry.claim,
      finding: entry.finding,
      sources: entry.sources,
    };
  }

  if (cued) return unverifiedResult();
  return null;
}

export function getFactCheckReplyText(result: FactCheckResult) {
  if (result.verdict === "unverified") {
    return "I can check health statements against a small library of CDC, NIH, and American Heart Association summaries. This one is not in that library, so I will not mark it true or false. The sources I consult are listed on the card.";
  }

  const entry = catalog.find((item) => item.id === result.id);
  return entry?.reply ?? result.finding;
}

export function isFactCheckIntent(input: string) {
  return getFactCheck(input) !== null;
}
