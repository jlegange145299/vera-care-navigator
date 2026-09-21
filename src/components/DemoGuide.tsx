import { useEffect, useState } from "react";
import { ArrowRight, ChartNoAxesCombined, Check, MessageCircle, Presentation, Sparkles, X } from "lucide-react";
import type { ExperienceView } from "../types";

interface DemoGuideProps {
  onNavigate: (view: ExperienceView) => void;
}

export function DemoGuide({ onNavigate }: DemoGuideProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <>
      <button className="demo-guide-button" type="button" onClick={() => setOpen(true)}>
        <Presentation size={18} /><span>Judge walkthrough</span><Sparkles size={14} />
      </button>
      {open && (
        <div className="demo-guide-backdrop" onMouseDown={() => setOpen(false)}>
          <aside className="demo-guide" role="dialog" aria-modal="true" aria-labelledby="demo-guide-title" onMouseDown={(event) => event.stopPropagation()}>
            <header><div><span className="demo-guide__icon"><Presentation size={20} /></span><div><small>Presentation mode</small><h2 id="demo-guide-title">The 90-second Vera story</h2></div></div><button type="button" onClick={() => setOpen(false)} aria-label="Close walkthrough"><X size={20} /></button></header>
            <p className="demo-guide__intro">Show the judges one seamless loop: understand the individual, complete a valuable action, then turn that interaction into system-level insight.</p>
            <ol className="walkthrough-steps">
              <li><span>01</span><div><strong>Ask with your voice</strong><p>Choose “Find the right hospital,” “Lower my medication cost,” or say it naturally. Watch Vera listen, reason, and respond.</p><button type="button" onClick={() => { onNavigate("member"); setOpen(false); }}><MessageCircle size={14} /> Open member experience</button></div></li>
              <li><span>02</span><div><strong>Move from answer to action</strong><p>Expand “See how this works,” then start the switch. Vera closes the loop instead of creating another handoff.</p></div></li>
              <li><span>03</span><div><strong>Reveal the learning system</strong><p>Open Friction Intelligence to show value, journey barriers, portfolio wellness, inclusive access, and privacy-preserving signals.</p><button type="button" onClick={() => { onNavigate("insights"); setOpen(false); }}><ChartNoAxesCombined size={14} /> Open business insights</button></div></li>
            </ol>
            <div className="scorecard-fit"><strong>Built for the scorecard</strong><span><Check size={13} /> Clear problem</span><span><Check size={13} /> Differentiated</span><span><Check size={13} /> Measurable value</span><span><Check size={13} /> Feasible</span></div>
            <button className="demo-guide__start" type="button" onClick={() => { onNavigate("member"); setOpen(false); }}>Start the walkthrough <ArrowRight size={17} /></button>
          </aside>
        </div>
      )}
    </>
  );
}
