import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import { memberWellnessSnapshot, portfolioWellness } from "@vera/core";
import type { MemberProfile } from "@vera/core";
import {
  BarChart,
  HorizontalStatBar,
  MetricIcon,
  ProgressMeter,
  weekSleepHours,
  weekSteps,
} from "../components/WellnessCharts";
import { profilePortrait } from "../memberProfiles";
import { colors } from "../theme";

const scoreCards = [
  {
    label: "Sleep",
    value: `${memberWellnessSnapshot.sleepHours}h`,
    note: "Below 7h goal",
    icon: "Sn",
    tint: "#E8EEFF",
    accent: colors.brandBlue,
  },
  {
    label: "Movement",
    value: `${memberWellnessSnapshot.activeMinutes} min`,
    note: "Above weekly baseline",
    icon: "Mv",
    tint: "#E6F7EE",
    accent: colors.brandGreen,
  },
  {
    label: "Steps (7d)",
    value: memberWellnessSnapshot.steps7d.toLocaleString(),
    note: "Synthetic snapshot",
    icon: "St",
    tint: "#FFF0E8",
    accent: colors.brandOrange,
  },
] as const;

const cohortToneColor: Record<string, string> = {
  high: colors.brandOrange,
  medium: colors.brandPeach,
  improving: colors.brandGreenBright,
};

