import { useState } from "react";
import {
  Accessibility,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  Eye,
  Filter,
  Globe2,
  HeartPulse,
  Lightbulb,
  LockKeyhole,
  MessageSquareText,
  Minus,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  WalletCards,
  Zap,
} from "lucide-react";
import { frictionJourneys, opportunitySignals, portfolioWellness, signalFeed } from "../data/demoData";

const kpis = [
  { label: "Projected value unlocked", value: "$1.84M", change: "+18.2%", icon: WalletCards, tone: "mint", detail: "annualized member + plan value" },
  { label: "Self-service resolution", value: "72%", change: "+9.4 pts", icon: CheckCircle2, tone: "blue", detail: "completed without another handoff" },
  { label: "Time to clarity", value: "4m 18s", change: "−38 sec", icon: Clock3, tone: "violet", detail: "question to understood next step" },
  { label: "Member confidence", value: "8.6 / 10", change: "+0.7", icon: HeartPulse, tone: "coral", detail: "measured with teach-back" },
];

export function InsightsDashboard() {
  const [segment, setSegment] = useState("All members");
  const [range, setRange] = useState("Last 30 days");
  const [query, setQuery] = useState("");

  const filteredSignals = signalFeed.filter((signal) =>
    `${signal.title} ${signal.detail} ${signal.tag}`.toLowerCase().includes(query.toLowerCase()),
  );

  const exportSnapshot = () => {
    const rows = [
      ["Metric", "Value", "Change"],
      ...kpis.map(({ label, value, change }) => [label, value, change]),
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "vera-friction-intelligence-demo.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="insights-page">
      <section className="insights-hero">
        <div>
          <span className="page-eyebrow"><Sparkles size={14} /> Friction Intelligence</span>
          <h1>See where value gets stuck.<br /><em>Then help it move.</em></h1>
          <p>De-identified conversation signals reveal unmet needs, quantify avoidable friction, and show which interventions improve affordability, outcomes, and experience.</p>
        </div>
        <div className="insights-hero__controls">
          <label className="select-control"><Users size={15} /><select value={segment} onChange={(event) => setSegment(event.target.value)} aria-label="Member segment"><option>All members</option><option>Commercial plans</option><option>New plan members</option><option>Behavioral health journeys</option><option>Wellness-linked members</option></select><ChevronDown size={14} /></label>
          <label className="select-control"><Clock3 size={15} /><select value={range} onChange={(event) => setRange(event.target.value)} aria-label="Time range"><option>Last 30 days</option><option>Last 7 days</option><option>Quarter to date</option></select><ChevronDown size={14} /></label>
          <button className="export-button" type="button" onClick={exportSnapshot}><Download size={16} /> Export snapshot</button>
        </div>
      </section>

      <section className="data-trust-bar">
        <div><span className="live-data-dot" /><strong>Demo intelligence is live</strong><span>Updated 2 minutes ago</span></div>
        <div><ShieldCheck size={15} /><span>Synthetic PoC data</span><span>•</span><LockKeyhole size={15} /><span>De-identified by design</span></div>
      </section>

      <section className="kpi-grid" aria-label="Value performance indicators">
        {kpis.map(({ label, value, change, icon: Icon, tone, detail }) => (
          <article className={`kpi-card kpi-card--${tone}`} key={label}>
            <div className="kpi-card__top"><span className="kpi-icon"><Icon size={19} /></span><span className={`metric-change ${change.includes("−") ? "metric-change--down" : ""}`}>{change.includes("−") ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}{change}</span></div>
            <span className="kpi-label">{label}</span>
            <strong className="kpi-value">{value}</strong>
            <small>{detail}</small>
            <svg className="sparkline" viewBox="0 0 180 38" preserveAspectRatio="none" aria-hidden="true">
              <path className="sparkline__area" d={tone === "violet" ? "M0 8 C28 12 32 18 56 17 S90 27 112 22 S147 27 180 30 V38 H0Z" : "M0 31 C25 28 34 24 56 26 S86 17 108 20 S143 11 180 7 V38 H0Z"} />
              <path className="sparkline__line" d={tone === "violet" ? "M0 8 C28 12 32 18 56 17 S90 27 112 22 S147 27 180 30" : "M0 31 C25 28 34 24 56 26 S86 17 108 20 S143 11 180 7"} />
            </svg>
          </article>
        ))}
      </section>

      <section className="insights-grid insights-grid--primary">
        <article className="dashboard-card opportunity-card">
          <header className="dashboard-card__header">
            <div><span className="card-icon card-icon--mint"><Zap size={17} /></span><div><h2>Value opportunity radar</h2><p>Projected annual value recoverable through guided action</p></div></div>
            <button className="text-button" type="button">View methodology <ArrowUpRight size={14} /></button>
          </header>
          <div className="opportunity-total"><div><span>Identified opportunity</span><strong>$1.84M</strong></div><span className="confidence-chip"><TrendingUp size={14} /> 87% confidence</span></div>
          <div className="opportunity-list">
            {opportunitySignals.map((signal) => (
              <div className="opportunity-row" key={signal.label}>
                <div><span>{signal.label}</span><strong>{signal.amount}</strong></div>
                <div className="progress-track"><span className={`progress-fill progress-fill--${signal.color}`} style={{ width: `${signal.value}%` }} /></div>
                <small>{signal.value}% actionable</small>
              </div>
            ))}
          </div>
          <div className="pillar-legend"><span><i className="legend-dot legend-dot--mint" />Affordability</span><span><i className="legend-dot legend-dot--blue" />Health outcomes</span><span><i className="legend-dot legend-dot--teal" />Hospital arrival</span><span><i className="legend-dot legend-dot--coral" />Wellness</span><span><i className="legend-dot legend-dot--violet" />Experience</span></div>
        </article>

        <article className="dashboard-card outcomes-card">
          <header className="dashboard-card__header">
            <div><span className="card-icon card-icon--blue"><BarChart3 size={17} /></span><div><h2>Closed-loop outcomes</h2><p>From question to verified action</p></div></div>
            <button className="more-button" type="button" aria-label="More outcome options">•••</button>
          </header>
          <div className="donut-layout">
            <div className="donut-chart"><div><strong>72%</strong><span>resolved</span></div></div>
            <div className="donut-legend">
              <div><span><i className="legend-dot legend-dot--mint" />Action completed</span><strong>72%</strong></div>
              <div><span><i className="legend-dot legend-dot--blue" />Guided handoff</span><strong>19%</strong></div>
              <div><span><i className="legend-dot legend-dot--pale" />Still exploring</span><strong>9%</strong></div>
            </div>
          </div>
          <div className="outcome-callout"><span><Lightbulb size={17} /></span><div><strong>Biggest mover</strong><p>Structured provider reminders reduced authorization status calls by <b>21%</b>.</p></div></div>
        </article>
      </section>

      <section className="insights-grid insights-grid--wellness" aria-label="Portfolio wellness">
        <article className="dashboard-card wellness-portfolio-card">
          <header className="dashboard-card__header">
            <div><span className="card-icon card-icon--coral"><HeartPulse size={17} /></span><div><h2>Portfolio wellness</h2><p>Opt-in device summaries, never identified members</p></div></div>
            <span className="confidence-chip"><LockKeyhole size={14} /> k-anonymous cohorts</span>
          </header>
          <div className="wellness-kpis">
            <div><span>Device opt-in</span><strong>{portfolioWellness.optInRate}</strong><small>{portfolioWellness.optInChange} vs prior period</small></div>
            <div><span>Median daily steps</span><strong>{portfolioWellness.medianSteps}</strong><small>{portfolioWellness.linkedMembers} members linked</small></div>
            <div><span>Sleep regularity</span><strong>{portfolioWellness.sleepRegularity}</strong><small>4+ nights near personal baseline</small></div>
            <div><span>Preventable-risk value</span><strong>{portfolioWellness.preventableRisk}</strong><small>coaching + movement opportunity</small></div>
          </div>
          <div className="wellness-cohorts">
            {portfolioWellness.cohorts.map((cohort) => (
              <div className={`wellness-cohort wellness-cohort--${cohort.tone}`} key={cohort.label}>
                <strong>{cohort.value}</strong>
                <span>{cohort.label}</span>
                <small>{cohort.detail}</small>
              </div>
            ))}
          </div>
          <p className="wellness-privacy-note">Leaders see rates and minimum-size cohorts from weekly summaries (steps, sleep duration, active minutes). Raw GPS, heart-rate streams, and names never enter this layer.</p>
        </article>
      </section>

      <section className="insights-grid insights-grid--secondary">
        <article className="dashboard-card journey-card">
          <header className="dashboard-card__header">
            <div><span className="card-icon card-icon--violet"><MessageSquareText size={17} /></span><div><h2>Journey friction map</h2><p>Where members need the most help now</p></div></div>
            <button className="filter-button" type="button"><Filter size={14} /> Filter</button>
          </header>
          <div className="journey-table" role="table" aria-label="Journey friction signals">
            <div className="journey-table__head" role="row"><span>Journey</span><span>Friction point</span><span>Conversations</span><span>Trend</span></div>
            {frictionJourneys.map((item) => (
              <div className="journey-table__row" role="row" key={item.journey}>
                <strong>{item.journey}</strong><span>{item.stage}</span><span>{item.conversations}</span><span className={`trend trend--${item.severity}`}>{item.change === "−6%" ? <ArrowDownRight size={13} /> : <ArrowUpRight size={13} />}{item.change}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="dashboard-card signal-card">
          <header className="dashboard-card__header">
            <div><span className="card-icon card-icon--coral"><Eye size={17} /></span><div><h2>Emerging signals</h2><p>Patterns worth a closer look</p></div></div>
          </header>
          <label className="signal-search"><Search size={15} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search de-identified signals" /></label>
          <div className="signal-list">
            {filteredSignals.map((signal) => (
              <button className="signal-item" type="button" key={signal.title}>
                <span className="signal-item__marker" />
                <span className="signal-item__content"><span><small>{signal.time}</small><em>{signal.tag}</em></span><strong>{signal.title}</strong><small>{signal.detail}</small></span>
                <ArrowUpRight size={15} />
              </button>
            ))}
            {filteredSignals.length === 0 && <p className="empty-signal">No signals match this search.</p>}
          </div>
        </article>
      </section>

      <section className="insights-grid insights-grid--tertiary">
        <article className="dashboard-card equity-card">
          <header className="dashboard-card__header">
            <div><span className="card-icon card-icon--mint"><Globe2 size={17} /></span><div><h2>Inclusive access pulse</h2><p>Experience signals—not inferred demographics</p></div></div>
          </header>
          <div className="access-metrics">
            <div><span className="access-icon"><Globe2 size={17} /></span><span><small>Spanish-language sessions</small><strong>91% clarity</strong></span><em><ArrowUpRight size={12} /> 4 pts</em></div>
            <div><span className="access-icon"><Accessibility size={17} /></span><span><small>Accessible-mode sessions</small><strong>89% resolved</strong></span><em><Minus size={12} /> steady</em></div>
            <div><span className="access-icon"><Zap size={17} /></span><span><small>Low-bandwidth completion</small><strong>84% completed</strong></span><em><ArrowUpRight size={12} /> 7 pts</em></div>
          </div>
        </article>

        <article className="dashboard-card governance-card">
          <div className="governance-visual"><ShieldCheck size={32} /><span className="governance-ring governance-ring--one" /><span className="governance-ring governance-ring--two" /></div>
          <div><span className="page-eyebrow">Trust architecture</span><h2>Insights without surveillance.</h2><p>Identity is separated from analytics. Leaders see minimum-threshold patterns; care teams see only what members authorize.</p><div className="governance-tags"><span><LockKeyhole size={13} /> Minimum cohorts</span><span><Eye size={13} /> Auditable access</span><span><Users size={13} /> Human oversight</span></div></div>
        </article>
      </section>
    </main>
  );
}
