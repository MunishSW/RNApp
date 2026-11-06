import type { InternalAxiosRequestConfig } from 'axios';
import { store } from '../../store';
import { clearNonLoggedToken, setLoggedInToken } from '../../store/tokenSlice';
import { requestNonLoggedToken, resetAuthServiceForTests } from '../authService';
import { apiClient, setTokenProvider } from '../httpClient';
import { setSecureStorageForTests } from '../secureStorage';

jest.mock('../encryptionNative', () => ({
  encryptField: jest.fn((plain: string) => `enc(${plain})`),
}));

type Captured = InternalAxiosRequestConfig;

function stub(captured: Captured[], respond: () => Promise<unknown>) {
  apiClient.defaults.adapter = async config => {
    captured.push(config);
    const data = await respond();
    return { data, status: 200, statusText: 'OK', headers: {}, config };
  };
}

beforeEach(() => {
  resetAuthServiceForTests();
  store.dispatch(clearNonLoggedToken());
  store.dispatch(setLoggedInToken(null));
  setSecureStorageForTests({ set: () => undefined, get: () => undefined, remove: () => undefined });
});

afterEach(() => {
  setTokenProvider(null);
  setSecureStorageForTests(undefined);
});

describe('generatetoken contract (contracts/generatetoken.md)', () => {
  // Covers: FR-4.4-02, FR-4.4-08, BRD 8.1.1 - JSON content type, entity header, no Bearer, no standard headers, no X-BHFL-Auth
  it('[TC-401] sends JSON with X-BHFL-Entity and no Authorization, standard or X-BHFL-Auth headers', async () => {
    const captured: Captured[] = [];
    setTokenProvider(async () => 'must-not-be-used');
    stub(captured, async () => ({ token: 'jwt' }));
    await requestNonLoggedToken();
    const h = captured[0].headers;
    expect(captured[0].method).toBe('post');
    expect(h.get('Content-Type')).toBe('application/json');
    expect(h.get('X-BHFL-Entity')).toBe('mobileapp');
    expect(h.has('Authorization')).toBe(false);
    expect(h.has('app-version')).toBe(false);
    expect(h.has('platform')).toBe(false);
    expect(h.has('device-details')).toBe(false);
    expect(h.has('X-BHFL-Auth')).toBe(false);
  });

  // Covers: FR-4.4-03, TV-1 - the token is stored only for a non-empty string
  it('[TC-401] stores a non-empty string token and rejects anything else', async () => {
    stub([], async () => ({ token: 'jwt-ok' }));
    await requestNonLoggedToken();
    expect(store.getState().token.nonLoggedToken).toBe('jwt-ok');
    store.dispatch(clearNonLoggedToken());
    for (const body of [{ token: '' }, { token: 7 }, { token: null }, {}, null, 'text']) {
      stub([], async () => body);
      await expect(requestNonLoggedToken()).resolves.toBeUndefined();
    }
    expect(store.getState().token.nonLoggedToken).toBeNull();
  });

  // Covers: FR-4.4-06, N-01, TC-402 - every failure is swallowed (no throw reaches the UI)
  it('[TC-402] resolves quietly for network, 4xx and 5xx failures', async () => {
    for (const status of [400, 401, 403, 500, 503]) {
      apiClient.defaults.adapter = async config => {
        throw Object.assign(new Error(`Request failed with status code ${status}`), {
          config,
          response: { status, data: {} },
        });
      };
      await expect(requestNonLoggedToken()).resolves.toBeUndefined();
    }
    apiClient.defaults.adapter = async () => {
      throw new Error('Network Error');
    };
    await expect(requestNonLoggedToken()).resolves.toBeUndefined();
  });

  // Covers: FR-4.4-05, E-13, TC-401 - a logged-in token is not used as the non-logged token
  it('[TC-401] leaves the logged-in slot alone and fills only the non-logged slot', async () => {
    store.dispatch(setLoggedInToken('LOGGED-IN'));
    stub([], async () => ({ token: 'fresh' }));
    await requestNonLoggedToken();
    expect(store.getState().token.nonLoggedToken).toBe('fresh');
    expect(store.getState().token.loggedInToken).toBe('LOGGED-IN');
  });
});
