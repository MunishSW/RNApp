import { ENV, TOKEN_TIMEOUT_MS } from '../config/env';
import { store } from '../store';
import { setNonLoggedToken } from '../store/tokenSlice';
import { encryptField } from './encryptionNative';
import { post, setTokenProvider } from './httpClient';
import { NON_LOGGED_TOKEN_KEY, secureStorage } from './secureStorage';

interface TokenResponse {
  token?: unknown;
}

const pending = new Set<Promise<unknown>>();
let started = false;

async function generateToken(): Promise<string | undefined> {
  // Credentials come from build config, are encrypted per field and are never logged.
  const body = {
    username: encryptField(ENV.nonLoggedUsername),
    password: encryptField(ENV.nonLoggedPassword),
  };
  const response = await post<TokenResponse>('v1/generatetoken', body, {
    baseURL: ENV.authApiUrl,
    timeout: TOKEN_TIMEOUT_MS,
    skipAuth: true,
    headers: { 'Content-Type': 'application/json', 'X-BHFL-Entity': 'mobileapp' },
  });
  const token = response?.token;
  if (typeof token !== 'string' || token.length === 0) {
    return undefined;
  }
  store.dispatch(setNonLoggedToken(token));
  try {
    secureStorage.set(NON_LOGGED_TOKEN_KEY, token);
  } catch {
    // Persisting is best effort; the in-memory token is already set.
  }
  return token;
}

/** One token request. Failure, timeout and malformed bodies are swallowed (NLH-E01). */
export function requestNonLoggedToken(): Promise<string | undefined> {
  const request = generateToken().catch(() => undefined);
  pending.add(request);
  const done = () => {
    pending.delete(request);
  };
  request.then(done, done);
  return request;
}

/** The app-start call: runs once per launch. */
export function startNonLoggedToken(): Promise<string | undefined> {
  if (started) {
    return getCurrentNonLoggedToken();
  }
  started = true;
  return requestNonLoggedToken();
}

/** Current non-logged token. Waits for any in-flight request so an early call cannot 401. */
export async function getCurrentNonLoggedToken(): Promise<string | undefined> {
  if (pending.size > 0) {
    await Promise.allSettled([...pending]);
  }
  // Only the non-logged slot is read: a logged-in token is never reused here.
  return store.getState().token.nonLoggedToken ?? undefined;
}

export function registerTokenProvider(): void {
  setTokenProvider(getCurrentNonLoggedToken);
}

/** Test seam. */
export function resetAuthServiceForTests(): void {
  pending.clear();
  started = false;
}
