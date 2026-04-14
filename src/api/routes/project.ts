import { Router } from "express";
import {
  listProjects,
  createProjectHandler,
  getProject,
  updateProjectHandler,
  deleteProjectHandler,
  getProjectStats,
} from "../../controllers/project";
import {
  listTasks,
  createTaskHandler,
} from "../../controllers/task";
import authMiddleware from "../../middlewares/auth";
import {
  validateCreateProject,
  validateUpdateProject,
  validateCreateTask,
} from "../celebrate";

const router = Router();

router.use(authMiddleware);

router.get("/", listProjects);
router.post("/", validateCreateProject, createProjectHandler);
router.get("/:id", getProject);
router.patch("/:id", validateUpdateProject, updateProjectHandler);
router.delete("/:id", deleteProjectHandler);
router.get("/:id/stats", getProjectStats);
router.get("/:id/tasks", listTasks);
router.post("/:id/tasks", validateCreateTask, createTaskHandler);

export default router;
