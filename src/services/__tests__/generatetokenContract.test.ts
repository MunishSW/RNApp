import type { InternalAxiosRequestConfig } from 'axios';
import { store } from '../../store';
import { clearNonLoggedToken, setLoggedInToken } from '../../store/tokenSlice';
import { requestNonLoggedToken, resetAuthServiceForTests } from '../authService';
import { encryptField } from '../encryptionNative';
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
  // JSON content type, entity header, no Bearer, no standard headers, no X-BHFL-Auth (FR-026, FR-034, BRD 8.1.1)
  it('sends JSON with X-BHFL-Entity and no Authorization, standard or X-BHFL-Auth headers', async () => {
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

  // the token is stored only for a non-empty string (FR-027, TV-1)
  it('stores a non-empty string token and rejects anything else', async () => {
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

  // Covers: HOME_STATE_TC_003 - every failure is swallowed (no throw reaches the UI) (FR-030, N-01)
  it('[HOME_STATE_TC_003] resolves quietly for network, 4xx and 5xx failures', async () => {
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

  // Covers: HOME_TOKEN_TC_004 - a logged-in token is not used as the non-logged token (FR-029, E-13)
  it('[HOME_TOKEN_TC_004] leaves the logged-in slot alone and fills only the non-logged slot', async () => {
    store.dispatch(setLoggedInToken('LOGGED-IN'));
    stub([], async () => ({ token: 'fresh' }));
    await requestNonLoggedToken();
    expect(store.getState().token.nonLoggedToken).toBe('fresh');
    expect(store.getState().token.loggedInToken).toBe('LOGGED-IN');
  });

  // Covers: HOME_TOKEN_TC_006 - no credential and no token is ever written to the console, on success or failure
  it('[HOME_TOKEN_TC_006] writes no credential or token to any console method', async () => {
    const spies = (['log', 'info', 'warn', 'error', 'debug'] as const).map(method =>
      jest.spyOn(console, method).mockImplementation(() => undefined),
    );
    (encryptField as jest.Mock).mockClear();
    stub([], async () => ({ token: 'jwt-secret-value' }));
    await requestNonLoggedToken();
    apiClient.defaults.adapter = async () => {
      throw new Error('Network Error');
    };
    await requestNonLoggedToken();
    const plainCredentials = (encryptField as jest.Mock).mock.calls.map(call => String(call[0]));
    expect(plainCredentials.length).toBeGreaterThan(0);
    const written = JSON.stringify(spies.flatMap(spy => spy.mock.calls));
    plainCredentials.forEach(secret => expect(written).not.toContain(secret));
    expect(written).not.toContain('jwt-secret-value');
    spies.forEach(spy => spy.mockRestore());
  });
});
