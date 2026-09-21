# Vera architecture

## Design goals

1. Produce a persuasive, reliable judging experience without credentials.
2. Keep OpenAI and LiveAvatar credentials outside the browser.
3. Separate model language generation from deterministic healthcare journey facts and actions.
4. Deploy as one Render web service with same-origin APIs.
5. Provide a clear path to enterprise identity, consent, data authorization, and governance.

## Runtime map

```text
Browser (React)
├─ Member workspace
│  ├─ Web SpeechRecognition ───────────────┐
│  ├─ Conversation + action cards         │
│  ├─ SpeechSynthesis + animated SVG       │
│  └─ Optional LiveAvatar iframe           │
├─ Friction Intelligence (synthetic)       │
└─ Same-origin API client                  │
   ├─ POST /api/chat ──────────────────────┼─> Express validation/rate limits
   │                                       │   ├─ deterministic safety route
   │                                       │   ├─ deterministic demo engine
   │                                       │   └─ optional OpenAI Responses API
   └─ POST /api/avatar/embed ──────────────┴─> LiveAvatar v2 embed proxy
                                                   (explicit click only)
```

In production, Express also serves `dist/`; locally Vite proxies `/api` to port 8787.

## Conversation contract

The client sends a bounded message and up to ten bounded history items. Zod rejects extra fields and invalid sizes. The server returns:

```json
{
  "text": "Plain-language response",
  "intent": "rx-savings",
  "planId": "rx-savings",
  "mode": "demo"
}
```

`planId` references a locally controlled action-card definition (rx-savings, care-access, prior-auth, wellness-connect, or hospital-prereg). The model can select an approved journey but cannot invent executable UI or an unregistered transaction. Emergency keywords bypass the model. Health-statement fact-checks also bypass the model: Vera matches the claim to a CDC / NIH / AHA library, returns true, partly true, completely false, or unverified, and always includes the source. Hospital matching uses city-level IP location by default; optional phone GPS refines the same demo area and is not stored. If provider output is missing, malformed, or unavailable, the deterministic server engine responds; if the server is unavailable, the browser has the same showcase fallback.

Wellness device linking is synthetic and consent-bound: the UI collects which phone or wearable the member would share, then Vera uses weekly summaries only (steps, sleep duration, active minutes). Portfolio wellness metrics on the dashboard are de-identified cohort rates, not named members.

## LiveAvatar boundary

The browser never sees `LIVEAVATAR_API_KEY`. It explicitly requests `/api/avatar/embed`, which:

- rate-limits session creation;
- uses a bounded upstream timeout;
- does not return upstream error bodies;
- extracts only the URL, not provider script;
- accepts only HTTPS URLs on configured provider domains.

The iframe is not created on page load because sessions can incur usage. The default animated SVG remains available at all times. A deeper pilot can replace FULL/embed mode with LITE mode and a managed audio bridge when synchronized OpenAI audio and custom tool overlays are required.

## Trust boundaries

### Implemented in the PoC

- server-only provider credentials;
- HTTPS-oriented CSP and Helmet headers;
- same-origin APIs and no CORS expansion;
- strict body limits and schemas;
- global and route rate limits;
- no-store response headers and OpenAI `store: false`;
- generic provider/server failures;
- no prompts or member text in application logs;
- synthetic identity and healthcare data;
- emergency, medical-advice, and human-handoff language;
- de-identified/minimum-cohort product principle in the UI.

### Required before real data

- approved enterprise OIDC/OAuth 2.0 with PKCE and API token validation;
- fine-grained authorization, consent receipts, and purpose-of-use controls;
- source-system service identities and field-level minimum-necessary policies;
- encrypted audit trails and approved retention/deletion schedules;
- secrets manager and workload identity rather than long-lived local keys;
- approved data-processing/BAA posture for every provider used with PHI;
- model/prompt versioning, evaluations, incident response, and human escalation operations;
- accessibility, clinical, privacy, legal, and security sign-off.

## OAuth clarification

OpenAI API authentication and application user authentication are different boundaries. The server uses an OpenAI API credential (or future workload identity). Members should authenticate to Vera through the company’s approved identity provider. The PoC avoids a fake OAuth implementation because no tenant, issuer, client ID, redirect URI, or role model was supplied; it represents a pre-verified synthetic member and makes the production insertion point explicit.

## Deployment

`render.yaml` runs:

```text
Build: npm ci && npm run build
Start: npm start
Health: /api/health
```

The Node process serves `dist/` and the API. This gives judges one URL, avoids cross-origin configuration, and allows the no-key deployment to stay fully functional.

## Production evolution

Keep the UI/action contract stable while replacing adapters:

1. deterministic fixtures → approved benefits/provider/authorization APIs;
2. pre-verified synthetic profile → enterprise identity and consent;
3. static action plans → policy-checked orchestration and audited write-back;
4. synthetic insights → de-identified event pipeline with cohort thresholds;
5. browser speech → approved streaming voice stack where needed;
6. iframe avatar → LITE audio-to-avatar bridge if synchronized custom orchestration justifies it.
