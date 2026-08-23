export interface StandardApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: Record<string, unknown>;
  timestamp: string;
}

export function successResponse<T>(data: T, message?: string, meta?: Record<string, unknown>): StandardApiResponse<T> {
  return {
    success: true,
    message,
    data,
    meta,
    timestamp: new Date().toISOString(),
  };
}

export function errorResponse(message: string, errors?: unknown[]): StandardApiResponse<null> {
  return {
    success: false,
    message,
    data: null,
    meta: errors ? { errors } : undefined,
    timestamp: new Date().toISOString(),
  };
}
