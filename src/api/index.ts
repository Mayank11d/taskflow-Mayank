import { Router } from "express";
import authRoutes from "./routes/auth";
import projectRoutes from "./routes/project";
import taskRoutes from "./routes/task";

const router = Router();

router.use("/auth", authRoutes);
router.use("/projects", projectRoutes);
router.use("/tasks", taskRoutes);

export default router;
