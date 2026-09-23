import "@expo/metro-runtime";
import { registerRootComponent } from "expo";
import { Platform } from "react-native";
import App from "./App";

if (Platform.OS === "web") {
  require("./web-styles.css");
}

registerRootComponent(App);
