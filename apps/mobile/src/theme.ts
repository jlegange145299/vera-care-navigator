import { Platform } from "react-native";

/** Cigna brand palette (normalized from provided swatches). */
export const colors = {
  brandNavy: "#110081",
  brandBlue: "#0033FF",
  brandGreen: "#00874D",
  brandGreenBright: "#03CC54",
  brandOrange: "#FF4D00",
  brandPeach: "#FAA163",

  /** Semantic aliases used across screens */
  navy950: "#110081",
  navy900: "#110081",
  blue600: "#0033FF",
  mint500: "#03CC54",
  green700: "#00874D",
  orange600: "#FF4D00",
  peach400: "#FAA163",
  coral: "#FF4D00",

  ink900: "#110081",
  ink700: "#3D3D56",
  ink500: "#6A6A82",
  line: "#DDE2F0",
  surface: "#FFFFFF",
  surfaceSoft: "#F4F6FB",
  page: "#EEF1F8",
  blueTint: "#E8EEFF",
  avatarRing: "#B8C9FF",
  onPrimary: "#FFFFFF",
};

export const safariWeb = Platform.OS === "web" ? ({ WebkitOverflowScrolling: "touch" } as const) : {};

export const minTouch = { minHeight: 44, minWidth: 44 };
