import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { Colors } from "@/constants/theme";
import { useTasks } from "@/hooks/useTasks";

export default function TaskDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tasks, toggleTask, deleteTask } = useTasks();
  const task = tasks.find((item) => item.id === id);

  if (!task) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.missing}>
          <Text style={styles.title}>Task not found</Text>
          <Button label="Back to tasks" onPress={() => router.replace("/(tabs)")} />
        </View>
      </SafeAreaView>
    );
  }

  const due = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(task.dueDate));

  function confirmDelete() {
    Alert.alert("Delete task?", "This removes it from your device.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteTask(task.id);
          router.back();
        }
      }
    ]);
  }

  return (
    <SafeAreaView edges={["bottom"]} style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.icon}>
            <Ionicons name={task.status === "done" ? "checkmark" : "flash"} color={Colors.panel} size={28} />
          </View>
          <Text style={styles.status}>{task.status === "done" ? "Completed" : "Open"}</Text>
        </View>

        <Text style={styles.title}>{task.title}</Text>

        <View style={styles.metaGrid}>
          <Meta label="Project" value={task.project} />
          <Meta label="Due" value={due} />
          <Meta label="Priority" value={task.priority} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <Text style={styles.notes}>{task.notes || "No notes yet."}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button label={task.status === "done" ? "Mark open" : "Mark done"} onPress={() => toggleTask(task.id)} />
        <Pressable accessibilityRole="button" onPress={confirmDelete} style={styles.deleteButton}>
          <Ionicons name="trash" color={Colors.coral} size={20} />
          <Text style={styles.deleteText}>Delete</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.meta}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.paper
  },
  content: {
    flex: 1,
    gap: 18,
    padding: 20
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  icon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: Colors.brand
  },
  status: {
    color: Colors.brand,
    fontWeight: "900"
  },
  title: {
    color: Colors.ink,
    fontSize: 34,
    fontWeight: "900",
    lineHeight: 40
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  meta: {
    minWidth: "30%",
    flexGrow: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.line,
    backgroundColor: Colors.panel,
    padding: 14
  },
  metaLabel: {
    color: Colors.muted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  metaValue: {
    marginTop: 6,
    color: Colors.ink,
    fontSize: 16,
    fontWeight: "800"
  },
  section: {
    gap: 8
  },
  sectionTitle: {
    color: Colors.ink,
    fontSize: 18,
    fontWeight: "900"
  },
  notes: {
    color: Colors.muted,
    fontSize: 16,
    lineHeight: 24
  },
  footer: {
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    padding: 20
  },
  deleteButton: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8
  },
  deleteText: {
    color: Colors.coral,
    fontSize: 16,
    fontWeight: "800"
  },
  missing: {
    flex: 1,
    justifyContent: "center",
    gap: 20,
    padding: 20
  }
});
