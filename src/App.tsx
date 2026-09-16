import { BarChart3, ChevronDown, LockKeyhole, Menu, MessageCircle, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { BrandMark } from "./components/BrandMark";
import { DemoGuide } from "./components/DemoGuide";
import { InsightsDashboard } from "./components/InsightsDashboard";
import { MemberExperience } from "./components/MemberExperience";
import { actionConfirmations, demoScenarios, getDemoReply, initialMessages } from "./data/demoData";
import { useSpeechOutput } from "./hooks/useBrowserVoice";
import { requestVeraReply, type ConversationHistoryItem } from "./lib/api";
import type { ActionPlan, ChatMessage, ExperienceView } from "./types";

function createMessageId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function App() {
  const [view, setView] = useState<ExperienceView>("member");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isThinking, setIsThinking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  const requestRef = useRef<AbortController | null>(null);
  const { isSpeaking, speak, stop } = useSpeechOutput(speechEnabled);

  useEffect(
    () => () => {
      requestRef.current?.abort();
    },
    [],
  );

  const navigate = (nextView: ExperienceView) => {
    setView(nextView);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSend = useCallback(
    async (rawMessage: string) => {
      const text = rawMessage.trim();
      if (!text || isThinking) return;

      stop();
      const history: ConversationHistoryItem[] = messages.slice(-8).map((message) => ({
        role: message.role,
        content: message.text,
      }));
      const userMessage: ChatMessage = {
        id: createMessageId("user"),
        role: "user",
        text,
        timestamp: "Just now",
      };
      setMessages((current) => [...current, userMessage]);
      setIsThinking(true);

      const controller = new AbortController();
      requestRef.current = controller;
      let responseText: string;
      let plan: ActionPlan | undefined;

      try {
        const [reply] = await Promise.all([
          requestVeraReply(text, history, controller.signal),
          new Promise((resolve) => window.setTimeout(resolve, 550)),
        ]);
        responseText = reply.text;
        plan = reply.planId
          ? demoScenarios.find((scenario) => scenario.id === reply.planId)?.plan
          : undefined;
      } catch (error) {
        if (controller.signal.aborted) return;
        console.warn("Vera API unavailable; continuing in on-device demo mode.", error);
        const fallback = getDemoReply(text);
        responseText = fallback.text;
        plan = fallback.plan;
      } finally {
        if (requestRef.current === controller) {
          requestRef.current = null;
          setIsThinking(false);
        }
      }

      if (controller.signal.aborted) return;
      const assistantMessage: ChatMessage = {
        id: createMessageId("vera"),
        role: "assistant",
        text: responseText,
        timestamp: "Just now",
        plan,
      };
      setMessages((current) => [...current, assistantMessage]);
      speak(responseText);
    },
    [isThinking, messages, speak, stop],
  );

  const handleCompleteAction = useCallback(
    (plan: ActionPlan) => {
      if (completedActions.has(plan.id)) return;
      setCompletedActions((current) => new Set(current).add(plan.id));
      const confirmation = actionConfirmations[plan.id];
      const message: ChatMessage = {
        id: createMessageId("action"),
        role: "assistant",
        text: confirmation,
        timestamp: "Action recorded just now",
      };
      setMessages((current) => [...current, message]);
      speak(confirmation);
    },
    [completedActions, speak],
  );

  const toggleSpeech = () => {
    if (speechEnabled) stop();
    setSpeechEnabled((current) => !current);
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <button className="header-brand-button" type="button" onClick={() => navigate("member")} aria-label="Go to Vera member experience">
          <BrandMark />
        </button>
        <nav className={`primary-nav ${mobileMenuOpen ? "primary-nav--open" : ""}`} aria-label="Primary navigation">
          <button className={view === "member" ? "primary-nav__item--active" : ""} type="button" onClick={() => navigate("member")} aria-current={view === "member" ? "page" : undefined}><MessageCircle size={17} /> Member experience</button>
          <button className={view === "insights" ? "primary-nav__item--active" : ""} type="button" onClick={() => navigate("insights")} aria-current={view === "insights" ? "page" : undefined}><BarChart3 size={17} /> Friction intelligence</button>
        </nav>
        <div className="header-actions">
          <span className="header-privacy"><LockKeyhole size={14} /> Protected session</span>
          <button className="profile-button" type="button"><span>JL</span><span className="profile-button__copy"><strong>Jordan</strong><small>Member</small></span><ChevronDown size={14} /></button>
          <button className="mobile-menu-button" type="button" onClick={() => setMobileMenuOpen((open) => !open)} aria-label="Toggle navigation" aria-expanded={mobileMenuOpen}>{mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}</button>
        </div>
      </header>

      {view === "member" ? (
        <MemberExperience
          messages={messages}
          isThinking={isThinking}
          isSpeaking={isSpeaking}
          speechEnabled={speechEnabled}
          completedActions={completedActions}
          onSend={handleSend}
          onCompleteAction={handleCompleteAction}
          onToggleSpeech={toggleSpeech}
        />
      ) : (
        <InsightsDashboard />
      )}

      <DemoGuide onNavigate={navigate} />
    </div>
  );
}

export default App;
