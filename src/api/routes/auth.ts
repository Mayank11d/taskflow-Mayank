import { Router } from "express";
import { register, login } from "../../controllers/auth";
import { validateRegister, validateLogin } from "../celebrate";

const router = Router();

router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);

export default router;
