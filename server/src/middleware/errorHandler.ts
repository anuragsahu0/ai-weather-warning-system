import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/apiError.js';
import { errorResponse } from '../utils/apiResponse.js';
import { config } from '../config/index.js';

export function errorHandler(err: Error | ApiError, req: Request, res: Response, _next: NextFunction): void {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let errors: unknown[] | undefined;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof Error) {
    message = err.message;
  }

  // Log in server output
  if (statusCode >= 500) {
    console.error(`[ERROR 404 API] Server Error (${statusCode}):`, err);
  }

  const responsePayload = errorResponse(message, errors);

  if (config.NODE_ENV === 'development' && !(err instanceof ApiError)) {
    responsePayload.meta = {
      ...responsePayload.meta,
      stack: err.stack,
    };
  }

  res.status(statusCode).json(responsePayload);
}
