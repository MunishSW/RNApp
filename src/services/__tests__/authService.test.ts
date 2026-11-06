import type { InternalAxiosRequestConfig } from 'axios';
import { store } from '../../store';
import { clearNonLoggedToken, setLoggedInToken } from '../../store/tokenSlice';
import {
  getCurrentNonLoggedToken,
  requestNonLoggedToken,
  resetAuthServiceForTests,
  startNonLoggedToken,
} from '../authService';
import { apiClient } from '../httpClient';
import {
  NON_LOGGED_TOKEN_KEY,
  secureStorage,
  setSecureStorageForTests,
} from '../secureStorage';

jest.mock('../encryptionNative', () => ({
  encryptField: jest.fn((plain: string) => `enc(${plain})`),
}));

import { encryptField } from '../encryptionNative';

type Captured = InternalAxiosRequestConfig;

function stub(captured: Captured[], respond: () => Promise<unknown>) {
  apiClient.defaults.adapter = async config => {
    captured.push(config);
    const data = await respond();
    return { data, status: 200, statusText: 'OK', headers: {}, config };
  };
}

const memory = new Map<string, string>();

beforeEach(() => {
  resetAuthServiceForTests();
  store.dispatch(clearNonLoggedToken());
  store.dispatch(setLoggedInToken(null));
  memory.clear();
  setSecureStorageForTests({
    set: (k, v) => void memory.set(k, v),
    get: k => memory.get(k),
    remove: k => void memory.delete(k),
  });
  (encryptField as jest.Mock).mockClear();
});

afterEach(() => {
  setSecureStorageForTests(undefined);
});

describe('authService', () => {
  // Covers: HOME_TOKEN_TC_007 — token held in memory and in encrypted storage key auth_token_Nonlogged
  it('[HOME_TOKEN_TC_007] stores the token in memory and under auth_token_Nonlogged', async () => {
    stub([], async () => ({ token: 'jwt-1' }));
    await requestNonLoggedToken();
    expect(store.getState().token.nonLoggedToken).toBe('jwt-1');
    expect(secureStorage.get(NON_LOGGED_TOKEN_KEY)).toBe('jwt-1');
    expect(NON_LOGGED_TOKEN_KEY).toBe('auth_token_Nonlogged');
  });

  // Covers: HOME_TOKEN_TC_006 — username and password are encrypted, never plain
  it('[HOME_TOKEN_TC_006] sends encrypted username and password only', async () => {
    const captured: Captured[] = [];
    stub(captured, async () => ({ token: 'jwt' }));
    await requestNonLoggedToken();
    expect(encryptField).toHaveBeenCalledWith('test-user');
    expect(encryptField).toHaveBeenCalledWith('test-pass');
    const sent = JSON.parse(String(captured[0].data));
    expect(sent).toEqual({ username: 'enc(test-user)', password: 'enc(test-pass)' });
    expect(JSON.stringify(sent)).not.toContain('"test-user"');
  });

  // Covers: HOME_TOKEN_TC_002 — 10 s timeout, silent failure
  it('[HOME_TOKEN_TC_002] uses a 10 s timeout and swallows a timeout error', async () => {
    const captured: Captured[] = [];
    stub(captured, async () => {
      throw Object.assign(new Error('timeout of 10000ms exceeded'), { code: 'ECONNABORTED' });
    });
    await expect(requestNonLoggedToken()).resolves.toBeUndefined();
    expect(captured[0].timeout).toBe(10000);
    expect(captured[0].baseURL).toBe('https://auth.example.test/auth/');
    expect(captured[0].url).toBe('v1/generatetoken');
    expect(captured[0].headers.get('X-BHFL-Entity')).toBe('mobileapp');
    expect(store.getState().token.nonLoggedToken).toBeNull();
  });

  // Covers: HOME_STATE_TC_003 — token failure handled silently
  it('swallows 5xx and non-string tokens (TV-1)', async () => {
    stub([], async () => {
      throw new Error('Request failed with status code 500');
    });
    await expect(requestNonLoggedToken()).resolves.toBeUndefined();
    stub([], async () => ({ token: '' }));
    await expect(requestNonLoggedToken()).resolves.toBeUndefined();
    stub([], async () => ({ token: 42 }));
    await expect(requestNonLoggedToken()).resolves.toBeUndefined();
    stub([], async () => null);
    await expect(requestNonLoggedToken()).resolves.toBeUndefined();
    expect(store.getState().token.nonLoggedToken).toBeNull();
  });

  // Covers: HOME_TOKEN_TC_003 — an early call waits for the in-flight token
  // Covers: NLMISC_TC_001 — token is available to secured calls
  it('[HOME_TOKEN_TC_003] getCurrentNonLoggedToken waits for the in-flight request', async () => {
    let release: () => void = () => undefined;
    let adapterCalled: () => void = () => undefined;
    const called = new Promise<void>(resolve => { adapterCalled = resolve; });
    stub([], () => new Promise(resolve => {
      release = () => resolve({ token: 'late' });
      adapterCalled();
    }));
    const request = requestNonLoggedToken();
    const early = getCurrentNonLoggedToken();
    let settled = false;
    early.then(() => { settled = true; });
    await called;
    expect(settled).toBe(false);
    release();
    await request;
    await expect(early).resolves.toBe('late');
  });

  // Covers: HOME_TOKEN_TC_004 — stale logged-in token never used as non-logged token
  it('[HOME_TOKEN_TC_004] never returns the logged-in token and requests a fresh one', async () => {
    store.dispatch(setLoggedInToken('LOGGED-IN'));
    await expect(getCurrentNonLoggedToken()).resolves.toBeUndefined();
    const captured: Captured[] = [];
    stub(captured, async () => ({ token: 'fresh' }));
    await startNonLoggedToken();
    expect(captured).toHaveLength(1);
    await expect(getCurrentNonLoggedToken()).resolves.toBe('fresh');
  });

  // Covers: NLMISC_TC_022 — no extra token calls beyond app start + Home mount
  it('start runs once per launch; each Home mount adds exactly one request', async () => {
    const captured: Captured[] = [];
    stub(captured, async () => ({ token: 'jwt' }));
    await startNonLoggedToken();
    await startNonLoggedToken();
    expect(captured).toHaveLength(1);
    await requestNonLoggedToken();
    expect(captured).toHaveLength(2);
  });
});
