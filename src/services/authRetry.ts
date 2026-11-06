import type { InternalAxiosRequestConfig } from 'axios';

/**
 * Auth-failure detection and the one retry after a token refresh (BRD 8.4.3, spec FR-4.4-09).
 * Kept free of the HTTP client and the store so there is no import cycle: the auth service
 * registers how to refresh the token and whether a logged-in session exists.
 */

export interface AuthRefresher {
  /** Requests a fresh non-logged token; resolves to it, or undefined on failure. */
  refreshToken: () => Promise<string | undefined>;
  hasLoggedInSession: () => boolean;
}

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Set on the single replay so a replayed call can never retry again */
    authRetried?: boolean;
  }
}

const AUTH_CODES = ['401', 'API_3000'];

let refresher: AuthRefresher | null = null;

export function setAuthRefresher(next: AuthRefresher | null): void {
  refresher = next;
}

interface EnvelopeBody {
  statusCode?: unknown;
  returnStatus?: { returnCode?: unknown };
}

/**
 * HTTP 401 (status only); HTTP 400 with body statusCode or returnStatus.returnCode "401" or "API_3000";
 * HTTP 200 with returnStatus.returnCode "401" (session expiry carried in the body).
 */
export function isAuthFailure(status: number | undefined, data: unknown): boolean {
  if (status === 401) {
    return true;
  }
  const body = (data && typeof data === 'object' ? data : {}) as EnvelopeBody;
  const bodyCode = String(body.returnStatus?.returnCode);
  if (status === 400) {
    return AUTH_CODES.includes(String(body.statusCode)) || AUTH_CODES.includes(bodyCode);
  }
  if (status === 200) {
    return bodyCode === '401';
  }
  return false;
}

/**
 * Prepares the single replay: only when the call is not the token call, is not already a
 * replay, and no logged-in session exists. Returns the config to replay, or undefined.
 */
export async function prepareReplay(
  config: InternalAxiosRequestConfig | undefined,
): Promise<InternalAxiosRequestConfig | undefined> {
  if (!config || !refresher || config.skipAuth || config.authRetried) {
    return undefined;
  }
  if (refresher.hasLoggedInSession()) {
    return undefined;
  }
  config.authRetried = true;
  const token = await refresher.refreshToken();
  if (!token) {
    return undefined;
  }
  config.headers.set('Authorization', `Bearer ${token}`);
  return config;
}
