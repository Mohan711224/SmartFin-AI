import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { formatCurrency, useFinance } from "@/hooks/useFinance";

export default function SettingsScreen() {
  const { budget, transactions, updateBudget, isReady } = useFinance();
  const [draft, setDraft] = useState(String(budget));
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isReady) setDraft(String(budget));
  }, [budget, isReady]);

  async function saveBudget() {
    const nextBudget = Number(draft.replace(/,/g, ""));
    if (!Number.isFinite(nextBudget) || nextBudget <= 0) return Alert.alert("Check your budget", "Enter a monthly budget greater than zero.");
    await updateBudget(nextBudget);
    setDraft(String(nextBudget));
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.kicker}>PERSONALISE YOUR SPACE</Text><Text style={styles.title}>Profile & settings</Text>
        <View style={styles.profile}><View style={styles.avatar}><Text style={styles.avatarText}>M</Text></View><View style={{ flex: 1 }}><Text style={styles.profileName}>Mohan</Text><Text style={styles.profileHint}>Your finances stay on this device</Text></View><Ionicons name="shield-checkmark" size={20} color={Colors.green} /></View>

        <View style={styles.sectionHead}><Text style={styles.sectionTitle}>Monthly budget</Text><Text style={styles.sectionHint}>Used on your dashboard and insights</Text></View>
        <View style={styles.budgetCard}><Text style={styles.budgetLabel}>SPENDING LIMIT</Text><View style={styles.budgetEntry}><Text style={styles.rupee}>₹</Text><TextInput value={draft} onChangeText={(value) => setDraft(value.replace(/[^0-9]/g, ""))} keyboardType="number-pad" style={styles.budgetInput} accessibilityLabel="Monthly spending limit" /></View><Text style={styles.currentBudget}>Current limit: {formatCurrency(budget)} / month</Text><Pressable onPress={saveBudget} style={styles.saveButton}><Text style={styles.saveText}>{saved ? "Budget saved" : "Save budget"}</Text><Ionicons name={saved ? "checkmark" : "arrow-forward"} size={16} color="#FFFFFF" /></Pressable></View>

        <View style={styles.sectionHead}><Text style={styles.sectionTitle}>Your data</Text><Text style={styles.sectionHint}>Manage your local finance records</Text></View>
        <Pressable onPress={() => router.push("/transactions")} style={styles.settingRow}><View style={[styles.rowIcon, { backgroundColor: "#EFEDFF" }]}><Ionicons name="receipt-outline" size={18} color={Colors.brand} /></View><View style={styles.rowCopy}><Text style={styles.rowTitle}>Transactions</Text><Text style={styles.rowSubtitle}>{transactions.length} entries{transactions.some((item) => item.isSample || item.id.startsWith("sample-")) ? " · demo examples included" : " · add, review, or remove"}</Text></View><Ionicons name="chevron-forward" size={18} color={Colors.muted} /></Pressable>
        <Pressable onPress={() => router.push("/import-transactions")} style={styles.settingRow}><View style={[styles.rowIcon, { backgroundColor: "#EAF3FF" }]}><Ionicons name="download-outline" size={18} color={Colors.blue} /></View><View style={styles.rowCopy}><Text style={styles.rowTitle}>Import bank or UPI history</Text><Text style={styles.rowSubtitle}>Paste a statement CSV to classify entries</Text></View><Ionicons name="chevron-forward" size={18} color={Colors.muted} /></Pressable>
        <Pressable onPress={() => router.push("/upi-payment")} style={styles.settingRow}><View style={[styles.rowIcon, { backgroundColor: "#FFF3E4" }]}><Ionicons name="flash-outline" size={18} color={Colors.saffron} /></View><View style={styles.rowCopy}><Text style={styles.rowTitle}>Pay with UPI</Text><Text style={styles.rowSubtitle}>Continue in an installed UPI app</Text></View><Ionicons name="chevron-forward" size={18} color={Colors.muted} /></Pressable>
        <View style={styles.settingRow}><View style={[styles.rowIcon, { backgroundColor: "#EAF6EE" }]}><Ionicons name="phone-portrait-outline" size={18} color={Colors.green} /></View><View style={styles.rowCopy}><Text style={styles.rowTitle}>Storage</Text><Text style={styles.rowSubtitle}>Saved locally on this device</Text></View><Ionicons name="checkmark-circle" size={18} color={Colors.green} /></View>
        <View style={styles.settingRow}><View style={[styles.rowIcon, { backgroundColor: "#FFF0EA" }]}><Ionicons name="sparkles-outline" size={18} color={Colors.coral} /></View><View style={styles.rowCopy}><Text style={styles.rowTitle}>AI assistant</Text><Text style={styles.rowSubtitle}>Local preview · no AI service connected</Text></View><Ionicons name="information-circle-outline" size={18} color={Colors.muted} /></View>
        <Text style={styles.footnote}>This starter does not connect to banks. Entered data is stored on your device, and assistant replies use simple local rules.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Colors.paper }, content: { width: "100%", maxWidth: 620, alignSelf: "center", padding: 20, paddingBottom: 28 }, kicker: { color: Colors.brand, fontSize: 9, fontWeight: "800", letterSpacing: 1.3 }, title: { color: Colors.ink, fontSize: 23, fontWeight: "800", marginTop: 5, marginBottom: 17 }, profile: { flexDirection: "row", alignItems: "center", gap: 11, backgroundColor: Colors.panel, borderRadius: 16, borderWidth: 1, borderColor: Colors.line, padding: 14, marginBottom: 21 }, avatar: { width: 42, height: 42, borderRadius: 15, backgroundColor: "#EAE7FF", alignItems: "center", justifyContent: "center" }, avatarText: { color: Colors.brandDark, fontSize: 16, fontWeight: "800" }, profileName: { color: Colors.ink, fontSize: 13, fontWeight: "800" }, profileHint: { color: Colors.muted, fontSize: 10, marginTop: 3 }, sectionHead: { marginBottom: 9, marginTop: 2 }, sectionTitle: { color: Colors.ink, fontSize: 14, fontWeight: "800" }, sectionHint: { color: Colors.muted, fontSize: 10, marginTop: 3 }, budgetCard: { backgroundColor: Colors.panel, borderRadius: 16, borderWidth: 1, borderColor: Colors.line, padding: 15, marginBottom: 20 }, budgetLabel: { color: Colors.muted, fontSize: 9, letterSpacing: 1.1, fontWeight: "800" }, budgetEntry: { flexDirection: "row", alignItems: "center", marginTop: 4 }, rupee: { color: Colors.ink, fontSize: 24, fontWeight: "700", marginRight: 5 }, budgetInput: { flex: 1, color: Colors.ink, fontSize: 27, fontWeight: "800", paddingVertical: 5 }, currentBudget: { color: Colors.muted, fontSize: 10, marginTop: 2 }, saveButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, height: 43, borderRadius: 12, backgroundColor: Colors.brand, marginTop: 13 }, saveText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" }, settingRow: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: Colors.panel, borderRadius: 14, borderWidth: 1, borderColor: Colors.line, padding: 12, marginBottom: 8 }, rowIcon: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center" }, rowCopy: { flex: 1 }, rowTitle: { color: Colors.ink, fontSize: 11, fontWeight: "800" }, rowSubtitle: { color: Colors.muted, fontSize: 9, marginTop: 3 }, footnote: { color: Colors.muted, fontSize: 9, lineHeight: 14, marginTop: 9, textAlign: "center" } });
