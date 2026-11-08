import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { formatCurrency, useFinance } from "@/hooks/useFinance";
import { parseBankCsv } from "@/utils/transactionImport";

const example = "Date,Description,Amount,Type,Payment Method\n07/11/2026,UPI-Swiggy,450,Debit,UPI\n08/11/2026,Salary credit,50000,Credit,Bank transfer";

export default function ImportTransactionsScreen() {
  const { importTransactions } = useFinance();
  const [csv, setCsv] = useState("");
  const [preview, setPreview] = useState<ReturnType<typeof parseBankCsv> | null>(null);
  const [saving, setSaving] = useState(false);

  function previewImport() {
    const result = parseBankCsv(csv);
    if (result.error) { Alert.alert("Check the CSV", result.error); setPreview(null); return; }
    setPreview(result);
  }

  async function commitImport() {
    if (!preview?.transactions.length) return;
    setSaving(true);
    try {
      const result = await importTransactions(preview.transactions);
      Alert.alert("Import complete", `${result.added} added${result.duplicates ? ` · ${result.duplicates} duplicate${result.duplicates === 1 ? "" : "s"} skipped` : ""}${preview.rejected ? ` · ${preview.rejected} invalid row${preview.rejected === 1 ? "" : "s"} skipped` : ""}.`, [{ text: "Done", onPress: () => router.back() }]);
    } catch {
      Alert.alert("Couldn’t import", "Please check the CSV and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.notice}><Ionicons name="lock-closed-outline" size={16} color={Colors.brand} /><Text style={styles.noticeText}>Import is processed on this device. Don’t paste passwords, PINs, or full card numbers.</Text></View>
        <Text style={styles.heading}>Paste a transaction CSV</Text>
        <Text style={styles.copy}>Export a CSV from your bank or payment service, then paste it here. We’ll classify transactions from their descriptions and skip duplicate rows.</Text>
        <TextInput value={csv} onChangeText={(value) => { setCsv(value); setPreview(null); }} placeholder={example} placeholderTextColor="#9A9AAA" style={styles.csvInput} multiline textAlignVertical="top" autoCapitalize="none" />
        <Pressable onPress={previewImport} style={styles.previewButton}><Text style={styles.previewText}>Preview import</Text><Ionicons name="eye-outline" size={17} color="#FFFFFF" /></Pressable>
        {preview ? <View style={styles.previewCard}><View style={styles.previewHeader}><Text style={styles.previewTitle}>{preview.transactions.length} transaction{preview.transactions.length === 1 ? "" : "s"} found</Text>{preview.rejected > 0 ? <Text style={styles.rejected}>{preview.rejected} skipped</Text> : null}</View>{preview.transactions.slice(0, 5).map((item, index) => <View key={`${item.date}-${item.title}-${index}`} style={styles.previewRow}><View style={styles.previewRowCopy}><Text style={styles.previewMerchant}>{item.title}</Text><Text style={styles.previewMeta}>{item.category} · {item.paymentMethod}</Text></View><Text style={[styles.previewAmount, item.type === "income" && styles.income]}>{item.type === "income" ? "+" : "−"}{formatCurrency(item.amount)}</Text></View>)}{preview.transactions.length > 5 ? <Text style={styles.moreRows}>and {preview.transactions.length - 5} more…</Text> : null}<Pressable onPress={commitImport} disabled={saving || !preview.transactions.length} style={[styles.importButton, (!preview.transactions.length || saving) && styles.disabled]}><Text style={styles.importText}>{saving ? "Importing…" : "Import transactions"}</Text><Ionicons name="arrow-forward" size={16} color="#FFFFFF" /></Pressable></View> : <View style={styles.formatCard}><Text style={styles.formatTitle}>Expected columns</Text><Text style={styles.formatCopy}>Required: date, description or narration, and amount. Optional: type (Debit/Credit), payment method, or separate debit and credit columns.</Text></View>}
        <Text style={styles.exampleLabel}>SAMPLE FORMAT</Text><Text style={styles.exampleText}>{example}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Colors.paper }, content: { padding: 18, paddingBottom: 30 }, notice: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 11, borderRadius: 12, backgroundColor: "#EFEDFF", marginBottom: 17 }, noticeText: { flex: 1, color: Colors.brandDark, fontSize: 10, lineHeight: 15 }, heading: { color: Colors.ink, fontWeight: "800", fontSize: 17 }, copy: { color: Colors.muted, fontSize: 11, lineHeight: 17, marginTop: 6, marginBottom: 12 }, csvInput: { minHeight: 150, borderWidth: 1, borderColor: Colors.line, borderRadius: 13, backgroundColor: Colors.panel, padding: 12, color: Colors.ink, fontSize: 11, lineHeight: 17 }, previewButton: { height: 44, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, borderRadius: 12, backgroundColor: Colors.brand, marginTop: 10 }, previewText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" }, formatCard: { padding: 12, borderRadius: 12, backgroundColor: Colors.panel, borderWidth: 1, borderColor: Colors.line, marginTop: 14 }, formatTitle: { color: Colors.ink, fontSize: 11, fontWeight: "800" }, formatCopy: { color: Colors.muted, fontSize: 10, lineHeight: 15, marginTop: 5 }, previewCard: { padding: 12, borderRadius: 13, backgroundColor: Colors.panel, borderWidth: 1, borderColor: Colors.line, marginTop: 14 }, previewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }, previewTitle: { color: Colors.ink, fontSize: 12, fontWeight: "800" }, rejected: { color: Colors.coral, fontSize: 9, fontWeight: "700" }, previewRow: { flexDirection: "row", alignItems: "center", paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: Colors.line }, previewRowCopy: { flex: 1 }, previewMerchant: { color: Colors.ink, fontSize: 10, fontWeight: "700" }, previewMeta: { color: Colors.muted, fontSize: 9, marginTop: 3 }, previewAmount: { color: Colors.ink, fontSize: 10, fontWeight: "800" }, income: { color: Colors.green }, moreRows: { color: Colors.muted, fontSize: 9, marginTop: 8 }, importButton: { height: 42, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, borderRadius: 11, backgroundColor: Colors.brand, marginTop: 11 }, disabled: { opacity: 0.45 }, importText: { color: "#FFFFFF", fontSize: 10, fontWeight: "800" }, exampleLabel: { color: Colors.muted, fontSize: 8, letterSpacing: 1.2, fontWeight: "800", marginTop: 18 }, exampleText: { color: Colors.muted, fontSize: 9, lineHeight: 14, marginTop: 5 }
});
