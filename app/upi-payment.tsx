import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Linking, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";

export default function UpiPaymentScreen() {
  const [upiId, setUpiId] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  async function continueToUpi() {
    const value = Number(amount.replace(/,/g, ""));
    if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+$/.test(upiId.trim())) return Alert.alert("Check the UPI ID", "Enter a valid UPI ID, such as name@bank.");
    if (!Number.isFinite(value) || value <= 0) return Alert.alert("Check the amount", "Enter an amount greater than zero.");
    if (Platform.OS !== "android") return Alert.alert("Use an Android device", "UPI app handoff is available on Android devices with a UPI app installed. No payment has been made.");
    const params = [
      ["pa", upiId.trim()], ["pn", name.trim() || upiId.trim()], ["am", value.toFixed(2)], ["cu", "INR"], ...(note.trim() ? [["tn", note.trim()]] : [])
    ].map(([key, content]) => `${key}=${encodeURIComponent(content)}`).join("&");
    try {
      await Linking.openURL(`upi://pay?${params}`);
    } catch {
      Alert.alert("No UPI app found", "Install a UPI-enabled payment app on this Android device. This app does not collect your UPI PIN.");
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}><View style={styles.heroIcon}><Ionicons name="qr-code-outline" size={22} color={Colors.brand} /></View><Text style={styles.heroTitle}>Pay with UPI</Text><Text style={styles.heroCopy}>Review a payment request, then continue in a UPI app on your device.</Text></View>
        <Text style={styles.label}>RECIPIENT UPI ID</Text><TextInput value={upiId} onChangeText={setUpiId} placeholder="name@bank" placeholderTextColor="#A0A1AF" autoCapitalize="none" keyboardType="email-address" style={styles.field} />
        <Text style={styles.label}>RECIPIENT NAME <Text style={styles.optional}>(OPTIONAL)</Text></Text><TextInput value={name} onChangeText={setName} placeholder="Name shown in your payment app" placeholderTextColor="#A0A1AF" style={styles.field} />
        <Text style={styles.label}>AMOUNT</Text><View style={styles.amountField}><Text style={styles.rupee}>₹</Text><TextInput value={amount} onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ""))} placeholder="0.00" placeholderTextColor="#A0A1AF" keyboardType="decimal-pad" style={styles.amountInput} /></View>
        <Text style={styles.label}>NOTE <Text style={styles.optional}>(OPTIONAL)</Text></Text><TextInput value={note} onChangeText={setNote} placeholder="What is this payment for?" placeholderTextColor="#A0A1AF" style={styles.field} maxLength={60} />
        <View style={styles.warning}><Ionicons name="alert-circle-outline" size={17} color={Colors.coral} /><Text style={styles.warningText}>You’ll review and authorize the payment in your UPI app. This prototype cannot confirm whether it succeeded, so it won’t add it to your ledger automatically.</Text></View>
        <Pressable onPress={continueToUpi} style={styles.continueButton}><Text style={styles.continueText}>Continue to UPI app</Text><Ionicons name="open-outline" size={16} color="#FFFFFF" /></Pressable>
        <Pressable onPress={() => router.push("/import-transactions")} style={styles.importLink}><Text style={styles.importText}>Import past UPI transactions instead</Text><Ionicons name="arrow-forward" size={15} color={Colors.brand} /></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: Colors.paper }, content: { padding: 20, paddingBottom: 30 }, hero: { alignItems: "center", backgroundColor: Colors.panel, borderRadius: 16, borderWidth: 1, borderColor: Colors.line, padding: 16, marginBottom: 18 }, heroIcon: { width: 44, height: 44, alignItems: "center", justifyContent: "center", borderRadius: 14, backgroundColor: "#EFEDFF", marginBottom: 9 }, heroTitle: { color: Colors.ink, fontSize: 16, fontWeight: "800" }, heroCopy: { color: Colors.muted, textAlign: "center", fontSize: 10, lineHeight: 15, maxWidth: 270, marginTop: 5 }, label: { color: Colors.muted, fontSize: 9, fontWeight: "800", letterSpacing: 1, marginBottom: 7, marginTop: 4 }, optional: { fontSize: 8, fontWeight: "600", letterSpacing: 0 }, field: { backgroundColor: Colors.panel, borderWidth: 1, borderColor: Colors.line, borderRadius: 12, height: 45, paddingHorizontal: 12, color: Colors.ink, fontSize: 12, marginBottom: 15 }, amountField: { flexDirection: "row", alignItems: "center", height: 55, backgroundColor: Colors.panel, borderWidth: 1, borderColor: Colors.line, borderRadius: 12, paddingHorizontal: 12, marginBottom: 15 }, rupee: { color: Colors.ink, fontSize: 21, fontWeight: "700", marginRight: 6 }, amountInput: { flex: 1, color: Colors.ink, fontSize: 22, fontWeight: "800" }, warning: { flexDirection: "row", alignItems: "flex-start", gap: 8, padding: 11, backgroundColor: "#FFF0EA", borderRadius: 12, marginTop: 1, marginBottom: 14 }, warningText: { color: "#774632", flex: 1, fontSize: 10, lineHeight: 15 }, continueButton: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 48, borderRadius: 13, backgroundColor: Colors.brand }, continueText: { color: "#FFFFFF", fontSize: 11, fontWeight: "800" }, importLink: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 14 }, importText: { color: Colors.brand, fontSize: 10, fontWeight: "800" } });
