import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("Centralized Error Handler: ", err.message, err.stack);

  let statusCode = err.status || 500;
  let message = err.message || "An unexpected error occurred";

  if (err.name === "MulterError") {
    if (err.code === "LIMIT_FILE_SIZE") {
      statusCode = 413;
      message = "File Too Large. Maximum size is 10MB";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      statusCode = 400;
      message = "Too many files uploaded or incorrect filed name";
    }
  } else if (err.status === 401 || err.status === 403) {
    message = "Authentication failed. Please sign in again";
  } else if (message.includes("OpenAI returned an invalid JSON format")) {
    statusCode = 500;
  } else if (message.includes("Unsupported file type")) {
    statusCode = 422;
  }
  res.status(statusCode).json({ error: message });
};
