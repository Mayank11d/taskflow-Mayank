import { Request, Response } from "express";
import catchAsync from "../helpers/catch_async";
import {
  fetchTasksByProject,
  createNewTask,
  editTask,
  removeTask,
} from "../services/task";
import { sendSuccess } from "../utility/response";

export const listTasks = catchAsync(async (req: Request, res: Response) => {
  const { status, assignee } = req.query as {
    status?: string;
    assignee?: string;
  };
  const tasks = await fetchTasksByProject(req.params.id as string, { status, assignee });
  sendSuccess(res, { tasks });
});

export const createTaskHandler = catchAsync(
  async (req: Request, res: Response) => {
    const task = await createNewTask(req.params.id as string, req.body);
    sendSuccess(res, task, 201);
  }
);

export const updateTaskHandler = catchAsync(
  async (req: Request, res: Response) => {
    const updated = await editTask(req.params.id as string, req.body);
    sendSuccess(res, updated);
  }
);

export const deleteTaskHandler = catchAsync(
  async (req: Request, res: Response) => {
    await removeTask(req.params.id as string, req.user!.user_id);
    res.status(204).send();
  }
);
