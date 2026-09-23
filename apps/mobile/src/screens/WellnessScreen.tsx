import { ScrollView, StyleSheet, Text, View } from "react-native";
import { memberWellnessSnapshot, portfolioWellness } from "@vera/core";
import type { MemberProfile } from "@vera/core";
import { colors } from "../theme";

const scoreCards = [
  { label: "Sleep", value: `${memberWellnessSnapshot.sleepHours}h`, note: "Insufficient sleep" },
  { label: "Movement", value: `${memberWellnessSnapshot.activeMinutes} min`, note: "Above weekly baseline" },
  { label: "Steps (7d)", value: memberWellnessSnapshot.steps7d.toLocaleString(), note: "Synthetic snapshot" },
];

export function WellnessScreen({ profile }: { profile: MemberProfile }) {
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>Wellness · {profile.firstName}</Text>
      <Text style={styles.title}>Your week at a glance</Text>
      <Text style={styles.lead}>
        Weekly summaries only—steps, sleep, and active minutes. No GPS trails or raw heart-rate streams in this demo.
      </Text>

      <View style={styles.grid}>
        {scoreCards.map((card) => (
          <View key={card.label} style={styles.scoreCard}>
            <Text style={styles.scoreLabel}>{card.label}</Text>
            <Text style={styles.scoreValue}>{card.value}</Text>
            <Text style={styles.scoreNote}>{card.note}</Text>
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
          {memberWellnessSnapshot.coachingSessionsLeft} digital coaching sessions remain on {profile.plan}. Link a device on
          Home to unlock habit guidance tied to your snapshot.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.page },
  content: { padding: 16, paddingBottom: 32, gap: 12 },
  eyebrow: { color: colors.blue600, fontSize: 12, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.6 },
  title: { color: colors.ink900, fontSize: 22, fontWeight: "800" },
  lead: { color: colors.ink700, fontSize: 14, lineHeight: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  scoreCard: {
    flexGrow: 1,
    minWidth: "30%",
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  scoreLabel: { color: colors.ink500, fontSize: 12 },
  scoreValue: { color: colors.ink900, fontSize: 20, fontWeight: "800", marginTop: 4 },
  scoreNote: { color: colors.ink700, fontSize: 11, marginTop: 4 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 6,
  },
  cardTitle: { color: colors.ink900, fontWeight: "700", fontSize: 15 },
  metricRow: { color: colors.ink700, fontSize: 13 },
  body: { color: colors.ink700, fontSize: 13, lineHeight: 19 },
});
