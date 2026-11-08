import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { useFinance } from "@/hooks/useFinance";
import { TransactionType } from "@/types-finance";

const expenseCategories = ["Food & groceries", "Transport", "Shopping", "Bills & utilities", "Health", "Other"];
const incomeCategories = ["Salary", "Freelance", "Gift", "Other"];
const paymentMethods = ["UPI", "Card", "Bank transfer", "Wallet", "Cash", "Other"];

export default function AddTransactionScreen() {
  const { addTransaction } = useFinance();
  const [type, setType] = useState<TransactionType>("expense");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(expenseCategories[0]);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [saving, setSaving] = useState(false);
  const categories = type === "expense" ? expenseCategories : incomeCategories;

  function changeType(next: TransactionType) {
    setType(next);
    setCategory(next === "expense" ? expenseCategories[0] : incomeCategories[0]);
  }

  async function save() {
    const parsedAmount = Number(amount.replace(/,/g, ""));
    if (!title.trim()) return Alert.alert("Add a description", "Enter a name for this transaction.");
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return Alert.alert("Check the amount", "Enter an amount greater than zero.");
    setSaving(true);
    try {
      await addTransaction({ title: title.trim(), category, amount: parsedAmount, type, paymentMethod, source: "manual" });
      router.back();
    } catch {
      Alert.alert("Couldn’t save", "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["bottom"]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.intro}>Keep your money picture up to date by adding an income or expense.</Text>
        <View style={styles.typeSwitch}>
          {(["expense", "income"] as TransactionType[]).map((item) => <Pressable key={item} onPress={() => changeType(item)} style={[styles.typeOption, type === item && (item === "expense" ? styles.expenseSelected : styles.incomeSelected)]}><Ionicons name={item === "expense" ? "arrow-up" : "arrow-down"} size={16} color={type === item ? "#FFFFFF" : Colors.muted} /><Text style={[styles.typeText, type === item && styles.typeTextSelected]}>{item === "expense" ? "Expense" : "Income"}</Text></Pressable>)}
        </View>

        <Text style={styles.label}>AMOUNT</Text>
        <View style={styles.amountField}><Text style={styles.rupee}>₹</Text><TextInput value={amount} onChangeText={(text) => setAmount(text.replace(/[^0-9.]/g, ""))} placeholder="0" placeholderTextColor="#B3B3C0" keyboardType="decimal-pad" style={styles.amountInput} autoFocus /></View>

        <Text style={styles.label}>DESCRIPTION</Text>
        <TextInput value={title} onChangeText={setTitle} placeholder={type === "expense" ? "e.g. Lunch with friends" : "e.g. Monthly salary"} placeholderTextColor="#A0A1AF" style={styles.textField} maxLength={48} />

        <Text style={styles.label}>CATEGORY</Text>
        <View style={styles.categories}>{categories.map((item) => <Pressable key={item} onPress={() => setCategory(item)} style={[styles.category, category === item && styles.categorySelected]}><Text style={[styles.categoryText, category === item && styles.categoryTextSelected]}>{item}</Text></Pressable>)}</View>

        <Text style={styles.label}>PAYMENT METHOD</Text>
        <View style={styles.categories}>{paymentMethods.map((item) => <Pressable key={item} onPress={() => setPaymentMethod(item)} style={[styles.category, paymentMethod === item && styles.categorySelected]}><Text style={[styles.categoryText, paymentMethod === item && styles.categoryTextSelected]}>{item}</Text></Pressable>)}</View>

        <View style={styles.localNote}><Ionicons name="lock-closed-outline" size={16} color={Colors.brand} /><Text style={styles.localNoteText}>Saved on this device. No bank connection needed.</Text></View>
        <Pressable onPress={save} disabled={saving} style={[styles.saveButton, saving && styles.saving]}><Text style={styles.saveText}>{saving ? "Saving…" : "Save transaction"}</Text><Ionicons name="arrow-forward" size={17} color="#FFFFFF" /></Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.paper }, content: { padding: 20, paddingBottom: 30 }, intro: { color: Colors.muted, fontSize: 13, lineHeight: 20, marginBottom: 20 }, typeSwitch: { flexDirection: "row", gap: 8, marginBottom: 24 }, typeOption: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, height: 45, borderRadius: 13, backgroundColor: Colors.panel, borderWidth: 1, borderColor: Colors.line }, expenseSelected: { backgroundColor: Colors.coral, borderColor: Colors.coral }, incomeSelected: { backgroundColor: Colors.green, borderColor: Colors.green }, typeText: { color: Colors.muted, fontSize: 12, fontWeight: "700" }, typeTextSelected: { color: "#FFFFFF" }, label: { color: Colors.muted, fontSize: 9, letterSpacing: 1.1, fontWeight: "800", marginBottom: 8, marginTop: 4 }, amountField: { flexDirection: "row", alignItems: "center", backgroundColor: Colors.panel, borderWidth: 1, borderColor: Colors.line, borderRadius: 14, paddingHorizontal: 14, height: 66, marginBottom: 20 }, rupee: { color: Colors.ink, fontSize: 26, fontWeight: "700", marginRight: 8 }, amountInput: { color: Colors.ink, fontSize: 30, fontWeight: "800", flex: 1 }, textField: { backgroundColor: Colors.panel, borderWidth: 1, borderColor: Colors.line, borderRadius: 13, paddingHorizontal: 13, height: 48, color: Colors.ink, fontSize: 13, marginBottom: 20 }, categories: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 }, category: { paddingHorizontal: 11, paddingVertical: 9, borderRadius: 18, borderWidth: 1, borderColor: Colors.line, backgroundColor: Colors.panel }, categorySelected: { borderColor: Colors.brand, backgroundColor: "#EFEDFF" }, categoryText: { color: Colors.muted, fontSize: 10, fontWeight: "700" }, categoryTextSelected: { color: Colors.brand }, localNote: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#EFEDFF", borderRadius: 12, padding: 12, marginBottom: 18 }, localNoteText: { color: Colors.brandDark, fontSize: 10, flex: 1 }, saveButton: { height: 50, borderRadius: 14, backgroundColor: Colors.brand, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }, saving: { opacity: 0.6 }, saveText: { color: "#FFFFFF", fontSize: 13, fontWeight: "800" }
});
