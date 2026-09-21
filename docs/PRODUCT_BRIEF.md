# Product brief: Vera

## Idea title

**Vera — Value Enablement & Resolution Assistant**<br />
**Promise:** Every benefit. One clear next step.

Vera is a working-title product concept; naming/trademark review is required before external launch.

## Problem

Health plans and care ecosystems contain valuable benefits, support, provider access, status information, and cost-saving options, but members experience them as disconnected directories, documents, phone queues, and handoffs. The burden is highest at a moment of need: the member must know which system to open, translate insurance language, compare incomplete choices, and coordinate organizations that do not share context.

The result is not merely a search problem. It is a **value-realization gap**:

- available services are difficult to discover;
- an answer often does not complete the next action;
- status language creates avoidable anxiety and calls;
- identical navigation treats different lives as an “average member”;
- the business sees contact volume but often misses the underlying friction pattern.

## Who benefits

### Primary

- Members and patients trying to access care, understand cost/coverage, or resolve an administrative journey.
- People with time, language, accessibility, digital-literacy, or coordination constraints.

### Secondary

- Client benefit leaders seeking better adoption and experience.
- Care advocates, service teams, clinicians, and provider offices receiving better-contextualized handoffs.
- Product and operations leaders who need de-identified insight into recurring friction.

## Solution

Vera combines two mutually reinforcing capabilities.

### 1. Member-facing digital human

A voice-and-text assistant understands the member’s goal in natural language, grounds its answer in authorized plan/journey context, explains the trade-off, checks comprehension, and presents one actionable next step. It can preserve approved context in a warm human handoff when automation is not appropriate.

### 2. Friction Intelligence

De-identified, minimum-cohort interaction signals expose where members fail to realize value: unavailable appointment times, misunderstood status labels, pharmacy option confusion, repeated handoffs, or low comprehension. Leaders see opportunity, intervention, and outcome—not individual surveillance.

## Novel differentiation

1. **Benefits-to-action graph:** combines eligibility, benefits, journey state, preferences, and permitted care signals into ranked actions rather than generic answers.
2. **Administrative “friction twin”:** conversations become a living map of the steps, language, and handoffs that prevent value realization.
3. **Counterfactual option cards:** show “what changes if…” cost/access choices with source, estimate, and confidence cues.
4. **Teach-back confidence:** success is not a delivered message; it is whether the member understands the status and next step.
5. **Consent-bound continuity:** a member controls which context follows them into a human or cross-organization handoff.
6. **Resilient multimodality:** voice, text, animated avatar, accessible UI, and low-bandwidth fallback share the same journey contract.

Unlike a standalone chatbot, Vera closes a loop and produces governed operational learning. Unlike a static portal, it begins with the member’s intent. Unlike an analytics dashboard, every signal traces to an intervention the organization can test.

## PoC evidence

The working application demonstrates:

- four synthetic journeys across affordability, outcomes, experience, and wellness device opt-in, plus sourced health-statement fact-checks and location-based hospital pre-registration;
- voice input and spoken response;
- real-time avatar listening/thinking/speaking states;
- optional LiveAvatar session creation;
- explainable action cards with synthetic source freshness;
- action completion and human/emergency boundaries;
- a business dashboard with opportunity, resolution, clarity, access, **portfolio wellness**, and privacy views;
- deterministic no-key operation plus optional OpenAI orchestration;
- a one-service Render deployment path.

## Value created

Dashboard numbers in the PoC are illustrative hypotheses, not company results. A pilot should measure value with agreed baselines.

| Pillar | Measure | Example pilot hypothesis |
|---|---|---|
| Affordability | member out-of-pocket opportunity accepted | more eligible 90-day/lower-cost options completed |
| Health outcomes | time from intent to appropriate care | fewer abandoned searches; faster matched appointments |
| Wellness | opt-in device summaries and coaching use | higher movement/sleep regularity; unused coaching sessions used |
| Experience | time to clarity and teach-back confidence | fewer repeat contacts and “status misunderstanding” calls |
| Operations | self-service resolution and handoff completeness | fewer transfers; shorter handling time after warm handoff |
| Growth/retention | benefit adoption and client experience | stronger demonstrated value realization |

A defensible value model should report separately:

- **member value:** estimated out-of-pocket and time saved;
- **plan/client value:** avoidable contacts, leakage, and care-delay opportunity;
- **quality value:** access, comprehension, completion, and escalation appropriateness;
- **confidence:** source freshness, assumption range, and attribution method.

## Feasibility and implementation roadmap

### Stage 0 — current PoC

- Synthetic member and operational data
- Deterministic journey engine
- Optional OpenAI Responses and LiveAvatar adapters
- Browser voice fallback
- Render-ready single service

### Stage 1 — 8–12 week controlled pilot

- Enterprise OIDC/OAuth with PKCE, consent, and role-based access
- Read-only connections to eligibility, benefits, provider directory, pharmacy, and authorization status
- Retrieval/source attribution and policy engine
- Approved interaction telemetry with minimum cohort thresholds
- Human care-advocate handoff and operational SLAs
- Accessibility, safety, privacy, legal, and clinical workflow review

### Stage 2 — 3–6 months

- Limited write-back actions through approved APIs
- Multilingual voice and culturally/linguistically reviewed content
- Journey-level model evaluation, red teaming, drift monitoring, and audit evidence
- Client-configurable benefit experiences and intervention experiments

### Stage 3 — 6–18 months

- Broader “opportunity graph” across products and journeys
- Event-driven proactive guidance with explicit consent
- Privacy-preserving aggregate learning across clients
- Outcome attribution and value guarantees where evidence supports them

The architecture is technically feasible with existing web, identity, model, voice/avatar, and API capabilities. Real deployment effort is concentrated in source authorization, workflow ownership, governance, content validation, and change management—not the chat interface itself.

## Key dependencies and risks

| Risk | Guardrail |
|---|---|
| Incorrect benefit or status answer | authorized sources, freshness labels, deterministic rules for high-risk intents, abstention |
| Medical advice or emergency delay | narrow role, emergency classifier, direct escalation, clinical review |
| PHI/privacy exposure | minimum necessary data, server-only secrets, no model storage, approved provider agreements, retention controls |
| Automation creates another dead end | warm handoff with member-approved context and clear ownership |
| Bias or unequal access | outcome testing by declared access need, multilingual/accessibility review, no inferred demographics |
| Low trust in an avatar | disclose AI, show sources and limits, preserve text/low-bandwidth and human alternatives |
| Weak value claims | label estimates, pre-register pilot measures, report confidence and counterfactual assumptions |

## Scorecard alignment

- **Problem definition:** explicitly addresses the gap between available value and realized value, for named member and operational audiences.
- **Innovation:** digital human + action graph + friction twin + comprehension signal is a differentiated system, not a single channel.
- **Value creation:** each demo journey maps to affordability, health outcomes, or member experience; the dashboard makes hypotheses measurable.
- **Feasibility:** a working PoC, bounded integration interfaces, staged roadmap, and no-key fallback demonstrate an implementable path.
- **Delivery:** professional responsive UI, voice/avatar interaction, action visuals, business analytics, and a built-in judge walkthrough support a clear pitch.
