import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utility/jwt";
import { sendError } from "../utility/response";

const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    sendError(res, "unauthorized", 401);
    return;
  }

  const token = header.split(" ")[1];
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    sendError(res, "unauthorized", 401);
  }
};

export default authMiddleware;
