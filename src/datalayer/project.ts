import pool from "../config/db";
import { ProjectModel } from "../models/project";

export const getProjectsByUser = async (userId: string): Promise<ProjectModel[]> => {
  const { rows } = await pool.query(
    `SELECT DISTINCT p.*
     FROM projects p
     LEFT JOIN tasks t ON t.project_id = p.id
     WHERE p.owner_id = $1 OR t.assignee_id = $1
     ORDER BY p.created_at DESC`,
    [userId]
  );
  return rows;
};

export const getProjectById = async (id: string): Promise<ProjectModel | null> => {
  const { rows } = await pool.query(
    "SELECT * FROM projects WHERE id = $1",
    [id]
  );
  return rows[0] || null;
};

export const createProject = async (
  id: string,
  name: string,
  description: string | undefined,
  ownerId: string
): Promise<ProjectModel> => {
  const { rows } = await pool.query(
    `INSERT INTO projects (id, name, description, owner_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [id, name, description || null, ownerId]
  );
  return rows[0];
};

export const updateProject = async (
  id: string,
  name?: string,
  description?: string
): Promise<ProjectModel | null> => {
  const fields: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (name !== undefined) {
    fields.push(`name = $${idx++}`);
    values.push(name);
  }
  if (description !== undefined) {
    fields.push(`description = $${idx++}`);
    values.push(description);
  }
  if (!fields.length) return getProjectById(id);

  values.push(id);
  const { rows } = await pool.query(
    `UPDATE projects SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *`,
    values
  );
  return rows[0] || null;
};

export const deleteProject = async (id: string): Promise<void> => {
  await pool.query("DELETE FROM tasks WHERE project_id = $1", [id]);
  await pool.query("DELETE FROM projects WHERE id = $1", [id]);
};
