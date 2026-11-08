import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

import { Task, TaskPriority } from "@/types";

type DraftTask = {
  title: string;
  notes: string;
  project: string;
  dueDate: string;
  priority: TaskPriority;
};

type TasksContextValue = {
  isReady: boolean;
  tasks: Task[];
  addTask: (draft: DraftTask) => Promise<Task>;
  updateTask: (id: string, patch: Partial<Omit<Task, "id" | "createdAt">>) => Promise<void>;
  toggleTask: (id: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  resetTasks: () => Promise<void>;
};

const STORAGE_KEY = "taskey.tasks.v1";
const TasksContext = createContext<TasksContextValue | null>(null);

const starterTasks: Task[] = [
  {
    id: "starter-1",
    title: "Plan the week",
    notes: "Pick three outcomes that would make the week feel finished.",
    project: "Personal",
    dueDate: new Date().toISOString(),
    priority: "High",
    status: "open",
    createdAt: new Date().toISOString()
  },
  {
    id: "starter-2",
    title: "Review project backlog",
    notes: "Move stale ideas out of the way and keep the next actions visible.",
    project: "Work",
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    priority: "Medium",
    status: "open",
    createdAt: new Date().toISOString()
  }
];

export function TasksProvider({ children }: PropsWithChildren) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const tasksRef = useRef<Task[]>([]);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        let next = starterTasks;
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) next = parsed;
          } catch {
            // Recover gracefully if local storage was interrupted or corrupted.
          }
        }
        tasksRef.current = next;
        setTasks(next);
      })
      .finally(() => setIsReady(true));
  }, []);

  const persist = useCallback(async (nextTasks: Task[]) => {
    tasksRef.current = nextTasks;
    setTasks(nextTasks);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextTasks));
  }, []);

  const value = useMemo<TasksContextValue>(
    () => ({
      isReady,
      tasks,
      addTask: async (draft) => {
        const task: Task = {
          id: `${Date.now()}`,
          ...draft,
          status: "open",
          createdAt: new Date().toISOString()
        };
        await persist([task, ...tasksRef.current]);
        return task;
      },
      updateTask: async (id, patch) => {
        await persist(tasksRef.current.map((task) => (task.id === id ? { ...task, ...patch } : task)));
      },
      toggleTask: async (id) => {
        await persist(
          tasksRef.current.map((task) =>
            task.id === id ? { ...task, status: task.status === "done" ? "open" : "done" } : task
          )
        );
      },
      deleteTask: async (id) => {
        await persist(tasksRef.current.filter((task) => task.id !== id));
      },
      resetTasks: async () => {
        await persist([]);
      }
    }),
    [isReady, persist, tasks]
  );

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>;
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error("useTasks must be used inside TasksProvider");
  }
  return context;
}
