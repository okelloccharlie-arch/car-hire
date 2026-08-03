import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export function notFound(req: Request, res: Response) {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  console.error(err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ success: false, message: err.message });
  }

  const message = err instanceof Error ? err.message : "Internal server error";
  res.status(500).json({ success: false, message });
}
