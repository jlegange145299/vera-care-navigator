import {
  ArrowUpRight,
  Bot,
  BrainCircuit,
  Clock3,
  MoonStar,
  MessageSquareText,
  SendHorizonal,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Waves,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { MemberProfile } from "../types";

interface WellnessBreakdownProps {
  profile: MemberProfile;
}

type WellnessTab = "overview" | "coach" | "chat";
type WellnessMessage = { role: "assistant" | "user"; text: string };

const scoreCards = [
  { label: "Sleep", value: "5.9h", avg: "6.8h avg", delta: "-0.9h", tone: "alert", note: "Insufficient sleep", icon: MoonStar },
  { label: "Movement", value: "18 min", avg: "25 min avg", delta: "+2 min", tone: "good", note: "Above weekly baseline", icon: Waves },
  { label: "Stress load", value: "Moderate", avg: "Low-moderate avg", delta: "+1.3 pts", tone: "alert", note: "A little elevated", icon: BrainCircuit },
];

const coachCards = [
  {
    title: "Wind-down timer",
    subtitle: "Protect the last 30 minutes before bed",
    outcome: "Improves sleep onset",
    detail: "A repeatable evening routine helps signal to your body that it is time to recover, which supports faster sleep onset and fewer wakeups.",
    badge: "High impact",
  },
  {
    title: "Caffeine cutoff",
    subtitle: "Avoid caffeine after midday",
    outcome: "Reduces night-time alertness",
    detail: "Even small amounts of late-day caffeine can delay sleep latency and reduce deep sleep. A noon cutoff is a realistic starting point.",
    badge: "Easy tweak",
  },
  {
    title: "Bedroom reset",
    subtitle: "Dim lights and reduce noise",
    outcome: "Better sleep quality",
    detail: "Lower light, cooler room temperature, and less stimulation can noticeably reduce arousal and support a steadier sleep cycle.",
    badge: "Low effort",
  },
];

const factCards = [
  {
    source: "CDC",
    title: "Sleep quality matters",
    summary: "Regular sleep schedules and sleep hygiene habits are associated with better daytime alertness and overall health.",
  },
  {
    source: "NIH",
    title: "Caffeine timing affects sleep",
    summary: "Late-day caffeine can delay sleep onset and reduce sleep duration, especially when consumed in the afternoon or evening.",
  },
  {
    source: "AHA",
    title: "Movement supports recovery",
    summary: "Regular light activity contributes to better sleep quality and lower stress, even when the total exercise time is modest.",
  },
];

const defaultAssistantMessages: WellnessMessage[] = [
  {
    role: "assistant" as const,
    text: "Your sleep is the biggest gap this week. I can help you improve it by checking a few habits like caffeine timing, bedroom noise, and sleep consistency.",
  },
  {
    role: "assistant" as const,
    text: "You’re doing well on daily movement, but sleep is the easiest place to add measurable improvement without overhauling your routine.",
  },
];

export function WellnessBreakdown({ profile }: WellnessBreakdownProps) {
  const [messages, setMessages] = useState(defaultAssistantMessages);
  const [draft, setDraft] = useState("");
  const [activeTab, setActiveTab] = useState<WellnessTab>("overview");

  const summary = useMemo(() => {
    if (profile.genderLabel === "Woman") {
      return "You’re trending well on activity and steady habits. The main opportunity this week is improving sleep consistency and protecting your recovery time.";
    }
    if (profile.genderLabel === "Man") {
      return "You have a solid activity pattern, but sleep is below your usual recovery range. A few small routine changes would likely improve both energy and consistency.";
    }
    return "The signal is positive overall. Movement is stable, while sleep quality and recovery are the biggest opportunities for improvement.";
  }, [profile.genderLabel]);

  const onSend = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;

    const lower = trimmed.toLowerCase();
    const reply = lower.includes("coffee")
      ? "That matters. Caffeine later in the day can delay sleep onset, so aim to stop caffeine after noon if you’re feeling tired during the day."
      : lower.includes("bedroom") || lower.includes("noise")
        ? "A quieter room helps. Consider a white-noise machine, closing the curtains earlier, or reducing evening screen exposure to support melatonin and more restful sleep."
        : lower.includes("sleep") || lower.includes("bedtime")
          ? "Consistent bed and wake times are one of the simplest ways to improve sleep quality. Try a repeatable wind-down sequence for 3–4 nights and watch whether your energy improves."
          : lower.includes("movement") || lower.includes("exercise")
            ? "Daily movement is helping. Keep it light and regular, especially after lunch or early evening, so it supports sleep instead of stimulating you too late."
            : "A few good targets are consistent bedtime, less caffeine after midday, and a quieter bedroom. I can help you build a plan around the biggest sleep driver for you.";

    setMessages((current) => [...current, { role: "user", text: trimmed }, { role: "assistant", text: reply }]);
    setDraft("");
    setActiveTab("chat");
  };

  return (
    <main className="wellness-page">
      <section className="wellness-header">
        <div>
          <span className="page-eyebrow"><Sparkles size={13} /> Wellness overview</span>
          <h1>{profile.firstName}&apos;s recovery dashboard</h1>
        </div>
        <div className="wellness-badge">AI summary</div>
      </section>

      <div className="wellness-tabs" role="tablist" aria-label="Wellness sections">
        {[
          { key: "overview", label: "Overview" },
          { key: "coach", label: "Coach" },
          { key: "chat", label: "Chat" },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.key}
            className={activeTab === tab.key ? "wellness-tab wellness-tab--active" : "wellness-tab"}
            onClick={() => setActiveTab(tab.key as WellnessTab)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <>
          <section className="wellness-summary">
            <div>
              <p className="summary-label">What&apos;s going well</p>
              <strong>Movement is trending in a healthy range.</strong>
            </div>
            <div>
              <p className="summary-label">Main opportunity</p>
              <strong>Sleep is below your weekly target.</strong>
            </div>
          </section>

          <section className="wellness-score-grid">
            {scoreCards.map(({ label, value, avg, delta, tone, note, icon: Icon }) => (
              <article key={label} className={`wellness-score-card wellness-score-card--${tone}`}>
                <div className="wellness-score-card__top">
                  <span className="wellness-score-card__icon"><Icon size={16} /></span>
                  {delta.startsWith("-") ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                </div>
                <p>{label}</p>
                <strong>{value}</strong>
                <span>{avg}</span>
                <small>{delta} · {note}</small>
              </article>
            ))}
          </section>

          <section className="wellness-insight">
            <div className="wellness-insight__header">
              <span><Bot size={16} /></span>
              <div>
                <strong>Vera overview</strong>
                <small>Evidence-informed guidance</small>
              </div>
            </div>
            <p>{summary}</p>
            <div className="wellness-source-chips">
              <span>CDC sleep guidance</span>
              <span>NIH healthy habits</span>
              <span>Evidence-backed routines</span>
            </div>
          </section>

          <section className="wellness-facts">
            {factCards.map((card) => (
              <article key={`${card.source}-${card.title}`} className="fact-card">
                <span className="fact-card__source">{card.source}</span>
                <strong>{card.title}</strong>
                <p>{card.summary}</p>
              </article>
            ))}
          </section>
        </>
      )}

      {activeTab === "coach" && (
        <section className="wellness-coach-grid">
          {coachCards.map((card) => (
            <article key={card.title} className="coach-card">
              <div className="coach-card__header">
                <div>
                  <span className="coach-card__badge">{card.badge}</span>
                  <strong>{card.title}</strong>
                </div>
                <Clock3 size={16} />
              </div>
              <p className="coach-card__subtitle">{card.subtitle}</p>
              <div className="coach-card__outcome">{card.outcome}</div>
              <p>{card.detail}</p>
            </article>
          ))}
        </section>
      )}

      {activeTab === "chat" && (
        <section className="wellness-chat">
          <div className="section-heading">
            <MessageSquareText size={15} />
            <strong>Ask Vera about sleep</strong>
          </div>

          <div className="wellness-chat__feed">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={message.role === "assistant" ? "chat-bubble chat-bubble--assistant" : "chat-bubble chat-bubble--user"}>
                {message.text}
              </div>
            ))}
          </div>

          <div className="wellness-chat__composer">
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              rows={2}
              placeholder="Ask: How can I get better sleep?"
              aria-label="Ask about wellness improvements"
            />
            <button type="button" onClick={onSend} aria-label="Send wellness question">
              <SendHorizonal size={16} />
            </button>
          </div>
        </section>
      )}

      <section className="wellness-recommendations">
        <div className="section-heading">
          <Target size={15} />
          <strong>Daily habit checklist</strong>
        </div>
        <ul>
          <li><span className="step-check"><ArrowUpRight size={12} /></span><span>Keep a consistent wake time, even when sleep is short.</span></li>
          <li><span className="step-check"><ArrowUpRight size={12} /></span><span>Limit caffeine after noon, and hydrate earlier in the day.</span></li>
          <li><span className="step-check"><ArrowUpRight size={12} /></span><span>Reduce bedroom noise and dim lights in the final 30 minutes before bed.</span></li>
          <li><span className="step-check"><ArrowUpRight size={12} /></span><span>Use a short, low-intensity walk after lunch to support better evening energy.</span></li>
        </ul>
      </section>
    </main>
  );
}
