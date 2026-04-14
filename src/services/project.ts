import { randomUUID } from "crypto";
import { throwServiceError } from "../helpers/service_helper";
import { ProjectModel, ProjectWithTasks } from "../models/project";
import { CreateProjectRequest, UpdateProjectRequest } from "../interfaces";
import {
  getProjectsByUser,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
} from "../datalayer/project";
import { getTasksByProject, getTaskStats } from "../datalayer/task";

export const fetchUserProjects = async (
  userId: string,
): Promise<ProjectModel[]> => {
  return getProjectsByUser(userId);
};

export const fetchProjectWithTasks = async (
  projectId: string,
): Promise<ProjectWithTasks> => {
  const project = await getProjectById(projectId);
  if (!project) throwServiceError(404, "not found");

  const tasks = await getTasksByProject(projectId);
  return { ...project!, tasks };
};

export const createNewProject = async (
  body: CreateProjectRequest,
  ownerId: string,
): Promise<ProjectModel> => {
  return createProject(randomUUID(), body.name, body.description, ownerId);
};

export const editProject = async (
  projectId: string,
  requesterId: string,
  body: UpdateProjectRequest,
): Promise<ProjectModel | null> => {
  const project = await getProjectById(projectId);
  if (!project) throwServiceError(404, "not found");
  if (project!.owner_id !== requesterId) throwServiceError(403, "forbidden");

  return updateProject(projectId, body.name, body.description);
};

export const removeProject = async (
  projectId: string,
  requesterId: string,
): Promise<void> => {
  const project = await getProjectById(projectId);
  if (!project) throwServiceError(404, "not found");
  if (project!.owner_id !== requesterId) throwServiceError(403, "forbidden");

  await deleteProject(projectId);
};

export const fetchProjectStats = async (projectId: string) => {
  const project = await getProjectById(projectId);
  if (!project) throwServiceError(404, "not found");

  const stats = await getTaskStats(projectId);
  return { project_id: projectId, stats };
};
