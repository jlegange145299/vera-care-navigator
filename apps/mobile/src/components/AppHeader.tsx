import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import type { MemberProfile } from "@vera/core";
import { profilePortrait } from "../memberProfiles";
import { colors } from "../theme";

export function AppHeader({ profile, onNavigateHome }: { profile: MemberProfile; onNavigateHome: () => void }) {
  return (
    <View style={styles.header}>
      <Pressable onPress={onNavigateHome} style={styles.brandRow} accessibilityRole="header">
        <Image source={profilePortrait(profile.id)} style={styles.avatar} accessibilityLabel={profile.avatarLabel} />
        <View style={styles.brandCopy}>
          <Text style={styles.brand}>Vera</Text>
          <Text style={styles.tagline}>Hi, {profile.firstName} · {profile.city}</Text>
        </View>
      </Pressable>
      <Text style={styles.protected}>Protected session</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 1 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.avatarRing,
  },
  brandCopy: { flexShrink: 1 },
  brand: { color: colors.navy950, fontSize: 20, fontWeight: "800", lineHeight: 22 },
  tagline: { color: colors.ink500, fontSize: 11, marginTop: 1 },
  protected: { color: colors.ink700, fontSize: 10, fontWeight: "600" },
});
