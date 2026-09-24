import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

const dayLabels = ["M", "T", "W", "T", "F", "S", "S"];

export const weekSteps = [520, 680, 410, 590, 720, 450, 610];
export const weekSleepHours = [5.2, 6.1, 5.8, 5.5, 6.4, 5.0, 5.9];

export function MetricIcon({ label, tint }: { label: string; tint: string }) {
  return (
    <View style={[styles.iconBadge, { backgroundColor: tint }]}>
      <Text style={styles.iconLabel}>{label}</Text>
    </View>
  );
}

export function BarChart({
  values,
  barColor,
  maxHeight = 64,
  formatValue,
}: {
  values: number[];
  barColor: string;
  maxHeight?: number;
  formatValue?: (value: number) => string;
}) {
  const max = Math.max(...values, 1);

  return (
    <View style={styles.chart}>
      <View style={[styles.chartBars, { height: maxHeight }]}>
        {values.map((value, index) => {
          const height = Math.max(6, Math.round((value / max) * maxHeight));
          return (
            <View key={`${index}-${value}`} style={styles.barColumn}>
              {formatValue ? <Text style={styles.barValue}>{formatValue(value)}</Text> : null}
              <View style={[styles.barTrack, { height: maxHeight }]}>
                <View style={[styles.barFill, { height, backgroundColor: barColor }]} />
              </View>
              <Text style={styles.barDay}>{dayLabels[index]}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export function ProgressMeter({
  label,
  value,
  max,
  color,
  suffix = "",
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  suffix?: string;
}) {
  const pct = Math.min(100, Math.round((value / max) * 100));

  return (
    <View style={styles.meterRow}>
      <View style={styles.meterHeader}>
        <Text style={styles.meterLabel}>{label}</Text>
        <Text style={styles.meterValue}>
          {value}
          {suffix} · {pct}%
        </Text>
      </View>
      <View style={styles.meterTrack}>
        <View style={[styles.meterFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export function HorizontalStatBar({
  label,
  valueLabel,
  percent,
  color,
  icon,
}: {
  label: string;
  valueLabel: string;
  percent: number;
  color: string;
  icon: string;
}) {
  const width = Math.min(100, Math.max(8, percent));

  return (
    <View style={styles.statBarRow}>
      <View style={styles.statBarHeader}>
        <View style={styles.statBarTitle}>
          <MetricIcon label={icon} tint={colors.blueTint} />
          <Text style={styles.statBarLabel}>{label}</Text>
        </View>
        <Text style={styles.statBarValue}>{valueLabel}</Text>
      </View>
      <View style={styles.meterTrack}>
        <View style={[styles.meterFill, { width: `${width}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  iconLabel: { color: colors.brandNavy, fontSize: 10, fontWeight: "800" },
  chart: { marginTop: 4 },
  chartBars: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: 4 },
  barColumn: { flex: 1, alignItems: "center", minWidth: 0 },
  barTrack: {
    width: "100%",
    maxWidth: 22,
    justifyContent: "flex-end",
    borderRadius: 6,
    backgroundColor: colors.surfaceSoft,
    overflow: "hidden",
  },
  barFill: { width: "100%", borderRadius: 6 },
  barDay: { marginTop: 4, color: colors.ink500, fontSize: 9, fontWeight: "600" },
  barValue: { color: colors.ink700, fontSize: 8, marginBottom: 2 },
  meterRow: { gap: 4 },
  meterHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  meterLabel: { color: colors.ink700, fontSize: 11, fontWeight: "600" },
  meterValue: { color: colors.brandBlue, fontSize: 10, fontWeight: "700" },
  meterTrack: {
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceSoft,
    overflow: "hidden",
  },
  meterFill: { height: "100%", borderRadius: 999 },
  statBarRow: { gap: 6, paddingVertical: 4 },
  statBarHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  statBarTitle: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1, minWidth: 0 },
  statBarLabel: { color: colors.ink900, fontSize: 11, fontWeight: "600", flexShrink: 1 },
  statBarValue: { color: colors.ink700, fontSize: 10, fontWeight: "700" },
});
