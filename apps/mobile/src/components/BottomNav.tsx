import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ExperienceView } from "@vera/core";
import { colors, minTouch } from "../theme";

const tabs: { id: ExperienceView; label: string }[] = [
  { id: "member", label: "Home" },
  { id: "wellness", label: "Wellness" },
  { id: "insights", label: "Business" },
];

export function BottomNav({ view, onNavigate }: { view: ExperienceView; onNavigate: (view: ExperienceView) => void }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.nav, { paddingBottom: Math.max(insets.bottom, 6) }]}>
      {tabs.map((tab) => {
        const active = view === tab.id;
        return (
          <Pressable
            key={tab.id}
            style={[styles.tab, active && styles.tabActive]}
            onPress={() => onNavigate(tab.id)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.surface,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    ...minTouch,
  },
  tabActive: { borderTopWidth: 2, borderTopColor: colors.blue600 },
  tabText: { color: colors.ink500, fontSize: 12, fontWeight: "600" },
  tabTextActive: { color: colors.blue600 },
});
