import { Request, Response, NextFunction } from 'express';

/**
 * Custom application error with HTTP status code.
 */
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'AppError';
  }
}

/**
 * Centralized error-handling middleware.
 * Catches all errors and returns consistent JSON responses.
 */
export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  if (process.env.NODE_ENV !== 'test') {
    console.error(`❌ [${statusCode}] ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
}
