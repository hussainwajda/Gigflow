import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";

import { env } from "../config/env.js";
import type { ApiErrorBody } from "../types/shared.types.js";
import { AppError } from "../utils/app-error.js";

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
};

export const errorHandler: ErrorRequestHandler = (
  error: unknown,
  _req: Request,
  res: Response<ApiErrorBody>,
  _next: NextFunction,
): void => {
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const message = error instanceof Error ? error.message : "Internal server error";

  if (env.NODE_ENV === "development") {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV === "development" && error instanceof Error ? { stack: error.stack } : {}),
  });
};
