import { BarChart3, LockKeyhole, Menu, MessageCircle, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { BrandMark } from "./components/BrandMark";
import { DemoGuide } from "./components/DemoGuide";
import { InsightsDashboard } from "./components/InsightsDashboard";
import { MemberExperience } from "./components/MemberExperience";
import { ProfileSwitcher } from "./components/ProfileSwitcher";
import { demoScenarios, getActionConfirmation, getDemoReply } from "./data/demoData";
import { createWelcomeMessage, defaultMemberProfile } from "./data/memberProfiles";
import { useSpeechOutput } from "./hooks/useBrowserVoice";
import { requestVeraReply, type ConversationHistoryItem } from "./lib/api";
import type { ActionCompletion, ActionPlan, ChatMessage, ExperienceView, WellnessDeviceId } from "./types";

function createMessageId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function App() {
  const [view, setView] = useState<ExperienceView>("member");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profile, setProfile] = useState(defaultMemberProfile);
  const [messages, setMessages] = useState<ChatMessage[]>([createWelcomeMessage(defaultMemberProfile)]);
  const [isThinking, setIsThinking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  const [linkedDevices, setLinkedDevices] = useState<WellnessDeviceId[]>([]);
  const [locationMethod, setLocationMethod] = useState<"ip" | "gps">("ip");
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

  const selectProfile = (nextProfile: typeof profile) => {
    if (nextProfile.id === profile.id) return;
    requestRef.current?.abort();
    stop();
    setProfile(nextProfile);
    setMessages([createWelcomeMessage(nextProfile)]);
    setCompletedActions(new Set());
    setLinkedDevices([]);
    setLocationMethod("ip");
    setIsThinking(false);
    setView("member");
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
      let factCheck: ChatMessage["factCheck"];

      try {
        const [reply] = await Promise.all([
          requestVeraReply(text, history, controller.signal),
          new Promise((resolve) => window.setTimeout(resolve, 550)),
        ]);
        responseText = reply.text;
        factCheck = reply.factCheck;
        plan = reply.planId
          ? completedActions.has(reply.planId)
            ? undefined
            : demoScenarios.find((scenario) => scenario.id === reply.planId)?.plan
          : undefined;
      } catch (error) {
        if (controller.signal.aborted) return;
        console.warn("Vera API unavailable; continuing in on-device demo mode.", error);
        const fallback = getDemoReply(text);
        responseText = fallback.text;
        plan = fallback.plan;
        factCheck = fallback.factCheck;
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
        factCheck,
      };
      setMessages((current) => [...current, assistantMessage]);
      speak(responseText);
    },
    [isThinking, messages, completedActions, speak, stop],
  );

  const handleCompleteAction = useCallback(
    (plan: ActionPlan, extras: ActionCompletion = {}) => {
      if (completedActions.has(plan.id)) return;
      setCompletedActions((current) => new Set(current).add(plan.id));
      if (plan.id === "wellness-connect") setLinkedDevices(extras.deviceIds ?? []);
      if (plan.id === "hospital-prereg" && extras.locationMethod) setLocationMethod(extras.locationMethod);
      const confirmation = getActionConfirmation(plan.id, extras);
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
      <div className="vera-phone">
        <header className="app-header">
          <button className="header-brand-button" type="button" onClick={() => navigate("member")} aria-label="Go to Vera member experience">
            <BrandMark />
          </button>

          <div className="header-actions">
            <span className="header-privacy"><LockKeyhole size={14} /> Protected</span>
            <ProfileSwitcher profile={profile} onSelect={selectProfile} />
          </div>
        </header>

        <div className="app-content">
          {view === "member" ? (
            <MemberExperience
              profile={profile}
              messages={messages}
              isThinking={isThinking}
              isSpeaking={isSpeaking}
              speechEnabled={speechEnabled}
              completedActions={completedActions}
              linkedDevices={linkedDevices}
              locationMethod={locationMethod}
              onSend={handleSend}
              onCompleteAction={handleCompleteAction}
              onToggleSpeech={toggleSpeech}
            />
          ) : (
            <InsightsDashboard />
          )}
        </div>

        <nav className="bottom-nav" aria-label="Primary navigation">
          <button className={view === "member" ? "nav-tab nav-tab--active" : "nav-tab"} type="button" onClick={() => navigate("member")} aria-current={view === "member" ? "page" : undefined}>
            <MessageCircle size={17} />
            <span>Member</span>
          </button>
          <button className={view === "insights" ? "nav-tab nav-tab--active" : "nav-tab"} type="button" onClick={() => navigate("insights")} aria-current={view === "insights" ? "page" : undefined}>
            <BarChart3 size={17} />
            <span>Insights</span>
          </button>
        </nav>
      </div>

      <DemoGuide onNavigate={navigate} />
    </div>
  );
}

export default App;
