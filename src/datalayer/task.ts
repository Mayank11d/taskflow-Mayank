import pool from "../config/db";
import { TaskModel } from "../models/task";
import { UpdateTaskRequest } from "../interfaces";

export const getTasksByProject = async (
  projectId: string,
  status?: string,
  assigneeId?: string
): Promise<TaskModel[]> => {
  const conditions: string[] = ["project_id = $1"];
  const values: unknown[] = [projectId];
  let idx = 2;

  if (status) {
    conditions.push(`status = $${idx++}`);
    values.push(status);
  }
  if (assigneeId) {
    conditions.push(`assignee_id = $${idx++}`);
    values.push(assigneeId);
  }

  const { rows } = await pool.query(
    `SELECT * FROM tasks WHERE ${conditions.join(" AND ")} ORDER BY created_at DESC`,
    values
  );
  return rows;
};

export const getTaskById = async (id: string): Promise<TaskModel | null> => {
  const { rows } = await pool.query(
    "SELECT * FROM tasks WHERE id = $1",
    [id]
  );
  return rows[0] || null;
};

export const createTask = async (
  id: string,
  projectId: string,
  title: string,
  description: string | undefined,
  priority: string,
  assigneeId: string | undefined,
  dueDate: string | undefined
): Promise<TaskModel> => {
  const { rows } = await pool.query(
    `INSERT INTO tasks (id, project_id, title, description, status, priority, assignee_id, due_date)
     VALUES ($1, $2, $3, $4, 'todo', $5, $6, $7)
     RETURNING *`,
    [
      id,
      projectId,
      title,
      description || null,
      priority,
      assigneeId || null,
      dueDate || null,
    ]
  );
  return rows[0];
};

export const updateTask = async (
  id: string,
  updates: UpdateTaskRequest
): Promise<TaskModel | null> => {
  const allowed = [
    "title",
    "description",
    "status",
    "priority",
    "assignee_id",
    "due_date",
  ] as const;

  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  for (const key of allowed) {
    if ((updates as Record<string, unknown>)[key] !== undefined) {
      fields.push(`${key} = $${idx++}`);
      values.push((updates as Record<string, unknown>)[key]);
    }
  }
  if (!fields.length) return getTaskById(id);

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const { rows } = await pool.query(
    `UPDATE tasks SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  return rows[0] || null;
};

export const deleteTask = async (id: string): Promise<void> => {
  await pool.query("DELETE FROM tasks WHERE id = $1", [id]);
};

export const getTaskStats = async (projectId: string) => {
  const { rows } = await pool.query(
    `SELECT status, COUNT(*) as count
     FROM tasks
     WHERE project_id = $1
     GROUP BY status`,
    [projectId]
  );
  return rows;
};
