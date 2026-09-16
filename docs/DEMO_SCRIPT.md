# Vera demo script

## Before presenting

- Open the deployed URL in current Chrome or Edge.
- Confirm `/api/health` returns `status: ok`.
- Allow microphone permission if using voice.
- Keep browser zoom at 90–100% and use a desktop-width window.
- If using LiveAvatar, verify account credits and the configured avatar before the session. Do not start it until the demo segment.
- The deterministic avatar, speech, and three journeys require no provider credentials.

## 90-second judge path

### 0–12 seconds — problem and promise

> “Healthcare value already exists, but members experience it as documents, directories, phone queues, and handoffs. Vera turns every benefit into one clear next step—personalized to the individual, not the average member.”

Point out the synthetic member context and “3 opportunities found.”

### 12–42 seconds — human interaction

Select the microphone and say:

> “Can you help me lower the cost of my asthma medication?”

Or select **Lower my medication cost**.

As Vera responds:

> “Vera combines the plan, current journey, and preference for fewer errands. She explains the best-fit option, estimated value, source freshness, and what remains under the prescriber’s control.”

Expand **See how this works**.

### 42–58 seconds — answer to action

Select **Start the switch**.

> “Most assistants stop at an answer. Vera closes the loop—or creates a warm handoff with the context the member approves.”

Point to the completion confirmation and synthetic-data disclosure.

### 58–80 seconds — operational learning

Open **Friction intelligence**.

> “Every de-identified interaction also teaches the system where value gets stuck. Leaders can see affordability opportunity, time to clarity, recurring journey friction, inclusive-access signals, and which interventions actually resolve the need.”

Point to **Insights without surveillance**.

### 80–90 seconds — feasibility and close

> “This is a working React PoC: secure server-side OpenAI and LiveAvatar adapters, deterministic failover, voice, responsive UI, tests, and a one-service Render deployment. Vera makes healthcare value usable—and makes friction actionable.”

## Three-minute pitch extension

Use one journey for each scorecard value pillar:

1. **Affordability:** prescription 90-day option.
2. **Health outcomes:** find a therapist this week.
3. **Member experience:** explain and advance an MRI authorization.

Then show:

- source/freshness labels and emergency/human boundaries;
- the dashboard’s opportunity radar and closed-loop outcomes;
- the roadmap from read-only pilot to governed write-back actions;
- the dual value proposition: member outcomes and organizational learning.

## Optional LiveAvatar moment

Select **Try LiveAvatar** only when a key and tested avatar are configured.

> “The default avatar keeps the demo resilient. This provider-backed mode shows how the same action experience can be embodied as a real-time digital human.”

If unavailable, use the visible fallback message as a strength:

> “Vera degrades gracefully—the value journey never depends on a paid provider being available.”

## Questions to prepare for

### “Is this just another chatbot?”

No. The differentiator is the system around the conversation: authorized context, explainable ranked actions, closed-loop execution, comprehension, consent-bound handoff, and aggregate friction learning.

### “How do you prevent hallucinated coverage?”

The PoC gives the model a narrow synthetic fact set and a validated response contract. Registered action cards remain application-controlled. High-risk intents can be deterministic. A pilot adds authorized retrieval, freshness, policy checks, abstention, audit, and evaluation.

### “What is real versus simulated?”

The React product, voice flow, avatar states, API security layer, OpenAI adapter, LiveAvatar adapter, analytics interactions, test suite, and deployment package are real. Member identity, benefits, costs, provider availability, authorization status, action write-backs, and dashboard metrics are synthetic.

### “How does OAuth work?”

Member OAuth/OIDC belongs at the application boundary through the approved enterprise identity provider. OpenAI is called by the server using its own approved service credential. The PoC uses a pre-verified synthetic profile to remain instantly distributable.

### “How would this create measurable value?”

Pilot against baseline: opportunity acceptance, time to care, repeat contacts, transfer count, time to clarity, teach-back confidence, handoff completeness, and source-specific financial opportunity. Keep member, plan/client, operational, and quality value separate.

## Demo recovery

- **Microphone blocked:** select a suggested prompt; all journeys remain available.
- **OpenAI unavailable:** server fallback returns the same action contract.
- **Backend unavailable:** browser fallback still runs the journey.
- **LiveAvatar unavailable:** default avatar continues listening/thinking/speaking animation.
- **Network constrained:** text and local demo logic preserve the core story.
