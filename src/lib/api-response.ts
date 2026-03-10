import { NextResponse } from 'next/server';

type ApiSuccessResponse<T> = {
  success: true;
  data: T;
  message?: string;
};

type ApiErrorResponse = {
  success: false;
  error: string;
  details?: unknown;
};

/**
 * Returns a standardized JSON success response.
 */
export function apiSuccess<T>(data: T, message?: string, status = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, data, ...(message && { message }) }, { status });
}

/**
 * Returns a standardized JSON error response.
 */
export function apiError(error: string, status = 500, details?: unknown): NextResponse<ApiErrorResponse> {
  const body: ApiErrorResponse = { success: false, error };
  if (details && process.env.NODE_ENV === 'development') {
    body.details = details;
  }
  return NextResponse.json(body, { status });
}

/** Common HTTP status code shorthands */
export const HTTP = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;
