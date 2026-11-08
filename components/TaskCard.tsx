import { Ionicons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Colors } from "@/constants/theme";
import { useTasks } from "@/hooks/useTasks";
import { Task } from "@/types";

const priorityColor = {
  Low: Colors.green,
  Medium: Colors.saffron,
  High: Colors.coral
};

export function TaskCard({ task }: { task: Task }) {
  const { toggleTask } = useTasks();
  const due = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(
    new Date(task.dueDate)
  );

  return (
    <Link href={`/task/${task.id}`} asChild>
      <Pressable style={styles.card}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: task.status === "done" }}
          accessibilityLabel={`${task.status === "done" ? "Reopen" : "Complete"} ${task.title}`}
          onPress={(event) => {
            event.stopPropagation();
            void toggleTask(task.id);
          }}
          style={styles.check}
        >
          <Ionicons
            name={task.status === "done" ? "checkmark-circle" : "ellipse-outline"}
            size={26}
            color={task.status === "done" ? Colors.green : Colors.muted}
          />
        </Pressable>
        <View style={styles.body}>
          <Text numberOfLines={1} style={[styles.title, task.status === "done" && styles.done]}>
            {task.title}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>{task.project}</Text>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.meta}>{due}</Text>
          </View>
        </View>
        <View style={[styles.priority, { backgroundColor: priorityColor[task.priority] }]}>
          <Text style={styles.priorityText}>{task.priority}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 76,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.line,
    backgroundColor: Colors.panel,
    padding: 14
  },
  check: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center"
  },
  body: {
    flex: 1,
    gap: 5
  },
  title: {
    color: Colors.ink,
    fontSize: 16,
    fontWeight: "700"
  },
  done: {
    color: Colors.muted,
    textDecorationLine: "line-through"
  },
  metaRow: {
    flexDirection: "row",
    gap: 6
  },
  meta: {
    color: Colors.muted,
    fontSize: 13,
    fontWeight: "600"
  },
  dot: {
    color: Colors.line
  },
  priority: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5
  },
  priorityText: {
    color: Colors.panel,
    fontSize: 12,
    fontWeight: "800"
  }
});