export function WellnessScreen({ profile }: { profile: MemberProfile }) {
  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Image source={profilePortrait(profile.id)} style={styles.heroAvatar} accessibilityLabel={profile.avatarLabel} />
        <View style={styles.heroCopy}>
          <Text style={styles.eyebrow}>Wellness · {profile.firstName}</Text>
          <Text style={styles.title}>Your week at a glance</Text>
        </View>
        <View style={styles.heroBadge}>
          <MetricIcon label="✓" tint={colors.blueTint} />
          <Text style={styles.heroBadgeText}>Weekly only</Text>
        </View>
      </View>
      <Text style={styles.lead}>
        Steps, sleep, and active minutes—no GPS trails or raw heart-rate streams in this demo.
      </Text>

      <View style={styles.grid}>
        {scoreCards.map((card) => (
          <View key={card.label} style={[styles.scoreCard, { borderLeftColor: card.accent }]}>
            <MetricIcon label={card.icon} tint={card.tint} />
            <Text style={styles.scoreLabel}>{card.label}</Text>
            <Text style={styles.scoreValue}>{card.value}</Text>
            <Text style={styles.scoreNote} numberOfLines={2}>
              {card.note}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MetricIcon label="St" tint="#FFF0E8" />
          <Text style={styles.cardTitle}>Daily steps</Text>
        </View>
        <BarChart values={weekSteps} barColor={colors.brandBlue} formatValue={(v) => `${Math.round(v / 100) / 10}k`} />
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MetricIcon label="Sn" tint="#E8EEFF" />
          <Text style={styles.cardTitle}>Sleep trend (hours)</Text>
        </View>
        <BarChart
          values={weekSleepHours}
          barColor={colors.brandGreen}
          maxHeight={56}
          formatValue={(v) => `${v.toFixed(1)}`}
        />
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MetricIcon label="◎" tint="#E6F7EE" />
          <Text style={styles.cardTitle}>Goals this week</Text>
        </View>
        <View style={styles.meterStack}>
          <ProgressMeter label="Sleep vs 7h target" value={memberWellnessSnapshot.sleepHours} max={7} suffix="h" color={colors.brandBlue} />
          <ProgressMeter label="Active minutes vs 30" value={memberWellnessSnapshot.activeMinutes} max={30} suffix=" min" color={colors.brandGreen} />
          <ProgressMeter
            label="Steps vs 6,000/day"
            value={Math.round(memberWellnessSnapshot.steps7d / 7)}
            max={6000}
            suffix=""
            color={colors.brandOrange}
          />
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <MetricIcon label="◈" tint={colors.blueTint} />
          <Text style={styles.cardTitle}>Portfolio pulse (de-identified)</Text>
        </View>
        <HorizontalStatBar label="Opt-in rate" valueLabel={portfolioWellness.optInRate} percent={38} color={colors.brandBlue} icon="In" />
        <HorizontalStatBar label="Median steps" valueLabel={portfolioWellness.medianSteps} percent={72} color={colors.brandGreen} icon="St" />
        <HorizontalStatBar label="Coaching use" valueLabel={portfolioWellness.coachingUse} percent={24} color={colors.brandGreenBright} icon="Co" />
        <HorizontalStatBar label="Preventable risk" valueLabel={portfolioWellness.preventableRisk} percent={62} color={colors.brandOrange} icon="Rs" />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Population signals</Text>
        {portfolioWellness.cohorts.map((cohort) => (
          <View
            key={cohort.label}
            style={[styles.cohortRow, { borderLeftColor: cohortToneColor[cohort.tone] ?? colors.brandBlue }]}
          >
            <Text style={styles.cohortValue}>{cohort.value}</Text>
            <View style={styles.cohortCopy}>
              <Text style={styles.cohortLabel}>{cohort.label}</Text>
              <Text style={styles.cohortDetail}>{cohort.detail}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={[styles.card, styles.coachingCard]}>
        <View style={styles.cardHeader}>
          <MetricIcon label="Co" tint="#E6F7EE" />
          <Text style={styles.cardTitle}>Coaching you already have</Text>
        </View>
        <View style={styles.coachingRing}>
          <View style={styles.coachingRingInner}>
            <Text style={styles.coachingNumber}>{memberWellnessSnapshot.coachingSessionsLeft}</Text>
            <Text style={styles.coachingRingLabel}>sessions left</Text>
          </View>
        </View>
        <Text style={styles.body}>
          Digital coaching sessions remain on {profile.plan}. Link a device on Home to unlock habit guidance tied to your snapshot.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.page },
  content: { padding: 12, paddingBottom: 20, gap: 10 },
  hero: { flexDirection: "row", alignItems: "center", gap: 10 },
  heroAvatar: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: colors.avatarRing },
  heroCopy: { flex: 1, minWidth: 0 },
  heroBadge: { alignItems: "center", gap: 2 },
  heroBadgeText: { color: colors.ink500, fontSize: 8, fontWeight: "600" },
  eyebrow: { color: colors.brandBlue, fontSize: 11, fontWeight: "700", textTransform: "uppercase", letterSpacing: 0.5 },
  title: { color: colors.ink900, fontSize: 20, fontWeight: "800", lineHeight: 24, marginTop: 2 },
  lead: { color: colors.ink700, fontSize: 13, lineHeight: 18 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, justifyContent: "space-between" },
  scoreCard: {
    width: "31%",
    backgroundColor: colors.surface,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: colors.line,
    borderLeftWidth: 3,
    alignSelf: "flex-start",
    gap: 3,
  },
  scoreLabel: { color: colors.ink500, fontSize: 9, lineHeight: 11 },
  scoreValue: { color: colors.ink900, fontSize: 15, fontWeight: "800", lineHeight: 17 },
  scoreNote: { color: colors.ink700, fontSize: 9, lineHeight: 11 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 6,
    alignSelf: "stretch",
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardTitle: { color: colors.ink900, fontWeight: "700", fontSize: 13, lineHeight: 16 },
  meterStack: { gap: 10 },
  cohortRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 6,
    paddingLeft: 8,
    borderLeftWidth: 3,
    marginTop: 2,
  },
  cohortValue: { color: colors.brandBlue, fontWeight: "800", fontSize: 14, minWidth: 36 },
  cohortCopy: { flex: 1, gap: 2 },
  cohortLabel: { color: colors.ink900, fontSize: 11, fontWeight: "600", lineHeight: 14 },
  cohortDetail: { color: colors.ink700, fontSize: 10, lineHeight: 13 },
  coachingCard: { alignItems: "stretch" },
  coachingRing: {
    alignSelf: "center",
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 6,
    borderColor: colors.blueTint,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceSoft,
  },
  coachingRingInner: { alignItems: "center" },
  coachingNumber: { color: colors.brandNavy, fontSize: 22, fontWeight: "800", lineHeight: 24 },
  coachingRingLabel: { color: colors.ink500, fontSize: 9, fontWeight: "600" },
  body: { color: colors.ink700, fontSize: 11, lineHeight: 15, textAlign: "center" },
});
