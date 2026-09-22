import { useCallback, useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import {
  ArrowUp,
  Bot,
  CheckCircle2,
  Headphones,
  Info,
  Mic,
  ShieldCheck,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { demoScenarios } from "../data/demoData";
import { factCheckPrompt } from "../data/factCheck";
import { useVoiceInput } from "../hooks/useBrowserVoice";
import type { ActionCompletion, ActionPlan, ChatMessage, MemberProfile, WellnessDeviceId } from "../types";
import { ActionCard } from "./ActionCard";
import { FactCheckCard } from "./FactCheckCard";
import { HospitalPrepCard } from "./HospitalPrepCard";
import { WellnessPulse } from "./WellnessPulse";

interface MemberExperienceProps {
  profile: MemberProfile;
  messages: ChatMessage[];
  isThinking: boolean;
  isSpeaking: boolean;
  speechEnabled: boolean;
  completedActions: Set<string>;
  linkedDevices: WellnessDeviceId[];
  locationMethod: "ip" | "gps";
  onSend: (message: string) => void;
  onCompleteAction: (plan: ActionPlan, extras?: ActionCompletion) => void;
  onToggleSpeech: () => void;
}

export function MemberExperience({
  profile,
  messages,
  isThinking,
  isSpeaking,
  speechEnabled,
  completedActions,
  linkedDevices,
  locationMethod,
  onSend,
  onCompleteAction,
  onToggleSpeech,
}: MemberExperienceProps) {
  const [draft, setDraft] = useState("");
  const feedRef = useRef<HTMLDivElement>(null);
  const handleVoiceResult = useCallback(
    (transcript: string) => {
      setDraft("");
      onSend(transcript);
    },
    [onSend],
  );
  const { error, isListening, isSupported, toggle } = useVoiceInput(handleVoiceResult);

  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isThinking]);

  const submit = (event?: FormEvent) => {
    event?.preventDefault();
    const message = draft.trim();
    if (!message || isThinking) return;
    setDraft("");
    onSend(message);
  };

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <main className="member-page">
      <section className="member-context" aria-label="Synthetic member context">
        <div className="member-context__welcome">
          <img className="member-avatar" src={profile.portraitSrc} alt="" />
          <div><span>{profile.greeting}</span><strong>{profile.fullName}</strong></div>
        </div>
        <div className="context-divider" />
        <div className="context-item"><span>Profile</span><strong>{profile.age} · {profile.genderLabel}</strong></div>
        <div className="context-item"><span>Plan</span><strong>{profile.plan}</strong></div>
        <div className="context-item"><span>Coverage</span><strong>{profile.coverage}</strong></div>
        <div className="context-item"><span>Location</span><strong>{profile.city}, {profile.region} · {locationMethod.toUpperCase()}</strong></div>
        <div className="context-item"><span>Wellness</span><strong>{linkedDevices.length ? `${linkedDevices.length} device${linkedDevices.length === 1 ? "" : "s"} linked` : "Not linked"}</strong></div>
        <div className="context-item context-item--verified"><ShieldCheck size={16} /><span><strong>Identity verified</strong><small>Synthetic profile</small></span></div>
      </section>

      <section className="experience-shell">
        <section className="conversation-panel" aria-label="Conversation with Vera">
          <header className="conversation-header">
            <div>
              <span className="conversation-header__icon"><Sparkles size={18} /></span>
              <div><strong>Ask Vera</strong><small>Grounded in your benefits and preferences</small></div>
            </div>
            <div className="conversation-header__actions">
              <span className="secure-label"><ShieldCheck size={14} /> Private session</span>
              <button
                className="icon-button"
                type="button"
                onClick={onToggleSpeech}
                aria-label={speechEnabled ? "Turn voice responses off" : "Turn voice responses on"}
                aria-pressed={speechEnabled}
              >
                {speechEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
            </div>
          </header>

          <div className="conversation-feed" ref={feedRef} aria-live="polite">
            <div className="proactive-insight">
              <span><Sparkles size={15} /></span>
              <div><strong>5 opportunities found for you</strong><p>Vera connects benefit, care, hospital arrival, wellness, and preference signals—never an “average member.”</p></div>
              <span className="proactive-insight__new">New</span>
            </div>

            {messages.map((message) => (
              <div className={`message-row message-row--${message.role}`} key={message.id}>
                {message.role === "assistant" && <span className="message-avatar"><Bot size={16} /></span>}
                <div className="message-content">
                  <div className="message-bubble">
                    <p>{message.text}</p>
                  </div>
                  {message.role === "assistant" && message.plan && (
                    <div className="response-avatar-cameo" aria-label={`Vera answered ${profile.firstName}`}>
                      <img src={profile.portraitSrc} alt="" />
                      <span>Vera</span>
                    </div>
                  )}
                  {message.factCheck && <FactCheckCard result={message.factCheck} />}
                  {message.plan?.facilities ? (
                    <HospitalPrepCard
                      plan={message.plan}
                      completed={completedActions.has(message.plan.id)}
                      onComplete={onCompleteAction}
                    />
                  ) : (
                    message.plan && (
                    <ActionCard
                      plan={message.plan}
                      completed={completedActions.has(message.plan.id)}
                      onComplete={onCompleteAction}
                    />
                    )
                  )}
                  {message.plan?.id === "wellness-connect" && completedActions.has("wellness-connect") && (
                    <WellnessPulse />
                  )}
                  <span className="message-time">
                    {message.role === "assistant" && <CheckCircle2 size={12} />} {message.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="message-row message-row--assistant">
                <span className="message-avatar"><Bot size={16} /></span>
                <div className="message-content">
                  <div className="message-bubble message-bubble--thinking">
                    <span /><span /><span />
                    <small>Reviewing the whole journey</small>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="conversation-controls">
            <div className="prompt-row" aria-label="Suggested questions">
              {demoScenarios.map((scenario) => (
                <button type="button" key={scenario.id} onClick={() => onSend(scenario.prompt)} disabled={isThinking}>
                  {scenario.shortLabel}
                </button>
              ))}
              <button type="button" onClick={() => onSend(factCheckPrompt.prompt)} disabled={isThinking}>
                {factCheckPrompt.shortLabel}
              </button>
            </div>

            <form className="composer" onSubmit={submit}>
              <button
                className={`composer__voice ${isListening ? "composer__voice--active" : ""}`}
                type="button"
                onClick={toggle}
                disabled={!isSupported || isThinking}
                aria-label={isListening ? "Stop listening" : "Speak your question"}
              >
                <Mic size={19} />
              </button>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={handleComposerKeyDown}
                rows={1}
                placeholder={isListening ? "Listening…" : "Ask about care, cost, coverage, or check a health claim…"}
                aria-label="Message Vera"
              />
              <button className="composer__send" type="submit" disabled={!draft.trim() || isThinking} aria-label="Send message">
                <ArrowUp size={20} />
              </button>
            </form>

            <div className="conversation-footnote">
              <span><Info size={13} /> Demo uses synthetic data. Fact-checks cite CDC, NIH, and AHA library sources. Vera is not medical advice or an emergency service.</span>
              <button type="button" onClick={() => onSend("Please connect me with a human care advocate.")}>
                <Headphones size={13} /> Human help
              </button>
            </div>
            {error && <p className="voice-error" role="alert">{error}</p>}
          </div>
        </section>
      </section>
    </main>
  );
}
