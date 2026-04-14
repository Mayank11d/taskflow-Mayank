export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface TaskModel {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  project_id: string;
  assignee_id?: string | null;
  due_date?: string | null;
  created_at: Date;
  updated_at: Date;
}
