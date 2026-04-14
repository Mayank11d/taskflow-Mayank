import { Request, Response } from "express";
import catchAsync from "../helpers/catch_async";
import { registerUser, loginUser } from "../services/auth";
import { sendSuccess } from "../utility/response";

export const register = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const result = await registerUser(name, email, password);
  sendSuccess(res, result, 201);
});

export const login = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const result = await loginUser(email, password);
  sendSuccess(res, result, 200);
});
