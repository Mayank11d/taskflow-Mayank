import { Response } from "express";

export const sendSuccess = (
  res: Response,
  data: unknown,
  statusCode = 200
): void => {
  res.status(statusCode).json(data);
};

export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  fields?: Record<string, string>
): void => {
  const body: Record<string, unknown> = { error: message };
  if (fields) body.fields = fields;
  res.status(statusCode).json(body);
};
