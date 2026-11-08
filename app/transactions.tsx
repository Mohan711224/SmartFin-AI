import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { formatCurrency, useFinance } from "@/hooks/useFinance";
import { FinanceTransaction } from "@/types-finance";

type Filter = "All" | "Expenses" | "Income";

export default function TransactionsScreen() {
  const { transactions, deleteTransaction } = useFinance();
  const [filter, setFilter] = useState<Filter>("All");
  const data = useMemo(() => [...transactions].filter((item) => filter === "All" || item.type === (filter === "Income" ? "income" : "expense")).sort((a, b) => b.date.localeCompare(a.date)), [filter, transactions]);

  function confirmDelete(transaction: FinanceTransaction) {
    Alert.alert("Delete transaction?", `${transaction.title} · ${formatCurrency(transaction.amount)}`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteTransaction(transaction.id) }
    ]);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <View style={styles.header}><View style={styles.headerCopy}><Text style={styles.title}>Your activity</Text><Text style={styles.subtitle}>{transactions.length} transactions saved on this device</Text></View><View style={styles.actions}><Pressable onPress={() => router.push("/import-transactions")} style={styles.importButton} accessibilityRole="button"><Ionicons name="download-outline" size={15} color={Colors.brand} /><Text style={styles.importLabel}>Import</Text></Pressable><Pressable onPress={() => router.push("/add-transaction")} style={styles.addButton} accessibilityRole="button"><Ionicons name="add" size={23} color="#FFF" /></Pressable></View></View>
      <View style={styles.filters}>{(["All", "Expenses", "Income"] as Filter[]).map((item) => <Pressable key={item} onPress={() => setFilter(item)} style={[styles.filter, item === filter && styles.filterActive]}><Text style={[styles.filterText, item === filter && styles.filterTextActive]}>{item}</Text></Pressable>)}</View>
      <FlatList<FinanceTransaction> data={data} keyExtractor={(item) => item.id} contentContainerStyle={styles.list} ItemSeparatorComponent={() => <View style={styles.separator} />} renderItem={({ item }) => <TransactionRow item={item} onDelete={() => confirmDelete(item)} />} ListEmptyComponent={<View style={styles.empty}><Ionicons name="receipt-outline" size={30} color={Colors.brand} /><Text style={styles.emptyTitle}>No transactions yet</Text><Text style={styles.emptyCopy}>Add income or spending to start tracking.</Text></View>} />
    </SafeAreaView>
  );
}

function TransactionRow({ item, onDelete }: { item: FinanceTransaction; onDelete: () => void }) {
  const isIncome = item.type === "income";
  return <View style={styles.row}><View style={[styles.icon, { backgroundColor: isIncome ? "#EAF6EE" : "#EFEDFF" }]}><Ionicons name={isIncome ? "arrow-down" : "arrow-up"} size={17} color={isIncome ? Colors.green : Colors.brand} /></View><View style={styles.rowInfo}><Text style={styles.rowTitle}>{item.title}{item.isSample || item.id.startsWith("sample-") ? <Text style={styles.sampleTag}> · DEMO</Text> : item.source === "imported" ? <Text style={styles.importedTag}> · IMPORTED</Text> : null}</Text><Text style={styles.rowDetail}>{item.category} · {item.paymentMethod || "Manual"} · {new Date(item.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</Text></View><Text style={[styles.amount, isIncome && styles.income]}>{isIncome ? "+" : "−"}{formatCurrency(item.amount)}</Text><Pressable onPress={onDelete} accessibilityRole="button" accessibilityLabel={`Delete ${item.title}`} style={styles.delete}><Ionicons name="trash-outline" size={16} color={Colors.muted} /></Pressable></View>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Colors.paper }, header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16 }, headerCopy: { flex: 1 }, actions: { flexDirection: "row", alignItems: "center", gap: 8 }, title: { color: Colors.ink, fontSize: 22, fontWeight: "800" }, subtitle: { color: Colors.muted, fontSize: 11, marginTop: 4 }, addButton: { width: 42, height: 42, borderRadius: 14, alignItems: "center", justifyContent: "center", backgroundColor: Colors.brand }, importButton: { flexDirection: "row", alignItems: "center", gap: 4, borderRadius: 11, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.panel, paddingHorizontal: 9, paddingVertical: 9 }, importLabel: { color: Colors.brand, fontSize: 10, fontWeight: "800" }, filters: { flexDirection: "row", gap: 8, paddingHorizontal: 20, marginBottom: 8 }, filter: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.panel }, filterActive: { backgroundColor: Colors.brand, borderColor: Colors.brand }, filterText: { color: Colors.muted, fontSize: 11, fontWeight: "700" }, filterTextActive: { color: "#FFF" }, list: { paddingHorizontal: 20, paddingBottom: 24, flexGrow: 1 }, separator: { height: 1, backgroundColor: Colors.line, marginLeft: 51 }, row: { flexDirection: "row", alignItems: "center", paddingVertical: 13 }, icon: { width: 38, height: 38, borderRadius: 13, alignItems: "center", justifyContent: "center", marginRight: 12 }, rowInfo: { flex: 1 }, rowTitle: { color: Colors.ink, fontSize: 12, fontWeight: "700" }, sampleTag: { color: Colors.coral, fontSize: 8, fontWeight: "900" }, importedTag: { color: Colors.brand, fontSize: 8, fontWeight: "900" }, rowDetail: { color: Colors.muted, fontSize: 9, marginTop: 4 }, amount: { color: Colors.ink, fontSize: 11, fontWeight: "800" }, income: { color: Colors.green }, delete: { padding: 9, marginLeft: 4 }, empty: { alignItems: "center", paddingTop: 70, gap: 8 }, emptyTitle: { color: Colors.ink, fontSize: 16, fontWeight: "800" }, emptyCopy: { color: Colors.muted, fontSize: 11 } });
