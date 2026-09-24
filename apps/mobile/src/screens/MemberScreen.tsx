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
import { colors, safariWeb } from "../theme";

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
  const profileIndex = Math.max(0, memberProfiles.findIndex((item) => item.id === profile.id));

  const cycleProfile = (delta: number) => {
    const next = memberProfiles[(profileIndex + delta + memberProfiles.length) % memberProfiles.length];
    onSelectProfile(next);
  };

  const submit = () => {
    const text = draft.trim();
    if (!text || isThinking) return;
    setDraft("");
    onSend(text);
  };

  return (
    <View style={styles.flex}>
      <View style={styles.profileCard}>
        <Pressable
          style={styles.profileNav}
          onPress={() => cycleProfile(-1)}
          accessibilityLabel="Previous member profile"
          hitSlop={8}
        >
          <Text style={styles.profileNavText}>‹</Text>
        </Pressable>

        <View style={styles.profileMain}>
          <Image source={profilePortrait(profile.id)} style={styles.profilePortrait} accessibilityLabel={profile.avatarLabel} />
          <View style={styles.profileCopy}>
            <Text style={styles.profileGreeting}>{profile.greeting}</Text>
            <Text style={styles.profileName}>{profile.fullName}</Text>
            <Text style={styles.profileMeta} numberOfLines={2}>
              {profile.age} · {profile.genderLabel} · {profile.plan}
            </Text>
            <Text style={styles.profileMeta} numberOfLines={1}>
              {profile.city}, {profile.region} · {locationMethod.toUpperCase()} ·{" "}
              {linkedDevices.length ? `${linkedDevices.length} device linked` : "Wellness not linked"}
            </Text>
          </View>
        </View>

        <Pressable
          style={styles.profileNav}
          onPress={() => cycleProfile(1)}
          accessibilityLabel="Next member profile"
          hitSlop={8}
        >
          <Text style={styles.profileNavText}>›</Text>
        </Pressable>
      </View>

      <Text style={styles.profilePager}>
        Profile {profileIndex + 1} of {memberProfiles.length} · {profile.avatarLabel}
      </Text>

      <ScrollView style={[styles.feed, safariWeb]} contentContainerStyle={styles.feedContent} keyboardShouldPersistTaps="handled">
        <View style={styles.proactive}>
          <Text style={styles.proactiveTitle}>5 opportunities found for you</Text>
          <Text style={styles.proactiveText}>Benefit, care, hospital, wellness, and preference signals—not an average member.</Text>
        </View>
        {messages.map((message) => (
          <View key={message.id} style={message.role === "user" ? styles.userBubbleWrap : styles.assistantBubbleWrap}>
            {message.role === "assistant" ? (
              <View style={styles.assistantRow}>
                <Image source={profilePortrait(profile.id)} style={styles.bubbleAvatar} accessibilityLabel="Vera guide" />
                <View style={styles.assistantBubble}>
                  <Text style={styles.assistantText}>{message.text}</Text>
                </View>
              </View>
            ) : (
              <View style={styles.userBubble}>
                <Text style={styles.userText}>{message.text}</Text>
              </View>
            )}
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
            <Image source={profilePortrait(profile.id)} style={styles.bubbleAvatar} accessibilityLabel="Vera guide" />
            <ActivityIndicator color={colors.brandBlue} />
            <Text style={styles.thinkingText}>Reviewing the whole journey…</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.promptWrap}>
        {demoScenarios.map((scenario) => (
          <Pressable
            key={scenario.id}
            style={({ pressed }) => [styles.promptChip, pressed && styles.promptChipPressed]}
            onPress={() => onSend(scenario.prompt)}
            disabled={isThinking}
            accessibilityRole="button"
          >
            <Text style={styles.promptChipText}>{scenario.shortLabel}</Text>
          </Pressable>
        ))}
        <Pressable
          style={({ pressed }) => [styles.promptChip, pressed && styles.promptChipPressed]}
          onPress={() => onSend(factCheckPrompt.prompt)}
          disabled={isThinking}
          accessibilityRole="button"
        >
          <Text style={styles.promptChipText}>{factCheckPrompt.shortLabel}</Text>
        </Pressable>
      </View>

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
  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 12,
    marginTop: 6,
    marginBottom: 2,
    paddingVertical: 6,
    paddingHorizontal: 2,
    borderRadius: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
  },
  profileNav: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  profileNavText: { color: colors.brandBlue, fontSize: 24, fontWeight: "300", lineHeight: 26 },
  profileMain: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10, minWidth: 0 },
  profilePortrait: { width: 46, height: 46, borderRadius: 23, borderWidth: 2, borderColor: colors.avatarRing },
  profileCopy: { flex: 1, minWidth: 0 },
  profileGreeting: { color: colors.ink500, fontSize: 10, lineHeight: 12 },
  profileName: { color: colors.ink900, fontWeight: "700", fontSize: 14, lineHeight: 17 },
  profileMeta: { color: colors.ink700, fontSize: 10, lineHeight: 13, marginTop: 1 },
  profilePager: {
    textAlign: "center",
    color: colors.ink500,
    fontSize: 9,
    fontWeight: "600",
    marginBottom: 4,
    paddingHorizontal: 12,
    lineHeight: 11,
  },
  feed: { flex: 1 },
  feedContent: { paddingHorizontal: 12, paddingBottom: 6, gap: 8 },
  proactive: {
    backgroundColor: colors.blueTint,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.line,
    borderLeftWidth: 3,
    borderLeftColor: colors.brandOrange,
    alignSelf: "stretch",
  },
  proactiveTitle: { color: colors.ink900, fontWeight: "700", fontSize: 12, lineHeight: 15 },
  proactiveText: { color: colors.ink700, fontSize: 10, marginTop: 2, lineHeight: 13 },
  userBubbleWrap: { alignItems: "flex-end" },
  assistantBubbleWrap: { alignItems: "flex-start", maxWidth: "100%" },
  assistantRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, maxWidth: "100%" },
  bubbleAvatar: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: colors.avatarRing },
  userBubble: {
    backgroundColor: colors.brandBlue,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: "90%",
  },
  assistantBubble: {
    flexShrink: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxWidth: "82%",
    borderWidth: 1,
    borderColor: colors.line,
  },
  userText: { color: colors.onPrimary, fontSize: 15, lineHeight: 20 },
  assistantText: { color: colors.ink900, fontSize: 15, lineHeight: 20 },
  factCard: {
    marginTop: 4,
    marginLeft: 36,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.line,
    maxWidth: "92%",
    alignSelf: "flex-start",
  },
  factVerdict: { color: colors.green700, fontWeight: "700", fontSize: 12, marginBottom: 2 },
  factClaim: { color: colors.ink900, fontWeight: "600", fontSize: 13, lineHeight: 17 },
  factFinding: { color: colors.ink700, fontSize: 12, lineHeight: 16, marginTop: 4 },
  factSource: { color: colors.ink500, fontSize: 10, marginTop: 3, lineHeight: 13 },
  planCard: {
    marginTop: 4,
    marginLeft: 36,
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.green700,
    maxWidth: "92%",
    alignSelf: "flex-start",
  },
  planEyebrow: { color: colors.brandBlue, fontSize: 10, textTransform: "uppercase", letterSpacing: 0.5 },
  planTitle: { color: colors.ink900, fontSize: 15, fontWeight: "700", marginTop: 2, lineHeight: 19 },
  planSummary: { color: colors.ink700, fontSize: 12, marginTop: 4, lineHeight: 16 },
  planFact: { color: colors.ink700, fontSize: 11, marginTop: 2, lineHeight: 14 },
  deviceRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  deviceChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: colors.surfaceSoft,
  },
  deviceChipSelected: { borderColor: colors.brandBlue, backgroundColor: colors.blueTint },
  deviceChipText: { color: colors.ink900, fontSize: 11 },
  primaryButton: {
    marginTop: 6,
    backgroundColor: colors.brandBlue,
    borderRadius: 9,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: "center",
    alignSelf: "stretch",
  },
  primaryButtonText: { color: colors.onPrimary, fontWeight: "700", fontSize: 12, lineHeight: 15 },
  completedLabel: { marginTop: 4, color: colors.ink500, fontSize: 10, lineHeight: 12 },
  thinkingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  thinkingText: { color: colors.ink500, fontSize: 11, lineHeight: 14 },
  promptWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    paddingHorizontal: 12,
    paddingBottom: 4,
  },
  promptChip: {
    backgroundColor: colors.surface,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: colors.line,
    alignSelf: "flex-start",
  },
  promptChipPressed: { backgroundColor: colors.blueTint, borderColor: colors.brandBlue },
  promptChipText: { color: colors.ink900, fontSize: 11, fontWeight: "600", lineHeight: 14 },
  composer: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingTop: 4,
    backgroundColor: colors.page,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "web" ? 12 : 10,
    color: colors.ink900,
    borderWidth: 1,
    borderColor: colors.line,
    fontSize: 16,
  },
  sendButton: {
    backgroundColor: colors.brandGreenBright,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    justifyContent: "center",
  },
  sendButtonText: { color: colors.brandNavy, fontWeight: "700", fontSize: 13, lineHeight: 16 },
  humanHelp: { alignItems: "center", paddingVertical: 4 },
  humanHelpText: { color: colors.brandBlue, fontSize: 10, fontWeight: "600", lineHeight: 12 },
});
