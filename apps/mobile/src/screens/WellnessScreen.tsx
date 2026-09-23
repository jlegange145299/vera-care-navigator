import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { memberWellnessSnapshot, portfolioWellness } from "@vera/core";
import type { MemberProfile } from "@vera/core";
import { profilePortrait } from "../memberProfiles";
import { colors } from "../theme";

const scoreCards = [
  { label: "Sleep", value: `${memberWellnessSnapshot.sleepHours}h`, note: "Insufficient sleep" },
  { label: "Movement", value: `${memberWellnessSnapshot.activeMinutes} min`, note: "Above weekly baseline" },
  { label: "Steps (7d)", value: memberWellnessSnapshot.steps7d.toLocaleString(), note: "Synthetic snapshot" },
];

export function WellnessScreen({ profile }: { profile: MemberProfile }) {
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Image source={profilePortrait(profile.id)} style={styles.heroAvatar} accessibilityLabel={profile.avatarLabel} />
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>Wellness · {profile.firstName}</Text>
          <Text style={styles.title}>Your week at a glance</Text>
        </View>
      </View>
      <Text style={styles.lead}>
        Weekly summaries only—steps, sleep, and active minutes. No GPS trails or raw heart-rate streams in this demo.
      </Text>

      <View style={styles.grid}>
        {scoreCards.map((card) => (
          <View key={card.label} style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>{card.label}</Text>
            <Text style={styles.scoreValue}>{card.value}</Text>
            <Text style={styles.scoreNote} numberOfLines={2}>
              {card.note}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Portfolio pulse (de-identified)</Text>
        <Text style={styles.metricRow}>Opt-in rate · {portfolioWellness.optInRate}</Text>
        <Text style={styles.metricRow}>Median steps · {portfolioWellness.medianSteps}</Text>
        <Text style={styles.metricRow}>Coaching use · {portfolioWellness.coachingUse}</Text>
        <Text style={styles.metricRow}>Preventable risk · {portfolioWellness.preventableRisk}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Coaching you already have</Text>
        <Text style={styles.body}>
          {memberWellnessSnapshot.coachingSessionsLeft} digital coaching sessions remain on {profile.plan}. Link a device on Home
          to unlock habit guidance tied to your snapshot.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.page },
  content: { padding: 14, paddingBottom: 20, gap: 10 },
  hero: { flexDirection: "row", alignItems: "center", gap: 10 },
  heroAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: "#dce5ff" },
  heroCopy: { flex: 1 },
  eyebrow: { color: colors.blue600, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  title: { color: colors.ink900, fontSize: 20, fontWeight: "800", lineHeight: 24, marginTop: 2 },
  lead: { color: colors.ink700, fontSize: 13, lineHeight: 18 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "space-between" },
  scoreCard: {
    width: "31%",
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.line,
    alignSelf: "flex-start",
  },
  scoreLabel: { color: colors.ink500, fontSize: 10, lineHeight: 13 },
  scoreValue: { color: colors.ink900, fontSize: 17, fontWeight: "800", marginTop: 2, lineHeight: 20 },
  scoreNote: { color: colors.ink700, fontSize: 10, marginTop: 2, lineHeight: 13 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 4,
  },
  cardTitle: { color: colors.ink900, fontWeight: "700", fontSize: 14, lineHeight: 18 },
  metricRow: { color: colors.ink700, fontSize: 12, lineHeight: 16 },
  body: { color: colors.ink700, fontSize: 12, lineHeight: 17 },
});
