export type TaskPriority = "Low" | "Medium" | "High";
export type TaskStatus = "open" | "done";

export type Task = {
  id: string;
  title: string;
  notes: string;
  project: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  createdAt: string;
};
