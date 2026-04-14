import express, { Application, Request, Response, NextFunction } from "express";
import { celebrate } from "celebrate";
import apiRouter from "../api/index";
import { isServiceError } from "../helpers/service_helper";
import { sendError } from "../utility/response";

const expressLoader = (app: Application): void => {
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  
  app.get("/health", (_req, res) => res.json({ status: "ok" }));


  app.use("/", apiRouter);

  
  app.use((_req: Request, res: Response) => {
    sendError(res, "not found", 404);
  });


  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  
    if (err && typeof err === 'object' && 'joi' in err) {
      const celebrateErr = err as any;
      const details =
        celebrateErr.details?.get("body") ||
        celebrateErr.details?.get("params") ||
        celebrateErr.details?.get("query");

      const fields: Record<string, string> = {};
      if (details?.details) {
        details.details.forEach((d: any) => {
          const key = d.path?.[0] || "field";
          fields[key] = d.message.replace(/['"]/g, "");
        });
      }
      sendError(res, "validation failed", 400, fields);
      return;
    }


    if (isServiceError(err)) {
      sendError(res, err.message, err.statusCode, err.fields);
      return;
    }

    console.error("Unhandled error:", err);
    sendError(res, "internal server error", 500);
  });
};

export default expressLoader;
