import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "@/constants/theme";
import { currentMonthTransactions, formatCurrency, totalByType, useFinance } from "@/hooks/useFinance";

const prompts = ["How much have I spent?", "Where can I save?", "What’s my balance?"];
type Message = { id: string; role: "assistant" | "user"; text: string };

export default function AssistantScreen() {
  const { transactions, budget, balance } = useFinance();
  const monthly = currentMonthTransactions(transactions);
  const expenses = monthly.filter((item) => item.type === "expense");
  const spent = totalByType(monthly, "expense");
  const income = totalByType(monthly, "income");
  const categories = Object.entries(expenses.reduce<Record<string, number>>((result, item) => {
    result[item.category] = (result[item.category] || 0) + item.amount;
    return result;
  }, {})).sort((a, b) => b[1] - a[1]);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Message[]>([{ id: "hello", role: "assistant", text: "Hi Mohan! I can help you explore the transactions and budget you’ve entered here." }]);
  const threadRef = useRef<ScrollView>(null);

  function answerFor(text: string) {
    const normalized = text.toLowerCase();
    const matchingCategory = categories.find(([label]) => normalized.includes(label.toLowerCase()));
    if (matchingCategory) return `You’ve recorded ${formatCurrency(matchingCategory[1])} for ${matchingCategory[0]} this month, across ${expenses.filter((item) => item.category === matchingCategory[0]).length} expense entries.`;
    if (/balance|account|available/.test(normalized)) return `Your manually tracked balance is ${formatCurrency(balance)}. Add each income and expense to keep it current.`;
    if (/income|salary|earned|earnings/.test(normalized)) return `You’ve recorded ${formatCurrency(income)} in income this month.`;
    if (/budget|left|remaining|spent|spending/.test(normalized)) {
      const remaining = budget - spent;
      return `You’ve recorded ${formatCurrency(spent)} in spending against a ${formatCurrency(budget)} budget. ${remaining >= 0 ? `${formatCurrency(remaining)} remains.` : `You’re ${formatCurrency(Math.abs(remaining))} over budget.`}`;
    }
    if (/save|cut|reduce|less/.test(normalized) && categories.length) return `Your largest category is ${categories[0][0]} at ${formatCurrency(categories[0][1])}. Reviewing purchases there could be a useful place to look for savings.`;
    const biggest = categories[0];
    return `This month you’ve recorded ${formatCurrency(income)} in income and ${formatCurrency(spent)} in spending. ${biggest ? `Your largest expense category is ${biggest[0]} (${formatCurrency(biggest[1])}).` : "Add expenses to see a category breakdown."}`;
  }

  const send = (value = question) => {
    if (!value.trim()) return;
    setMessages((current) => [...current, { id: `user-${Date.now()}`, role: "user", text: value.trim() }, { id: `answer-${Date.now()}`, role: "assistant", text: answerFor(value.trim()) }]);
    setQuestion("");
    requestAnimationFrame(() => threadRef.current?.scrollToEnd({ animated: true }));
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.assistantMark}><Ionicons name="sparkles" size={20} color="#FFF" /></View>
          <View style={styles.headerCopy}><Text style={styles.title}>Money coach</Text><View style={styles.onlineRow}><View style={styles.onlineDot} /><Text style={styles.online}>Local finance preview</Text></View></View>
          <View style={styles.localBadge}><Ionicons name="phone-portrait-outline" size={13} color={Colors.brand} /><Text style={styles.localBadgeText}>PRIVATE</Text></View>
        </View>

        <ScrollView ref={threadRef} style={styles.thread} contentContainerStyle={styles.threadContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.today}>TODAY</Text>
          {messages.map((message) => message.role === "user" ? <View key={message.id} style={styles.userMessage}><Text style={styles.userText}>{message.text}</Text></View> : <View key={message.id} style={styles.assistantMessage}><View style={styles.messageAvatar}><Ionicons name="sparkles" size={13} color={Colors.brand} /></View><View style={styles.messageBody}><Text style={styles.messageText}>{message.text}</Text><Text style={styles.time}>Based on your entries</Text></View></View>)}
          {messages.length === 1 ? <View style={styles.promptSection}><Text style={styles.promptLabel}>TRY ASKING</Text>{prompts.map((item) => <Pressable key={item} onPress={() => send(item)} style={styles.prompt}><Text style={styles.promptText}>{item}</Text><Ionicons name="arrow-up" size={15} color={Colors.brand} /></Pressable>)}</View> : null}
          <View style={styles.dataNotice}><Ionicons name="shield-checkmark-outline" size={15} color={Colors.muted} /><Text style={styles.dataNoticeText}>Answers use your saved transactions and simple local rules. Demo entries may be included; no AI provider is connected.</Text></View>
        </ScrollView>

        <View style={styles.composerWrap}><View style={styles.composer}><TextInput value={question} onChangeText={setQuestion} onSubmitEditing={() => send()} returnKeyType="send" placeholder="Ask about your money..." placeholderTextColor="#9999AA" style={styles.input} multiline /><Pressable onPress={() => send()} style={styles.sendButton} accessibilityRole="button" accessibilityLabel="Send message"><Ionicons name="arrow-up" size={19} color="#FFF" /></Pressable></View><Text style={styles.disclaimer}>AI can make mistakes. Check important financial details.</Text></View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.paper }, screen: { flex: 1, width: "100%", maxWidth: 620, alignSelf: "center" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: Colors.line, backgroundColor: Colors.panel }, assistantMark: { width: 42, height: 42, alignItems: "center", justifyContent: "center", borderRadius: 15, backgroundColor: Colors.brand }, headerCopy: { flex: 1, marginLeft: 11 }, title: { color: Colors.ink, fontWeight: "800", fontSize: 15 }, onlineRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 3 }, onlineDot: { width: 6, height: 6, borderRadius: 4, backgroundColor: Colors.green }, online: { color: Colors.muted, fontSize: 10 }, localBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 9, backgroundColor: "#EFEDFF" }, localBadgeText: { color: Colors.brand, fontSize: 8, letterSpacing: 0.6, fontWeight: "900" },
  thread: { flex: 1 }, threadContent: { padding: 20, paddingBottom: 28 }, today: { color: Colors.muted, textAlign: "center", letterSpacing: 1.3, fontSize: 9, fontWeight: "800", marginBottom: 20 }, assistantMessage: { flexDirection: "row", alignItems: "flex-start", gap: 9, marginBottom: 16 }, messageAvatar: { width: 27, height: 27, alignItems: "center", justifyContent: "center", borderRadius: 10, backgroundColor: "#EAE7FF", marginTop: 2 }, messageBody: { maxWidth: "88%", backgroundColor: Colors.panel, borderWidth: 1, borderColor: Colors.line, borderRadius: 4, borderTopLeftRadius: 14, borderTopRightRadius: 14, borderBottomRightRadius: 14, padding: 13 }, messageText: { color: Colors.ink, fontSize: 12, lineHeight: 19 }, time: { color: Colors.muted, fontSize: 9, marginTop: 8 }, promptSection: { paddingLeft: 36, gap: 8, marginTop: 3, marginBottom: 20 }, promptLabel: { color: Colors.muted, fontWeight: "800", fontSize: 8, letterSpacing: 1, marginBottom: 2 }, prompt: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 11, borderRadius: 12, backgroundColor: Colors.panel, borderWidth: 1, borderColor: Colors.line }, promptText: { color: Colors.brandDark, fontSize: 11, fontWeight: "700" }, userMessage: { alignSelf: "flex-end", maxWidth: "82%", backgroundColor: Colors.brand, borderRadius: 14, borderBottomRightRadius: 4, paddingHorizontal: 13, paddingVertical: 10, marginBottom: 16 }, userText: { color: "#FFF", fontSize: 12, lineHeight: 18 }, dataNotice: { flexDirection: "row", alignItems: "flex-start", gap: 7, padding: 11, borderRadius: 12, backgroundColor: "#F0EFF6", marginLeft: 36, marginTop: 8 }, dataNoticeText: { flex: 1, color: Colors.muted, fontSize: 10, lineHeight: 15 },
  composerWrap: { backgroundColor: Colors.paper, borderTopWidth: 1, borderTopColor: Colors.line, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }, composer: { flexDirection: "row", alignItems: "flex-end", borderRadius: 16, backgroundColor: Colors.panel, borderWidth: 1, borderColor: Colors.line, paddingLeft: 13, paddingRight: 5, paddingVertical: 5 }, input: { flex: 1, minHeight: 38, maxHeight: 80, color: Colors.ink, fontSize: 12, paddingTop: 10, paddingBottom: 8 }, sendButton: { width: 34, height: 34, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: Colors.brand }, disclaimer: { color: Colors.muted, fontSize: 9, textAlign: "center", marginTop: 7 }
});
