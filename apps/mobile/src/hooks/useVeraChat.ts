import { useCallback, useRef, useState } from "react";
import { demoScenarios, getActionConfirmation, getDemoReply, type ActionCompletion, type ActionPlan, type ChatMessage, type MemberProfile, type WellnessDeviceId } from "@vera/core";
import { isRemoteVeraApiConfigured, requestVeraReply, type ConversationHistoryItem } from "../lib/api";
import { createWelcomeMessage } from "../memberProfiles";

function createMessageId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function buildDemoReply(text: string, completedActions: Set<string>) {
  const fallback = getDemoReply(text);
  const plan = fallback.plan && completedActions.has(fallback.plan.id) ? undefined : fallback.plan;
  return {
    responseText: fallback.text,
    plan,
    factCheck: fallback.factCheck,
  };
}

export function useVeraChat(initialProfile: MemberProfile) {
  const [profile, setProfile] = useState(initialProfile);
  const [messages, setMessages] = useState<ChatMessage[]>([createWelcomeMessage(initialProfile)]);
  const [isThinking, setIsThinking] = useState(false);
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  const [linkedDevices, setLinkedDevices] = useState<WellnessDeviceId[]>([]);
  const [locationMethod, setLocationMethod] = useState<"ip" | "gps">("ip");
  const requestRef = useRef<AbortController | null>(null);
  const isThinkingRef = useRef(false);

  const selectProfile = useCallback((next: MemberProfile) => {
    if (next.id === profile.id) return;
    requestRef.current?.abort();
    setProfile(next);
    setMessages([createWelcomeMessage(next)]);
    setCompletedActions(new Set());
    setLinkedDevices([]);
    setLocationMethod("ip");
    isThinkingRef.current = false;
    setIsThinking(false);
  }, [profile.id]);

  const handleCompleteAction = useCallback((plan: ActionPlan, extras: ActionCompletion = {}) => {
    if (completedActions.has(plan.id)) return;
    setCompletedActions((current) => new Set(current).add(plan.id));
    if (plan.id === "wellness-connect") setLinkedDevices(extras.deviceIds ?? []);
    if (plan.id === "hospital-prereg" && extras.locationMethod) setLocationMethod(extras.locationMethod);
    const confirmation = getActionConfirmation(plan.id, extras);
    setMessages((current) => [
      ...current,
      { id: createMessageId("action"), role: "assistant", text: confirmation, timestamp: "Just now" },
    ]);
  }, [completedActions]);

  const handleSend = useCallback(async (rawMessage: string) => {
    const text = rawMessage.trim();
    if (!text || isThinkingRef.current) return;

    let history: ConversationHistoryItem[] = [];
    setMessages((current) => {
      history = current.slice(-8).map((message) => ({
        role: message.role,
        content: message.text,
      }));
      return [...current, { id: createMessageId("user"), role: "user", text, timestamp: "Just now" }];
    });

    isThinkingRef.current = true;
    setIsThinking(true);

    const controller = new AbortController();
    requestRef.current = controller;

    let responseText: string;
    let plan: ActionPlan | undefined;
    let factCheck: ChatMessage["factCheck"];

    try {
      if (isRemoteVeraApiConfigured()) {
        const reply = await requestVeraReply(text, history, controller.signal);
        responseText = reply.text;
        factCheck = reply.factCheck;
        plan = reply.planId
          ? completedActions.has(reply.planId)
            ? undefined
            : demoScenarios.find((scenario) => scenario.id === reply.planId)?.plan
          : undefined;
      } else {
        await new Promise((resolve) => setTimeout(resolve, 450));
        if (controller.signal.aborted) return;
        ({ responseText, plan, factCheck } = buildDemoReply(text, completedActions));
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      console.warn("Vera API unavailable; using on-device demo replies.", error);
      ({ responseText, plan, factCheck } = buildDemoReply(text, completedActions));
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        isThinkingRef.current = false;
        setIsThinking(false);
      }
    }

    if (controller.signal.aborted) return;
    setMessages((current) => [
      ...current,
      { id: createMessageId("vera"), role: "assistant", text: responseText, timestamp: "Just now", plan, factCheck },
    ]);
  }, [completedActions]);

  return {
    profile,
    messages,
    isThinking,
    completedActions,
    linkedDevices,
    locationMethod,
    selectProfile,
    handleSend,
    handleCompleteAction,
  };
}
