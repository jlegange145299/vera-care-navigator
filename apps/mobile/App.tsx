import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  demoScenarios,
  factCheckPrompt,
  getActionConfirmation,
  getDemoReply,
  type ActionCompletion,
  type ActionPlan,
  type ChatMessage,
  type MemberProfile,
  type WellnessDeviceId,
} from "@vera/core";
import { requestVeraReply, type ConversationHistoryItem } from "./src/lib/api";
import {
  createWelcomeMessage,
  defaultMobileProfile,
  memberProfiles,
  profilePortrait,
} from "./src/memberProfiles";

function createMessageId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function verdictLabel(verdict: string) {
  if (verdict === "true") return "True";
  if (verdict === "partly-true") return "Partly true";
  if (verdict === "false") return "False";
  return "Unverified";
}

function PlanCard({
  plan,
  completed,
  onComplete,
}: {
  plan: ActionPlan;
  completed: boolean;
  onComplete: (extras?: ActionCompletion) => void;
}) {
  const [deviceIds, setDeviceIds] = useState<WellnessDeviceId[]>([]);

  const toggleDevice = (id: WellnessDeviceId) => {
    setDeviceIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  return (
    <View style={styles.planCard}>
      <Text style={styles.planEyebrow}>{plan.eyebrow}</Text>
      <Text style={styles.planTitle}>{plan.title}</Text>
      <Text style={styles.planSummary}>{plan.summary}</Text>
      {plan.devices?.length ? (
        <View style={styles.deviceRow}>
          {plan.devices.map((device) => {
            const selected = deviceIds.includes(device.id);
            return (
              <Pressable
                key={device.id}
                style={[styles.deviceChip, selected && styles.deviceChipSelected]}
                onPress={() => toggleDevice(device.id)}
              >
                <Text style={styles.deviceChipText}>{device.label}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      {!completed ? (
        <Pressable
          style={styles.primaryButton}
          onPress={() =>
            onComplete(
              plan.id === "wellness-connect"
                ? { deviceIds }
                : plan.id === "hospital-prereg"
                  ? { facilityId: plan.facilities?.[0]?.id, locationMethod: "ip" }
                  : undefined,
            )
          }
        >
          <Text style={styles.primaryButtonText}>{plan.cta}</Text>
        </Pressable>
      ) : (
        <Text style={styles.completedLabel}>Action recorded (simulated)</Text>
      )}
    </View>
  );
}

export default function App() {
  const [profile, setProfile] = useState<MemberProfile>(defaultMobileProfile);
  const [messages, setMessages] = useState<ChatMessage[]>([createWelcomeMessage(defaultMobileProfile)]);
  const [draft, setDraft] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set());
  const requestRef = useRef<AbortController | null>(null);

  const quickPrompts = useMemo(
    () => [factCheckPrompt.prompt, ...demoScenarios.slice(0, 4).map((scenario) => scenario.prompt)],
    [],
  );

  const selectProfile = (next: MemberProfile) => {
    if (next.id === profile.id) return;
    requestRef.current?.abort();
    setProfile(next);
    setMessages([createWelcomeMessage(next)]);
    setCompletedActions(new Set());
    setIsThinking(false);
  };

  const handleCompleteAction = useCallback(
    (plan: ActionPlan, extras: ActionCompletion = {}) => {
      if (completedActions.has(plan.id)) return;
      setCompletedActions((current) => new Set(current).add(plan.id));
      const confirmation = getActionConfirmation(plan.id, extras);
      setMessages((current) => [
        ...current,
        {
          id: createMessageId("action"),
          role: "assistant",
          text: confirmation,
          timestamp: "Just now",
        },
      ]);
    },
    [completedActions],
  );

  const handleSend = useCallback(
    async (rawMessage: string) => {
      const text = rawMessage.trim();
      if (!text || isThinking) return;

      const history: ConversationHistoryItem[] = messages.slice(-8).map((message) => ({
        role: message.role,
        content: message.text,
      }));

      setMessages((current) => [
        ...current,
        { id: createMessageId("user"), role: "user", text, timestamp: "Just now" },
      ]);
      setDraft("");
      setIsThinking(true);

      const controller = new AbortController();
      requestRef.current = controller;

      let responseText: string;
      let plan: ActionPlan | undefined;
      let factCheck: ChatMessage["factCheck"];

      try {
        const reply = await requestVeraReply(text, history, controller.signal);
        responseText = reply.text;
        factCheck = reply.factCheck;
        plan = reply.planId
          ? completedActions.has(reply.planId)
            ? undefined
            : demoScenarios.find((scenario) => scenario.id === reply.planId)?.plan
          : undefined;
      } catch {
        if (controller.signal.aborted) return;
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
      setMessages((current) => [
        ...current,
        {
          id: createMessageId("vera"),
          role: "assistant",
          text: responseText,
          timestamp: "Just now",
          plan,
          factCheck,
        },
      ]);
    },
    [completedActions, isThinking, messages],
  );

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Vera</Text>
          <Text style={styles.headerSubtitle}>Member experience · React Native</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.profileRow}>
          {memberProfiles.map((item) => {
            const active = item.id === profile.id;
            return (
              <Pressable
                key={item.id}
                style={[styles.profileChip, active && styles.profileChipActive]}
                onPress={() => selectProfile(item)}
              >
                <Image source={profilePortrait(item.id)} style={styles.profileAvatar} />
                <Text style={styles.profileName}>{item.firstName}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.contextBar}>
          <Text style={styles.contextText}>
            {profile.fullName} · {profile.plan} · {profile.city}, {profile.region}
          </Text>
        </View>

        <ScrollView style={styles.feed} contentContainerStyle={styles.feedContent}>
          {messages.map((message) => (
            <View key={message.id} style={message.role === "user" ? styles.userBubbleWrap : styles.assistantBubbleWrap}>
              <View style={message.role === "user" ? styles.userBubble : styles.assistantBubble}>
                <Text style={message.role === "user" ? styles.userText : styles.assistantText}>{message.text}</Text>
              </View>
              {message.factCheck ? (
                <View style={styles.factCard}>
                  <Text style={styles.factVerdict}>{verdictLabel(message.factCheck.verdict)}</Text>
                  <Text style={styles.factClaim}>{message.factCheck.claim}</Text>
                  <Text style={styles.factFinding}>{message.factCheck.finding}</Text>
                </View>
              ) : null}
              {message.plan ? (
                <PlanCard
                  plan={message.plan}
                  completed={completedActions.has(message.plan.id)}
                  onComplete={(extras) => handleCompleteAction(message.plan!, extras)}
                />
              ) : null}
            </View>
          ))}
          {isThinking ? (
            <View style={styles.thinkingRow}>
              <ActivityIndicator color="#5eead4" />
              <Text style={styles.thinkingText}>Vera is thinking…</Text>
            </View>
          ) : null}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promptRow}>
          {quickPrompts.map((prompt) => (
            <Pressable key={prompt} style={styles.promptChip} onPress={() => handleSend(prompt)}>
              <Text style={styles.promptChipText} numberOfLines={2}>
                {prompt}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.composer}>
          <TextInput
            style={styles.input}
            placeholder="Ask Vera…"
            placeholderTextColor="#94a3b8"
            value={draft}
            onChangeText={setDraft}
            editable={!isThinking}
            onSubmitEditing={() => handleSend(draft)}
            returnKeyType="send"
          />
          <Pressable style={styles.sendButton} onPress={() => handleSend(draft)} disabled={isThinking || !draft.trim()}>
            <Text style={styles.sendButtonText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0f172a" },
  flex: { flex: 1 },
  header: { paddingTop: Platform.OS === "web" ? 16 : 52, paddingHorizontal: 16, paddingBottom: 8 },
  headerTitle: { color: "#f8fafc", fontSize: 24, fontWeight: "700" },
  headerSubtitle: { color: "#94a3b8", marginTop: 4, fontSize: 13 },
  profileRow: { paddingHorizontal: 12, gap: 8, paddingBottom: 8 },
  profileChip: {
    alignItems: "center",
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#334155",
    minWidth: 72,
  },
  profileChipActive: { borderColor: "#5eead4", backgroundColor: "#134e4a" },
  profileAvatar: { width: 44, height: 44, borderRadius: 22 },
  profileName: { color: "#e2e8f0", fontSize: 12, marginTop: 4 },
  contextBar: { paddingHorizontal: 16, paddingBottom: 8 },
  contextText: { color: "#cbd5e1", fontSize: 12 },
  feed: { flex: 1 },
  feedContent: { padding: 16, gap: 12, paddingBottom: 24 },
  userBubbleWrap: { alignItems: "flex-end" },
  assistantBubbleWrap: { alignItems: "flex-start" },
  userBubble: { backgroundColor: "#2563eb", borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10, maxWidth: "90%" },
  assistantBubble: {
    backgroundColor: "#1e293b",
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: "95%",
    borderWidth: 1,
    borderColor: "#334155",
  },
  userText: { color: "#fff", fontSize: 15, lineHeight: 21 },
  assistantText: { color: "#e2e8f0", fontSize: 15, lineHeight: 21 },
  factCard: {
    marginTop: 8,
    backgroundColor: "#172554",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#1d4ed8",
    maxWidth: "95%",
  },
  factVerdict: { color: "#93c5fd", fontWeight: "700", marginBottom: 4 },
  factClaim: { color: "#f8fafc", fontWeight: "600", marginBottom: 6 },
  factFinding: { color: "#cbd5e1", fontSize: 13, lineHeight: 18 },
  planCard: {
    marginTop: 8,
    backgroundColor: "#134e4a",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: "#14b8a6",
    maxWidth: "95%",
  },
  planEyebrow: { color: "#99f6e4", fontSize: 11, textTransform: "uppercase", letterSpacing: 0.6 },
  planTitle: { color: "#f0fdfa", fontSize: 16, fontWeight: "700", marginTop: 4 },
  planSummary: { color: "#ccfbf1", fontSize: 13, marginTop: 6, lineHeight: 18 },
  deviceRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  deviceChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#5eead4",
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deviceChipSelected: { backgroundColor: "#0f766e" },
  deviceChipText: { color: "#ecfeff", fontSize: 12 },
  primaryButton: {
    marginTop: 12,
    backgroundColor: "#0f766e",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  primaryButtonText: { color: "#f0fdfa", fontWeight: "700" },
  completedLabel: { marginTop: 10, color: "#99f6e4", fontSize: 12 },
  thinkingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  thinkingText: { color: "#94a3b8" },
  promptRow: { paddingHorizontal: 12, gap: 8, paddingBottom: 8 },
  promptChip: {
    maxWidth: 220,
    backgroundColor: "#1e293b",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  promptChipText: { color: "#e2e8f0", fontSize: 12 },
  composer: {
    flexDirection: "row",
    gap: 8,
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#334155",
    backgroundColor: "#0b1220",
  },
  input: {
    flex: 1,
    backgroundColor: "#1e293b",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "web" ? 12 : 10,
    color: "#f8fafc",
    borderWidth: 1,
    borderColor: "#334155",
  },
  sendButton: {
    backgroundColor: "#14b8a6",
    borderRadius: 14,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  sendButtonText: { color: "#042f2e", fontWeight: "700" },
});
