import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { currentMonthTransactions, formatCurrency, totalByType, useFinance } from "@/hooks/useFinance";

export default function HomeScreen() {
  const { transactions, budget, balance, isReady } = useFinance();
  const monthTransactions = currentMonthTransactions(transactions);
  const monthSpend = totalByType(monthTransactions, "expense");
  const monthIncome = totalByType(monthTransactions, "income");
  const remaining = budget - monthSpend;
  const recent = [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  const lastWeek = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    return {
      day: date.toLocaleDateString("en-IN", { weekday: "narrow" }),
      income: totalByType(transactions.filter((item) => new Date(item.date).toDateString() === date.toDateString()), "income"),
      spend: totalByType(transactions.filter((item) => new Date(item.date).toDateString() === date.toDateString()), "expense")
    };
  });
  const chartMax = Math.max(1, ...lastWeek.flatMap((item) => [item.income, item.spend]));
  const weekNet = totalByType(transactions.filter((item) => Date.now() - new Date(item.date).getTime() < 7 * 86400000), "income") - totalByType(transactions.filter((item) => Date.now() - new Date(item.date).getTime() < 7 * 86400000), "expense");

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <View style={styles.brandMark}><Ionicons name="sparkles" size={16} color="#FFFFFF" /></View>
            <Text style={styles.brandName}>moneymind</Text>
          </View>
          <View style={styles.headerActions}><Pressable onPress={() => router.push("/upi-payment")} style={styles.payButton} accessibilityRole="button"><Ionicons name="flash-outline" size={15} color={Colors.brand} /><Text style={styles.payButtonText}>Pay</Text></Pressable><Pressable onPress={() => router.push("/add-transaction")} style={styles.newTransaction} accessibilityRole="button"><Ionicons name="add" size={17} color="#FFFFFF" /><Text style={styles.newTransactionText}>Add</Text></Pressable></View>
        </View>

        <View style={styles.greetingRow}>
          <View><Text style={styles.date}>YOUR MONEY AT A GLANCE</Text><Text style={styles.greeting}>Good morning, Mohan</Text></View>
          <View style={styles.avatar}><Text style={styles.avatarText}>M</Text></View>
        </View>

        <View style={styles.balanceCard}>
          <View style={styles.cardDecor} /><View style={styles.cardDecorSmall} />
          <View style={styles.balanceTop}><Text style={styles.balanceLabel}>TOTAL BALANCE</Text><Ionicons name="eye-outline" size={18} color="#C8C6E2" /></View>
          <Text style={styles.balance}>{formatCurrency(balance)}<Text style={styles.decimal}>.00</Text></Text>
          <View style={styles.balanceBottom}><View style={styles.trendPill}><Ionicons name="trending-up" size={13} color="#B6F1D0" /><Text style={styles.trendText}>8.2%</Text></View><Text style={styles.balanceCaption}>up this month</Text><View style={{ flex: 1 }} /><View style={styles.accountIcon}><Ionicons name="layers-outline" size={13} color="#D8D5F1" /></View><Text style={styles.balanceCaption}>3 accounts</Text></View>
        </View>

        <View style={styles.metrics}>
          <View style={styles.metricCard}><View style={styles.metricTop}><View style={[styles.metricIcon, { backgroundColor: "#EAF6EE" }]}><Ionicons name="arrow-down" size={15} color={Colors.green} /></View><Text style={styles.metricLabel}>INCOME</Text></View><Text style={styles.metricAmount}>{formatCurrency(monthIncome)}</Text><Text style={styles.metricFoot}>This month</Text></View>
          <View style={styles.metricCard}><View style={styles.metricTop}><View style={[styles.metricIcon, { backgroundColor: "#FFF0EA" }]}><Ionicons name="arrow-up" size={15} color={Colors.coral} /></View><Text style={styles.metricLabel}>SPENDING</Text></View><Text style={styles.metricAmount}>{formatCurrency(monthSpend)}</Text><Text style={styles.metricFoot}>of {formatCurrency(budget)} budget</Text></View>
        </View>

        <View style={styles.sectionHeader}><View><Text style={styles.sectionTitle}>Cash flow</Text><Text style={styles.sectionSubtitle}>Your week at a glance</Text></View><Pressable style={styles.period}><Text style={styles.periodText}>This week</Text><Ionicons name="chevron-down" size={14} color={Colors.muted} /></Pressable></View>
        <View style={styles.chartCard}>
          <View style={styles.legend}><View style={[styles.legendDot, { backgroundColor: Colors.brand }]} /><Text style={styles.legendText}>Income</Text><View style={[styles.legendDot, { backgroundColor: "#D9D5FF", marginLeft: 16 }]} /><Text style={styles.legendText}>Spending</Text><Text style={styles.chartTotal}>{weekNet >= 0 ? "+" : "−"}{formatCurrency(Math.abs(weekNet))} net</Text></View>
          <View style={styles.chart}>{lastWeek.map((item, index) => <View key={`${item.day}-${index}`} style={styles.chartDay}><View style={styles.bars}><View style={[styles.bar, { height: Math.max(2, item.income / chartMax * 54), backgroundColor: Colors.brand }]} /><View style={[styles.bar, { height: Math.max(2, item.spend / chartMax * 54), backgroundColor: "#D9D5FF" }]} /></View><Text style={styles.dayLabel}>{item.day}</Text></View>)}</View>
        </View>

        <Pressable style={styles.insightCard} onPress={() => router.push("/(tabs)/assistant")} accessibilityRole="button">
          <View style={styles.insightOrb}><Ionicons name="sparkles" size={17} color={Colors.brand} /></View>
          <View style={styles.insightCopy}><View style={styles.insightLabelRow}><Text style={styles.insightEyebrow}>YOUR AI INSIGHT</Text><View style={styles.newPill}><Text style={styles.newText}>PREVIEW</Text></View></View><Text style={styles.insightTitle}>{remaining >= 0 ? "Your budget is on track" : "You’re over your budget"}</Text><Text style={styles.insightBody}>{formatCurrency(Math.abs(remaining))} {remaining >= 0 ? "left in your monthly budget." : "over your monthly budget."}</Text></View>
          <Ionicons name="chevron-forward" size={18} color={Colors.brand} />
        </Pressable>

        <View style={[styles.sectionHeader, styles.activityHeader]}><View><Text style={styles.sectionTitle}>Recent activity</Text><Text style={styles.sectionSubtitle}>Latest entries</Text></View><Pressable onPress={() => router.push("/transactions")}><Text style={styles.viewAll}>View all</Text></Pressable></View>
        <View style={styles.transactions}>{recent.map((item, index) => <View key={item.id} style={[styles.transaction, index === recent.length - 1 && styles.lastTransaction]}><View style={[styles.transactionIcon, { backgroundColor: item.type === "income" ? "#EAF6EE" : "#EFEDFF" }]}><Ionicons name={item.type === "income" ? "arrow-down" : "arrow-up"} size={18} color={item.type === "income" ? Colors.green : Colors.brand} /></View><View style={styles.transactionInfo}><Text style={styles.transactionTitle}>{item.title}</Text><Text style={styles.transactionCategory}>{item.category} · {item.paymentMethod || (item.source === "imported" ? "Imported" : "Manual")} · {new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</Text></View><Text style={[styles.transactionAmount, item.type === "income" && styles.incomeAmount]}>{item.type === "income" ? "+" : "−"}{formatCurrency(item.amount)}</Text></View>)}</View>
        <Text style={styles.disclaimer}>{!isReady ? "LOADING YOUR FINANCES…" : transactions.some((item) => item.isSample || item.id.startsWith("sample-")) ? "DEMO ENTRIES INCLUDED · REMOVE FROM ACTIVITY" : "MANUAL ENTRIES · SAVED ON THIS DEVICE"}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.paper }, content: { width: "100%", maxWidth: 620, alignSelf: "center", paddingHorizontal: 20, paddingTop: 7, paddingBottom: 30 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }, brandRow: { flexDirection: "row", alignItems: "center", gap: 9 }, brandMark: { width: 28, height: 28, alignItems: "center", justifyContent: "center", borderRadius: 9, backgroundColor: Colors.brand }, brandName: { color: Colors.ink, fontSize: 15, fontWeight: "900", letterSpacing: -0.3 }, headerActions: { flexDirection: "row", alignItems: "center", gap: 7 }, payButton: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 12, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.panel, paddingHorizontal: 10, paddingVertical: 8 }, payButtonText: { color: Colors.brand, fontSize: 10, fontWeight: "800" }, newTransaction: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 12, backgroundColor: Colors.brand, paddingHorizontal: 10, paddingVertical: 9 }, newTransactionText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" },
  greetingRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }, date: { color: Colors.muted, fontSize: 9, letterSpacing: 1.3, fontWeight: "800", marginBottom: 5 }, greeting: { color: Colors.ink, fontSize: 21, fontWeight: "800", letterSpacing: -0.5 }, avatar: { width: 40, height: 40, borderRadius: 15, alignItems: "center", justifyContent: "center", backgroundColor: "#EAE7FF", borderWidth: 1, borderColor: "#DAD5FF" }, avatarText: { color: Colors.brandDark, fontWeight: "800", fontSize: 15 },
  balanceCard: { backgroundColor: Colors.brandDark, borderRadius: 20, padding: 20, marginBottom: 13, overflow: "hidden", position: "relative" }, cardDecor: { position: "absolute", width: 170, height: 170, right: -55, top: -102, borderRadius: 90, borderWidth: 1, borderColor: "#FFFFFF18" }, cardDecorSmall: { position: "absolute", width: 112, height: 112, right: -23, top: -72, borderRadius: 60, borderWidth: 1, borderColor: "#FFFFFF12" }, balanceTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, balanceLabel: { color: "#C3C0DE", fontSize: 9, letterSpacing: 1.5, fontWeight: "800" }, balance: { color: "#FFFFFF", fontWeight: "800", fontSize: 33, marginTop: 12, letterSpacing: -1 }, decimal: { fontSize: 18, color: "#C9C6E0" }, balanceBottom: { flexDirection: "row", alignItems: "center", marginTop: 13 }, trendPill: { flexDirection: "row", alignItems: "center", gap: 3, backgroundColor: "#394765", borderRadius: 10, paddingHorizontal: 7, paddingVertical: 4 }, trendText: { color: "#B6F1D0", fontSize: 10, fontWeight: "800" }, balanceCaption: { color: "#C3C0DE", fontSize: 10, marginLeft: 6 }, accountIcon: { width: 23, height: 23, alignItems: "center", justifyContent: "center", borderRadius: 8, backgroundColor: "#FFFFFF1A", marginRight: 1 },
  metrics: { flexDirection: "row", gap: 11, marginBottom: 22 }, metricCard: { flex: 1, minWidth: 0, backgroundColor: Colors.panel, borderRadius: 16, padding: 14, borderWidth: 1, borderColor: Colors.line }, metricTop: { flexDirection: "row", alignItems: "center", gap: 7 }, metricIcon: { width: 26, height: 26, alignItems: "center", justifyContent: "center", borderRadius: 9 }, metricLabel: { color: Colors.muted, fontSize: 9, letterSpacing: 1.1, fontWeight: "800" }, metricAmount: { color: Colors.ink, fontSize: 19, fontWeight: "800", marginTop: 12, letterSpacing: -0.4 }, metricFoot: { color: Colors.muted, fontSize: 10, marginTop: 3 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 11 }, sectionTitle: { color: Colors.ink, fontSize: 16, fontWeight: "800", letterSpacing: -0.2 }, sectionSubtitle: { color: Colors.muted, fontSize: 10, marginTop: 3 }, period: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: Colors.panel, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: Colors.line }, periodText: { color: Colors.ink, fontSize: 10, fontWeight: "700" }, chartCard: { backgroundColor: Colors.panel, borderRadius: 16, borderWidth: 1, borderColor: Colors.line, paddingHorizontal: 15, paddingTop: 14, paddingBottom: 10, marginBottom: 13 }, legend: { flexDirection: "row", alignItems: "center", gap: 5 }, legendDot: { width: 7, height: 7, borderRadius: 5 }, legendText: { color: Colors.muted, fontSize: 9 }, chartTotal: { color: Colors.ink, fontSize: 10, fontWeight: "800", marginLeft: "auto" }, chart: { height: 96, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-around", marginTop: 7 }, chartDay: { flex: 1, height: "100%", alignItems: "center", justifyContent: "flex-end" }, bars: { height: 76, flexDirection: "row", alignItems: "flex-end", gap: 3, paddingBottom: 1, borderBottomWidth: 1, borderBottomColor: "#F0EFF6" }, bar: { width: 8, borderTopLeftRadius: 4, borderTopRightRadius: 4 }, dayLabel: { color: Colors.muted, fontSize: 9, marginTop: 6 }, selectedDay: { color: Colors.brand, fontWeight: "800" },
  insightCard: { flexDirection: "row", alignItems: "center", gap: 11, borderRadius: 16, backgroundColor: "#EFEDFF", padding: 13, marginBottom: 21, borderWidth: 1, borderColor: "#E2DEFF" }, insightOrb: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: 12, backgroundColor: "#FFFFFF" }, insightCopy: { flex: 1 }, insightLabelRow: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 }, insightEyebrow: { color: Colors.brand, fontSize: 8, letterSpacing: 1, fontWeight: "900" }, newPill: { backgroundColor: "#DCD7FF", borderRadius: 5, paddingHorizontal: 4, paddingVertical: 2 }, newText: { color: Colors.brandDark, fontSize: 7, fontWeight: "900" }, insightTitle: { color: Colors.ink, fontWeight: "800", fontSize: 12 }, insightBody: { color: Colors.muted, fontSize: 10, lineHeight: 15, marginTop: 2 },
  activityHeader: { marginBottom: 10 }, viewAll: { color: Colors.brand, fontSize: 10, fontWeight: "800" }, transactions: { backgroundColor: Colors.panel, borderRadius: 16, borderWidth: 1, borderColor: Colors.line, paddingHorizontal: 13 }, transaction: { flexDirection: "row", alignItems: "center", paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: "#F1F0F6" }, lastTransaction: { borderBottomWidth: 0 }, transactionIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 10 }, transactionInfo: { flex: 1 }, transactionTitle: { color: Colors.ink, fontSize: 11, fontWeight: "700" }, transactionCategory: { color: Colors.muted, fontSize: 9, marginTop: 4 }, transactionAmount: { color: Colors.ink, fontSize: 11, fontWeight: "800" }, incomeAmount: { color: Colors.green }, disclaimer: { textAlign: "center", color: Colors.muted, fontSize: 8, letterSpacing: 1, fontWeight: "700", marginTop: 14 }
});
