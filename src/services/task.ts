import { randomUUID } from "crypto";
import { throwServiceError } from "../helpers/service_helper";
import { TaskModel } from "../models/task";
import {
  CreateTaskRequest,
  UpdateTaskRequest,
  TaskFilters,
} from "../interfaces";
import { getProjectById } from "../datalayer/project";
import {
  getTasksByProject,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} from "../datalayer/task";

const VALID_STATUSES = ["todo", "in_progress", "done"];
const VALID_PRIORITIES = ["low", "medium", "high"];

export const fetchTasksByProject = async (
  projectId: string,
  filters: TaskFilters,
): Promise<TaskModel[]> => {
  const project = await getProjectById(projectId);
  if (!project) throwServiceError(404, "not found");

  return getTasksByProject(projectId, filters.status, filters.assignee);
};

export const createNewTask = async (
  projectId: string,
  body: CreateTaskRequest,
): Promise<TaskModel> => {
  const project = await getProjectById(projectId);
  if (!project) throwServiceError(404, "not found");

  if (body.priority && !VALID_PRIORITIES.includes(body.priority)) {
    throwServiceError(400, "validation failed", {
      priority: "must be low, medium, or high",
    });
  }

  return createTask(
    randomUUID(),
    projectId,
    body.title,
    body.description,
    body.priority || "medium",
    body.assignee_id,
    body.due_date,
  );
};

export const editTask = async (
  taskId: string,
  body: UpdateTaskRequest,
): Promise<TaskModel | null> => {
  const task = await getTaskById(taskId);
  if (!task) throwServiceError(404, "not found");

  if (body.status && !VALID_STATUSES.includes(body.status)) {
    throwServiceError(400, "validation failed", {
      status: "must be todo, in_progress, or done",
    });
  }
  if (body.priority && !VALID_PRIORITIES.includes(body.priority)) {
    throwServiceError(400, "validation failed", {
      priority: "must be low, medium, or high",
    });
  }

  return updateTask(taskId, body);
};

export const removeTask = async (
  taskId: string,
  requesterId: string,
): Promise<void> => {
  const task = await getTaskById(taskId);
  if (!task) throwServiceError(404, "not found");

  const project = await getProjectById(task!.project_id);
  if (project?.owner_id !== requesterId) throwServiceError(403, "forbidden");

  await deleteTask(taskId);
};
