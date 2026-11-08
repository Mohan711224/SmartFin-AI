import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { currentMonthTransactions, formatCurrency, totalByType, useFinance } from "@/hooks/useFinance";

const palette = [Colors.brand, Colors.blue, Colors.saffron, Colors.coral, Colors.green, "#9C75B8"];

export default function InsightsScreen() {
  const { transactions, budget } = useFinance();
  const monthly = currentMonthTransactions(transactions);
  const spent = totalByType(monthly, "expense");
  const income = totalByType(monthly, "income");
  const percent = budget > 0 ? Math.min(spent / budget, 1) : 0;
  const remaining = budget - spent;
  const categories = Object.entries(monthly.filter((item) => item.type === "expense").reduce<Record<string, number>>((result, item) => {
    result[item.category] = (result[item.category] || 0) + item.amount;
    return result;
  }, {})).sort((a, b) => b[1] - a[1]);
  const monthLabel = new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" }).toUpperCase();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>{monthLabel}</Text>
        <Text style={styles.title}>Spending insights</Text>
        <View style={styles.summary}>
          <View style={styles.summaryTop}><View style={styles.summaryIcon}><Ionicons name="wallet-outline" size={19} color={Colors.brand} /></View><Text style={styles.summaryLabel}>MONTHLY SPENDING</Text></View>
          <Text style={styles.summaryAmount}>{formatCurrency(spent)}</Text>
          <Text style={styles.summaryNote}>of {formatCurrency(budget)} monthly budget</Text>
          <View style={styles.track}><View style={[styles.progress, { width: `${percent * 100}%` }]} /></View>
          <Text style={styles.remaining}>{remaining >= 0 ? `${formatCurrency(remaining)} remaining` : `${formatCurrency(Math.abs(remaining))} over budget`}</Text>
        </View>
        <View style={styles.metrics}>
          <View style={styles.metric}><View style={[styles.metricIcon, { backgroundColor: "#EAF6EE" }]}><Ionicons name="arrow-down" size={15} color={Colors.green} /></View><Text style={styles.metricLabel}>Income</Text><Text style={styles.metricAmount}>{formatCurrency(income)}</Text></View>
          <View style={styles.metric}><View style={[styles.metricIcon, { backgroundColor: "#EFEDFF" }]}><Ionicons name="receipt-outline" size={15} color={Colors.brand} /></View><Text style={styles.metricLabel}>Entries</Text><Text style={styles.metricAmount}>{monthly.length}</Text></View>
        </View>
        <View style={styles.card}>
          <View style={styles.cardHeading}><Text style={styles.cardTitle}>By category</Text><Text style={styles.cardMeta}>{categories.length} categories</Text></View>
          {categories.length ? categories.map(([label, amount], index) => {
            const ratio = spent > 0 ? amount / spent : 0;
            return <View key={label} style={styles.category}><View style={styles.categoryHead}><View style={styles.categoryName}><View style={[styles.dot, { backgroundColor: palette[index % palette.length] }]} /><Text style={styles.categoryLabel}>{label}</Text></View><Text style={styles.categoryAmount}>{formatCurrency(amount)}</Text></View><View style={styles.trackLight}><View style={[styles.bar, { width: `${ratio * 100}%`, backgroundColor: palette[index % palette.length] }]} /></View><Text style={styles.share}>{Math.round(ratio * 100)}% of spending</Text></View>;
          }) : <View style={styles.empty}><Ionicons name="pie-chart-outline" size={28} color={Colors.brand} /><Text style={styles.emptyTitle}>No spending to break down</Text><Text style={styles.emptyCopy}>Add an expense to see where your money goes.</Text></View>}
        </View>
        <View style={styles.note}><Ionicons name="information-circle-outline" size={16} color={Colors.muted} /><Text style={styles.noteText}>Insights use transactions you enter manually and stay on this device.</Text></View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Colors.paper }, content: { width: "100%", maxWidth: 620, alignSelf: "center", padding: 20, paddingBottom: 28 }, kicker: { color: Colors.brand, fontSize: 9, fontWeight: "800", letterSpacing: 1.5 }, title: { color: Colors.ink, fontSize: 24, fontWeight: "800", marginTop: 5, marginBottom: 17 }, summary: { backgroundColor: Colors.brandDark, borderRadius: 18, padding: 18, marginBottom: 12 }, summaryTop: { flexDirection: "row", alignItems: "center", gap: 9 }, summaryIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: "#FFFFFF", alignItems: "center", justifyContent: "center" }, summaryLabel: { color: "#CAC7E4", fontSize: 9, letterSpacing: 1, fontWeight: "800" }, summaryAmount: { color: "#FFFFFF", fontSize: 29, fontWeight: "800", marginTop: 14 }, summaryNote: { color: "#CAC7E4", fontSize: 10, marginTop: 3 }, track: { height: 7, backgroundColor: "#FFFFFF28", borderRadius: 5, overflow: "hidden", marginTop: 14 }, progress: { height: 7, backgroundColor: "#B8AFFF", borderRadius: 5 }, remaining: { color: "#FFFFFF", fontSize: 10, fontWeight: "700", marginTop: 7 }, metrics: { flexDirection: "row", gap: 10, marginBottom: 16 }, metric: { flex: 1, backgroundColor: Colors.panel, borderWidth: 1, borderColor: Colors.line, borderRadius: 15, padding: 13 }, metricIcon: { width: 27, height: 27, borderRadius: 9, alignItems: "center", justifyContent: "center" }, metricLabel: { color: Colors.muted, fontSize: 10, marginTop: 9 }, metricAmount: { color: Colors.ink, fontSize: 16, fontWeight: "800", marginTop: 3 }, card: { borderRadius: 16, backgroundColor: Colors.panel, borderWidth: 1, borderColor: Colors.line, padding: 16 }, cardHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }, cardTitle: { color: Colors.ink, fontWeight: "800", fontSize: 14 }, cardMeta: { color: Colors.muted, fontSize: 9 }, category: { marginBottom: 15 }, categoryHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }, categoryName: { flexDirection: "row", alignItems: "center", gap: 7 }, dot: { width: 8, height: 8, borderRadius: 4 }, categoryLabel: { color: Colors.ink, fontSize: 11, fontWeight: "700" }, categoryAmount: { color: Colors.ink, fontSize: 11, fontWeight: "800" }, trackLight: { height: 6, backgroundColor: "#F0EFF6", borderRadius: 5, overflow: "hidden" }, bar: { height: 6, borderRadius: 5 }, share: { color: Colors.muted, fontSize: 9, marginTop: 4 }, empty: { alignItems: "center", paddingVertical: 22, gap: 7 }, emptyTitle: { color: Colors.ink, fontSize: 12, fontWeight: "800" }, emptyCopy: { color: Colors.muted, fontSize: 10 }, note: { flexDirection: "row", alignItems: "flex-start", gap: 7, marginTop: 14 }, noteText: { color: Colors.muted, fontSize: 10, lineHeight: 15, flex: 1 } });
