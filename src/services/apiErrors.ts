/**
 * Client-derived error fields (BRD 8.4.4): HTTP status, errorCategory and retryable.
 * Used for debug logging and tests; user-facing behaviour follows BRD 8.4.2 per call.
 */

export type ErrorCategory = 'Network' | 'Auth' | 'Server' | 'Validation';

export interface ApiErrorInfo {
  status?: number;
  errorCategory: ErrorCategory;
  retryable: boolean;
}

interface ErrorLike {
  response?: { status?: number; data?: unknown };
  code?: string;
}

const AUTH_CODES = ['401', 'API_3000'];

function bodyAuthCode(data: unknown): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }
  const body = data as { statusCode?: unknown; returnStatus?: { returnCode?: unknown } };
  return (
    AUTH_CODES.includes(String(body.statusCode)) ||
    AUTH_CODES.includes(String(body.returnStatus?.returnCode))
  );
}

/** Network and timeout failures have no response; 429 and 5xx are retryable (BRD 8.4.4). */
export function classifyApiError(error: unknown): ApiErrorInfo {
  const err = (error ?? {}) as ErrorLike;
  const status = err.response?.status;

  if (typeof status !== 'number') {
    return { errorCategory: 'Network', retryable: true };
  }
  if (status === 401 || (status === 400 && bodyAuthCode(err.response?.data))) {
    return { status, errorCategory: 'Auth', retryable: false };
  }
  if (status === 429 || status >= 500) {
    return { status, errorCategory: 'Server', retryable: true };
  }
  return { status, errorCategory: 'Validation', retryable: false };
}
