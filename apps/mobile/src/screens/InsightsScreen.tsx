import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { frictionJourneys, opportunitySignals, signalFeed } from "@vera/core";
import { colors } from "../theme";

const kpis = [
  { label: "Projected value unlocked", value: "$1.84M", change: "+18.2%" },
  { label: "Self-service resolution", value: "72%", change: "+9.4 pts" },
  { label: "Time to clarity", value: "4m 18s", change: "−38 sec" },
  { label: "Member confidence", value: "8.6 / 10", change: "+0.7" },
];

export function InsightsScreen() {
  const [query, setQuery] = useState("");
  const filteredSignals = useMemo(
    () =>
      signalFeed.filter((signal) =>
        `${signal.title} ${signal.detail} ${signal.tag}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>Business-only · Friction Intelligence</Text>
      <Text style={styles.title}>See where value gets stuck</Text>
      <Text style={styles.lead}>De-identified conversation signals for affordability, outcomes, and experience.</Text>

      <TextInput
        style={styles.search}
        placeholder="Search signals…"
        placeholderTextColor={colors.ink500}
        value={query}
        onChangeText={setQuery}
        autoCorrect={false}
        spellCheck={false}
      />

      <View style={styles.kpiGrid}>
        {kpis.map((kpi) => (
          <View key={kpi.label} style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>{kpi.label}</Text>
            <Text style={styles.kpiValue}>{kpi.value}</Text>
            <Text style={styles.kpiChange}>{kpi.change}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Value opportunity radar</Text>
        {opportunitySignals.map((item) => (
          <View key={item.label} style={styles.row}>
            <Text style={styles.rowLabel}>{item.label}</Text>
            <Text style={styles.rowValue}>{item.amount}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Journey friction map</Text>
        {frictionJourneys.map((item) => (
          <View key={item.journey} style={styles.journeyRow}>
            <Text style={styles.rowLabel}>{item.journey}</Text>
            <Text style={styles.rowMeta}>
              {item.stage} · {item.conversations} · {item.change}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Live signal feed</Text>
        {filteredSignals.map((signal) => (
          <View key={signal.title} style={styles.signalRow}>
            <Text style={styles.signalTime}>{signal.time}</Text>
            <Text style={styles.signalTitle}>{signal.title}</Text>
            <Text style={styles.signalDetail}>{signal.detail}</Text>
            <View style={styles.tagChip}>
              <Text style={styles.tagText}>{signal.tag}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.page },
  content: { padding: 16, paddingBottom: 32, gap: 12 },
  eyebrow: { color: colors.blue600, fontSize: 12, fontWeight: "700", textTransform: "uppercase" },
  title: { color: colors.ink900, fontSize: 22, fontWeight: "800" },
  lead: { color: colors.ink700, fontSize: 14, lineHeight: 20 },
  search: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.ink900,
  },
  kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  kpiCard: {
    width: "48%",
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.line,
  },
  kpiLabel: { color: colors.ink500, fontSize: 11 },
  kpiValue: { color: colors.ink900, fontSize: 18, fontWeight: "800", marginTop: 4 },
  kpiChange: { color: colors.blue600, fontSize: 12, marginTop: 2 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
    gap: 8,
  },
  cardTitle: { color: colors.ink900, fontWeight: "700", fontSize: 15, marginBottom: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  rowLabel: { color: colors.ink900, fontSize: 13, flex: 1 },
  rowValue: { color: colors.blue600, fontWeight: "700", fontSize: 13 },
  journeyRow: { gap: 2, paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: colors.line },
  rowMeta: { color: colors.ink500, fontSize: 11 },
  signalRow: { gap: 4, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.line },
  signalTime: { color: colors.ink500, fontSize: 11 },
  signalTitle: { color: colors.ink900, fontWeight: "600", fontSize: 13 },
  signalDetail: { color: colors.ink700, fontSize: 12, lineHeight: 17 },
  tagChip: {
    alignSelf: "flex-start",
    backgroundColor: colors.surfaceSoft,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: { color: colors.ink700, fontSize: 11, fontWeight: "600" },
});
