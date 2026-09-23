import { Platform } from "react-native";

export const colors = {
  navy950: "#081542",
  navy900: "#11106f",
  blue600: "#1743f5",
  mint500: "#25e5ae",
  ink900: "#101939",
  ink700: "#3f4966",
  ink500: "#6f7893",
  line: "#e1e6f0",
  surface: "#ffffff",
  surfaceSoft: "#f7f9fc",
  page: "#f4f7fc",
  coral: "#ff8d7c",
};

export const safariWeb = Platform.OS === "web" ? ({ WebkitOverflowScrolling: "touch" } as const) : {};

export const minTouch = { minHeight: 44, minWidth: 44 };
