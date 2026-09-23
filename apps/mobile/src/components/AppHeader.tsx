import { Pressable, StyleSheet, Text, View } from "react-native";
import type { ExperienceView } from "@vera/core";
import { colors } from "../theme";

export function AppHeader({ view, onNavigateHome }: { view: ExperienceView; onNavigateHome: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onNavigateHome} accessibilityRole="header">
        <Text style={styles.brand}>Vera</Text>
        <Text style={styles.tagline}>Every benefit. One clear next step.</Text>
      </Pressable>
      <View style={styles.badgeRow}>
        <Text style={styles.protected}>Protected</Text>
        {view === "insights" ? <Text style={styles.activePill}>Friction Intelligence</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  brand: { color: colors.navy950, fontSize: 22, fontWeight: "800" },
  tagline: { color: colors.ink500, fontSize: 12, marginTop: 2 },
  badgeRow: { flexDirection: "row", gap: 8, marginTop: 8, alignItems: "center" },
  protected: { color: colors.ink700, fontSize: 11, fontWeight: "600" },
  activePill: {
    color: colors.blue600,
    fontSize: 11,
    fontWeight: "700",
    backgroundColor: "#eef1ff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
});
