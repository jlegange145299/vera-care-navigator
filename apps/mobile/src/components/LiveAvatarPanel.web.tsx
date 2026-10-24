import { Image, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";
import type { LiveAvatarPanelProps } from "./LiveAvatarPanel.types";

export function LiveAvatarPanel({ portrait }: LiveAvatarPanelProps) {
  return (
    <View style={styles.card} accessibilityLabel="Vera guide">
      <Image source={portrait} style={styles.portrait} resizeMode="cover" />
      <View style={styles.caption}>
        <Text style={styles.title}>Vera</Text>
        <Text style={styles.detail}>LiveAvatar video is available in the native iOS and Android development build.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 142,
    marginHorizontal: 12,
    marginBottom: 6,
    overflow: "hidden",
    borderRadius: 12,
    backgroundColor: colors.navy950,
  },
  portrait: { width: "100%", height: "100%", position: "absolute", opacity: 0.68 },
  caption: { position: "absolute", left: 12, right: 12, bottom: 9 },
  title: { color: colors.surface, fontSize: 13, fontWeight: "700" },
  detail: { color: colors.surface, fontSize: 10, marginTop: 2 },
});
