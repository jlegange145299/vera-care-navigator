# Vera — every benefit, one clear next step

Vera is a deployable React proof of concept for the 2026 Aspire iTournament challenge. It demonstrates how a conversational digital human can help a synthetic member understand benefits, compare options, and complete the next action—while a privacy-preserving **Friction Intelligence** layer shows the business where members struggle and where measurable value can be recovered.

> **Confidentiality:** the tournament source deck is marked confidential/internal-use-only. It is intentionally **not** included in this repository. Vera uses an original product identity and only a high-level palette inspired by the supplied context. Keep the GitHub repository private unless the content owner explicitly approves public distribution.

## Why this is more than a chatbot

- **Benefits-to-action graph:** answers culminate in explainable, source-labeled next steps.
- **Personalization without “the average member”:** plan, journey, preferences, and current friction are considered together.
- **Closed-loop orchestration:** Vera can simulate starting a pharmacy switch, holding care, or closing an authorization handoff.
- **Teach-back and trust cues:** plain language, current status, plan source, uncertainty boundaries, and human escalation remain visible.
- **Friction Intelligence:** de-identified interactions become operational signals across affordability, outcomes, and experience.
- **No-dead-demo design:** server fallback and browser fallback keep all three showcase journeys available without paid credentials.

## Included journeys

1. **Prescription affordability:** identify a 90-day home-delivery option with $312 in synthetic annual savings.
2. **Behavioral-care access:** locate a synthetic in-network evening appointment with cost and referral clarity.
3. **Prior-authorization navigation:** explain that an MRI request is in review—not denied—and prepare the missing-notes handoff.

All identities, benefits, claims, provider availability, status events, costs, and dashboard metrics are synthetic demonstration data.

## Stack

- React 19 + TypeScript + Vite
- Node.js + Express
- OpenAI Responses API (optional, server-side)
- LiveAvatar short-lived embed (optional, server-side)
- Browser Web Speech APIs for credential-free speech-to-text and text-to-speech
- Vitest, Testing Library, and Supertest
- Render Blueprint for one-service deployment

## Run locally

Requirements: Node.js 22–24 and npm.

```cmd
copy .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`. `npm run dev` is a long-running local process and should be run in your terminal. No keys are needed for the full deterministic judging flow.

For a production-style local build:

```cmd
npm run build
set NODE_ENV=production
npm start
```

Then open `http://localhost:8787`.

## Configuration

### OpenAI

Set these only on the server (`.env` locally or Render environment variables):

```dotenv
DEMO_MODE=false
OPENAI_API_KEY=your_server_side_key
OPENAI_MODEL=gpt-5-mini
```

The browser never receives the key. If the provider fails, times out, or violates the expected response contract, `/api/chat` returns the deterministic journey response. `store: false` is set on API requests.

OpenAI API access uses a server credential (or production workload identity), not a member’s ChatGPT login. **End-user OAuth is a separate application authentication layer.** A production pilot should place enterprise OIDC/OAuth 2.0 with PKCE (for example, the approved corporate identity provider) in front of the app and API; this PoC intentionally uses a synthetic, pre-verified member so judges can evaluate it without tenant access.

### LiveAvatar

```dotenv
LIVEAVATAR_API_KEY=your_server_side_key
LIVEAVATAR_AVATAR_ID=optional_avatar_id
LIVEAVATAR_CONTEXT_ID=optional_context_id
LIVEAVATAR_EMBED_ENDPOINT=https://api.liveavatar.com/v2/embeddings
```

Select **Try LiveAvatar** in the avatar panel. The session is requested only after that explicit click because provider sessions can be billable. `/api/avatar/embed` hides the key, bounds the upstream timeout, and returns only an HTTPS URL on an allowlisted provider domain. Without a key—or if the provider is unavailable—the built-in Vera avatar remains fully interactive.

### Built-in avatar

The credential-free avatar is a single still portrait (`src/assets/vera-portrait.jpg`) with a jaw layer, mouth cavity, and eyelid layers composited over it, so Vera breathes, blinks, and speaks without any provider session. The face is **generated, not a real person**, and no likeness rights are implied; replacing it means retuning the landmark custom properties documented in `src/styles.css`. Motion is suppressed under `prefers-reduced-motion`.

## Validation

```cmd
npm run typecheck
npm test
npm run build
```

Or run all three with:

```cmd
npm run check
```

The suite covers deterministic intent/safety behavior, API validation and headers, optional-avatar fallback, customer action completion, and dashboard navigation.

## Deploy to Render

1. Create a **private** GitHub repository and push this project after internal approval.
2. In Render, create a Blueprint from the repository; `render.yaml` defines the Node web service, health check, build, and start commands.
3. Add `OPENAI_API_KEY` and/or `LIVEAVATAR_API_KEY` as secret environment variables only if connected mode is required.
4. Deploy and verify `/api/health`, the three member journeys, voice permissions, the insights dashboard, and the judge walkthrough.

The same Express process serves the compiled React app and `/api/*`, eliminating CORS and multi-service setup for judges.

## 90-second evaluation route

Use the floating **Judge walkthrough** button, or follow this sequence:

1. Say or select **Lower my medication cost**.
2. Expand **See how this works**, then select **Start the switch**.
3. Open **Friction intelligence** and point out value opportunity, self-service resolution, the journey friction map, inclusive-access pulse, and “Insights without surveillance.”

See [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) for the spoken narrative and fallback plan.

## Production boundary

This is not a medical device, emergency service, coverage determination, or production claims workflow. Before real member use, add approved identity and consent, source-system authorization, audit logging, clinical and legal review, accessibility/usability studies, retention controls, observability, model evaluation, human escalation SLAs, and the organization’s required privacy/security agreements. Never send PHI to a provider that has not been approved for the intended workload.

## Project documents

- [`docs/PRODUCT_BRIEF.md`](docs/PRODUCT_BRIEF.md) — submission narrative, differentiation, value model, roadmap, and scorecard alignment
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — runtime flows, trust boundaries, and production evolution
- [`docs/DEMO_SCRIPT.md`](docs/DEMO_SCRIPT.md) — 90-second and three-minute presentation paths

## Official technical references

- [OpenAI JavaScript/TypeScript API library](https://developers.openai.com/api/reference/typescript/)
- [OpenAI Responses API streaming guide](https://developers.openai.com/api/docs/guides/streaming-responses?api-mode=responses)
- [LiveAvatar overview and embed quickstart](https://docs.liveavatar.com/)
- [LiveAvatar LITE lifecycle](https://docs.liveavatar.com/docs/lite-mode/lifecycle)
- [Render Node/Express deployment](https://render.com/docs/deploy-node-express-app)
- [Render Blueprints](https://render.com/docs/infrastructure-as-code)

Content derived from those references was rephrased for compliance with licensing restrictions.
