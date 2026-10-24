import type { ChatMessage } from "@vera/core";
import type { ImageSourcePropType } from "react-native";

export interface LiveAvatarPanelProps {
  portrait: ImageSourcePropType;
  assistantMessage: ChatMessage | null;
}
