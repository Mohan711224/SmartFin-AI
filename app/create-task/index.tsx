import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Colors } from "@/constants/theme";
import { useTasks } from "@/hooks/useTasks";
import { TaskPriority } from "@/types";

const priorities: TaskPriority[] = ["Low", "Medium", "High"];
const dueOptions = [
  { label: "Today", days: 0 },
  { label: "Tomorrow", days: 1 },
  { label: "Next week", days: 7 }
] as const;

export default function CreateTaskScreen() {
  const { addTask } = useTasks();
  const [title, setTitle] = useState("");
  const [project, setProject] = useState("Personal");
  const [notes, setNotes] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("Medium");
  const [dueInDays, setDueInDays] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  const canSave = title.trim().length > 0 && !isSaving;

  async function saveTask() {
    if (!canSave) return;
    setIsSaving(true);
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + dueInDays);
      dueDate.setHours(23, 59, 59, 999);
      await addTask({
        title: title.trim(),
        project: project.trim() || "Inbox",
        notes: notes.trim(),
        dueDate: dueDate.toISOString(),
        priority
      });
      router.back();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboard}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.label}>Task name</Text>
          <TextInput
            autoFocus
            placeholder="What needs doing?"
            placeholderTextColor={Colors.muted}
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />

          <Text style={styles.label}>Project</Text>
          <TextInput
            placeholder="Inbox"
            placeholderTextColor={Colors.muted}
            value={project}
            onChangeText={setProject}
            style={styles.input}
          />

          <Text style={styles.label}>Priority</Text>
          <View style={styles.segment}>
            {priorities.map((item) => (
              <Pressable
                key={item}
                accessibilityRole="button"
                onPress={() => setPriority(item)}
                style={[styles.segmentItem, priority === item && styles.segmentActive]}
              >
                <Text style={[styles.segmentText, priority === item && styles.segmentActiveText]}>{item}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Due</Text>
          <View style={styles.segment}>
            {dueOptions.map((item) => (
              <Pressable
                key={item.label}
                accessibilityRole="button"
                accessibilityState={{ selected: dueInDays === item.days }}
                onPress={() => setDueInDays(item.days)}
                style={[styles.segmentItem, dueInDays === item.days && styles.segmentActive]}
              >
                <Text style={[styles.segmentText, dueInDays === item.days && styles.segmentActiveText]}>
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Notes</Text>
          <TextInput
            multiline
            placeholder="Add details, links, or a quick definition of done."
            placeholderTextColor={Colors.muted}
            value={notes}
            onChangeText={setNotes}
            style={[styles.input, styles.notes]}
          />
        </ScrollView>
        <View style={styles.footer}>
          <Button label={isSaving ? "Saving…" : "Save task"} onPress={saveTask} disabled={!canSave} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.paper
  },
  keyboard: {
    flex: 1
  },
  content: {
    gap: 10,
    padding: 20
  },
  label: {
    marginTop: 8,
    color: Colors.ink,
    fontSize: 14,
    fontWeight: "800"
  },
  input: {
    minHeight: 54,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.line,
    backgroundColor: Colors.panel,
    color: Colors.ink,
    fontSize: 16,
    paddingHorizontal: 14
  },
  notes: {
    minHeight: 140,
    paddingTop: 14,
    textAlignVertical: "top"
  },
  segment: {
    flexDirection: "row",
    gap: 8
  },
  segmentItem: {
    flex: 1,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.line,
    paddingVertical: 12
  },
  segmentActive: {
    backgroundColor: Colors.brand,
    borderColor: Colors.brand
  },
  segmentText: {
    color: Colors.muted,
    fontWeight: "800"
  },
  segmentActiveText: {
    color: Colors.panel
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    backgroundColor: Colors.paper,
    padding: 20
  }
});
