import { Request, Response } from "express";
import catchAsync from "../helpers/catch_async";
import {
  fetchUserProjects,
  fetchProjectWithTasks,
  createNewProject,
  editProject,
  removeProject,
  fetchProjectStats,
} from "../services/project";
import { sendSuccess } from "../utility/response";

export const listProjects = catchAsync(async (req: Request, res: Response) => {
  const projects = await fetchUserProjects(req.user!.user_id);
  sendSuccess(res, { projects });
});

export const createProjectHandler = catchAsync(
  async (req: Request, res: Response) => {
    const project = await createNewProject(req.body, req.user!.user_id);
    sendSuccess(res, project, 201);
  }
);

export const getProject = catchAsync(async (req: Request, res: Response) => {
  const data = await fetchProjectWithTasks(req.params.id as string);
  sendSuccess(res, data);
});

export const updateProjectHandler = catchAsync(
  async (req: Request, res: Response) => {
    const updated = await editProject(
      req.params.id as string,
      req.user!.user_id,
      req.body
    );
    sendSuccess(res, updated);
  }
);

export const deleteProjectHandler = catchAsync(
  async (req: Request, res: Response) => {
    await removeProject(req.params.id as string, req.user!.user_id);
    res.status(204).send();
  }
);

export const getProjectStats = catchAsync(
  async (req: Request, res: Response) => {
    const stats = await fetchProjectStats(req.params.id as string);
    sendSuccess(res, stats);
  }
);
