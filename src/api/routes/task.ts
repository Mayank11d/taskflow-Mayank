import { Router } from "express";
import {
  updateTaskHandler,
  deleteTaskHandler,
} from "../../controllers/task";
import authMiddleware from "../../middlewares/auth";
import { validateUpdateTask } from "../celebrate";

const router = Router();

router.use(authMiddleware);

router.patch("/:id", validateUpdateTask, updateTaskHandler);
router.delete("/:id", deleteTaskHandler);

export default router;
