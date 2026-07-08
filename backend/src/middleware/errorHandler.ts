import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { env } from "../config/env.js";
import { CsvParseError } from "../utils/csvParser.js";
import { GroqExtractionError } from "../services/groq.service.js";

interface ErrorResponseBody {
  success: false;
  error: string;
  code: string;
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.log("ERROR: ", err);

  let status = 500;
  let body: ErrorResponseBody = {
    success: false,
    error: "An Unexpected error occured. Please try again.",
    code: "INTERNAL_SERVER_ERROR"
  };

  if (err instanceof multer.MulterError) {
    status = 400;
    body = {
      success: false,
      error: err.code === "LIMIT_FILE_SIZE" ? `File is too large. Maximum size is ${env.MAX_FILE_SIZE_MB}MB` : err.message,
      code: `UPLOAD_${err.code}`
    };
  } else if (err instanceof CsvParseError) {
    status = 400;
    body = { success: false, error: err.message, code: "CSV_PARSE_ERROR" };
  } else if (err instanceof GroqExtractionError) {
    status = 502;
    body = { success: false, error: err.message, code: "AI_EXTRACTION_ERROR" };
  } else if (err instanceof Error) {
    status = 400;
    body = { success: false, error: err.message, code: "BAD_REQUEST" };
  }

  res.status(status).json(body);
}

export function notFoundHandler(req: Request, res: Response) {
  res.status(400).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
    code: "NOT_FOUND",
  });
}
