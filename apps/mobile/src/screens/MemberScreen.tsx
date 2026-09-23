import { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { demoScenarios, factCheckPrompt, type ActionCompletion, type ActionPlan, type ChatMessage, type MemberProfile, type WellnessDeviceId } from "@vera/core";
import { memberProfiles, profilePortrait } from "../memberProfiles";
import { colors, minTouch, safariWeb } from "../theme";

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
  const [facilityId, setFacilityId] = useState(plan.facilities?.[0]?.id);

  return (
    <View style={styles.planCard}>
      <Text style={styles.planEyebrow}>{plan.eyebrow}</Text>
      <Text style={styles.planTitle}>{plan.title}</Text>
      <Text style={styles.planSummary}>{plan.summary}</Text>
      {plan.facts?.slice(0, 3).map((fact) => (
        <Text key={fact.label} style={styles.planFact}>
          {fact.label}: {fact.value}
        </Text>
      ))}
      {plan.devices?.length ? (
        <View style={styles.deviceRow}>
          {plan.devices.map((device) => {
            const selected = deviceIds.includes(device.id);
            return (
              <Pressable
                key={device.id}
                style={[styles.deviceChip, selected && styles.deviceChipSelected]}
                onPress={() =>
                  setDeviceIds((current) =>
                    current.includes(device.id) ? current.filter((item) => item !== device.id) : [...current, device.id],
                  )
                }
              >
                <Text style={styles.deviceChipText}>{device.label}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      {plan.facilities?.length ? (
        <View style={styles.deviceRow}>
          {plan.facilities.map((facility) => {
            const selected = facilityId === facility.id;
            return (
              <Pressable
                key={facility.id}
                style={[styles.deviceChip, selected && styles.deviceChipSelected]}
                onPress={() => setFacilityId(facility.id)}
              >
                <Text style={styles.deviceChipText}>{facility.name.split(" ")[0]}</Text>
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
                  ? { facilityId, locationMethod: "ip" }
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

interface MemberScreenProps {
  profile: MemberProfile;
  messages: ChatMessage[];
  isThinking: boolean;
  completedActions: Set<string>;
  linkedDevices: WellnessDeviceId[];
  locationMethod: "ip" | "gps";
  onSelectProfile: (profile: MemberProfile) => void;
  onSend: (message: string) => void;
  onCompleteAction: (plan: ActionPlan, extras?: ActionCompletion) => void;
}

export function MemberScreen({
  profile,
  messages,
  isThinking,
  completedActions,
  linkedDevices,
  locationMethod,
  onSelectProfile,
  onSend,
  onCompleteAction,
}: MemberScreenProps) {
  const [draft, setDraft] = useState("");

  const submit = () => {
    const text = draft.trim();
    if (!text || isThinking) return;
    setDraft("");
    onSend(text);
  };

  return (
    <View style={styles.flex}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.profileRow}>
        {memberProfiles.map((item) => {
          const active = item.id === profile.id;
          return (
            <Pressable key={item.id} style={[styles.profileChip, active && styles.profileChipActive]} onPress={() => onSelectProfile(item)}>
              <Image source={profilePortrait(item.id)} style={styles.profileAvatar} />
              <Text style={styles.profileName}>{item.firstName}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.contextPanel}>
        <Text style={styles.contextTitle}>
          {profile.greeting}, {profile.fullName}
        </Text>
        <Text style={styles.contextLine}>
          {profile.age} · {profile.genderLabel} · {profile.plan}
        </Text>
        <Text style={styles.contextLine}>
          {profile.city}, {profile.region} · Location {locationMethod.toUpperCase()}
        </Text>
        <Text style={styles.contextLine}>
          Wellness · {linkedDevices.length ? `${linkedDevices.length} device(s) linked` : "Not linked"}
        </Text>
      </View>

      <ScrollView style={[styles.feed, safariWeb]} contentContainerStyle={styles.feedContent} keyboardShouldPersistTaps="handled">
        <View style={styles.proactive}>
          <Text style={styles.proactiveTitle}>5 opportunities found for you</Text>
          <Text style={styles.proactiveText}>Benefit, care, hospital, wellness, and preference signals—not an average member.</Text>
        </View>
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
                {message.factCheck.sources.slice(0, 2).map((source) => (
                  <Text key={source.name} style={styles.factSource}>
                    {source.name} · {source.organization}
                  </Text>
                ))}
              </View>
            ) : null}
            {message.plan ? (
              <PlanCard
                plan={message.plan}
                completed={completedActions.has(message.plan.id)}
                onComplete={(extras) => onCompleteAction(message.plan!, extras)}
              />
            ) : null}
          </View>
        ))}
        {isThinking ? (
          <View style={styles.thinkingRow}>
            <ActivityIndicator color={colors.blue600} />
            <Text style={styles.thinkingText}>Reviewing the whole journey…</Text>
          </View>
        ) : null}
      </ScrollView>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.promptRow}>
        {demoScenarios.map((scenario) => (
          <Pressable key={scenario.id} style={styles.promptChip} onPress={() => onSend(scenario.prompt)} disabled={isThinking}>
            <Text style={styles.promptChipText}>{scenario.shortLabel}</Text>
          </Pressable>
        ))}
        <Pressable style={styles.promptChip} onPress={() => onSend(factCheckPrompt.prompt)} disabled={isThinking}>
          <Text style={styles.promptChipText}>{factCheckPrompt.shortLabel}</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.composer}>
        <TextInput
          style={styles.input}
          placeholder="Ask about care, cost, coverage…"
          placeholderTextColor={colors.ink500}
          value={draft}
          onChangeText={setDraft}
          editable={!isThinking}
          onSubmitEditing={submit}
          returnKeyType="send"
          multiline={false}
        />
        <Pressable style={styles.sendButton} onPress={submit} disabled={isThinking || !draft.trim()}>
          <Text style={styles.sendButtonText}>Send</Text>
        </Pressable>
      </View>
      <Pressable style={styles.humanHelp} onPress={() => onSend("Please connect me with a human care advocate.")}>
        <Text style={styles.humanHelpText}>Human help</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  profileRow: { paddingHorizontal: 12, gap: 8, paddingBottom: 8 },
  profileChip: {
    alignItems: "center",
    padding: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    minWidth: 72,
    backgroundColor: colors.surface,
  },
  profileChipActive: { borderColor: colors.blue600, backgroundColor: "#eef1ff" },
  profileAvatar: { width: 44, height: 44, borderRadius: 22 },
  profileName: { color: colors.ink900, fontSize: 12, marginTop: 4, fontWeight: "600" },
  contextPanel: {
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 4,
  },
  contextTitle: { color: colors.ink900, fontWeight: "700", fontSize: 14 },
  contextLine: { color: colors.ink700, fontSize: 12 },
  feed: { flex: 1 },
  feedContent: { padding: 12, gap: 12, paddingBottom: 16 },
  proactive: {
    backgroundColor: "#eef1ff",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  proactiveTitle: { color: colors.ink900, fontWeight: "700" },
  proactiveText: { color: colors.ink700, fontSize: 12, marginTop: 4, lineHeight: 17 },
  userBubbleWrap: { alignItems: "flex-end" },
  assistantBubbleWrap: { alignItems: "flex-start" },
  userBubble: {
    backgroundColor: colors.blue600,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: "90%",
  },
  assistantBubble: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    maxWidth: "95%",
    borderWidth: 1,
    borderColor: colors.line,
  },
  userText: { color: "#fff", fontSize: 15, lineHeight: 21 },
  assistantText: { color: colors.ink900, fontSize: 15, lineHeight: 21 },
  factCard: {
    marginTop: 8,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.line,
    maxWidth: "95%",
  },
  factVerdict: { color: colors.blue600, fontWeight: "700", marginBottom: 4 },
  factClaim: { color: colors.ink900, fontWeight: "600", marginBottom: 6 },
  factFinding: { color: colors.ink700, fontSize: 13, lineHeight: 18 },
  factSource: { color: colors.ink500, fontSize: 11, marginTop: 4 },
  planCard: {
    marginTop: 8,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.mint500,
    maxWidth: "95%",
  },
  planEyebrow: { color: colors.blue600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.6 },
  planTitle: { color: colors.ink900, fontSize: 16, fontWeight: "700", marginTop: 4 },
  planSummary: { color: colors.ink700, fontSize: 13, marginTop: 6, lineHeight: 18 },
  planFact: { color: colors.ink700, fontSize: 12, marginTop: 4 },
  deviceRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  deviceChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: colors.surfaceSoft,
  },
  deviceChipSelected: { borderColor: colors.blue600, backgroundColor: "#eef1ff" },
  deviceChipText: { color: colors.ink900, fontSize: 12 },
  primaryButton: {
    marginTop: 12,
    backgroundColor: colors.blue600,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    ...minTouch,
  },
  primaryButtonText: { color: "#fff", fontWeight: "700" },
  completedLabel: { marginTop: 10, color: colors.ink500, fontSize: 12 },
  thinkingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  thinkingText: { color: colors.ink500 },
  promptRow: { paddingHorizontal: 12, gap: 8, paddingBottom: 8 },
  promptChip: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.line,
    ...minTouch,
  },
  promptChipText: { color: colors.ink900, fontSize: 12, fontWeight: "600" },
  composer: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: colors.page,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "web" ? 14 : 12,
    color: colors.ink900,
    borderWidth: 1,
    borderColor: colors.line,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: colors.mint500,
    borderRadius: 14,
    paddingHorizontal: 16,
    justifyContent: "center",
    ...minTouch,
  },
  sendButtonText: { color: colors.navy950, fontWeight: "700" },
  humanHelp: { alignItems: "center", paddingBottom: 8, ...minTouch },
  humanHelpText: { color: colors.blue600, fontSize: 12, fontWeight: "600" },
});
