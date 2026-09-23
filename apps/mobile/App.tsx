import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { AppHeader } from "./src/components/AppHeader";
import { BottomNav } from "./src/components/BottomNav";
import { useVeraChat } from "./src/hooks/useVeraChat";
import { defaultMobileProfile } from "./src/memberProfiles";
import { MemberScreen } from "./src/screens/MemberScreen";
import { WellnessScreen } from "./src/screens/WellnessScreen";
import { colors } from "./src/theme";

type MobileView = "member" | "wellness";

export default function App() {
  const [view, setView] = useState<MobileView>("member");
  const chat = useVeraChat(defaultMobileProfile);

  const navigate = (next: MobileView) => setView(next);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
        <StatusBar style="dark" />
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          keyboardVerticalOffset={Platform.OS === "ios" ? 4 : 0}
        >
          <AppHeader profile={chat.profile} onNavigateHome={() => navigate("member")} />
          <View style={styles.body}>
            {view === "member" ? (
              <MemberScreen
                profile={chat.profile}
                messages={chat.messages}
                isThinking={chat.isThinking}
                completedActions={chat.completedActions}
                linkedDevices={chat.linkedDevices}
                locationMethod={chat.locationMethod}
                onSelectProfile={chat.selectProfile}
                onSend={chat.handleSend}
                onCompleteAction={chat.handleCompleteAction}
              />
            ) : (
              <WellnessScreen profile={chat.profile} />
            )}
          </View>
          <BottomNav view={view} onNavigate={navigate} />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.page },
  flex: { flex: 1 },
  body: { flex: 1, minHeight: 0 },
});
