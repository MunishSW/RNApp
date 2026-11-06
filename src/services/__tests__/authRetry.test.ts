import { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { isAuthFailure, setAuthRefresher } from '../authRetry';
import { apiClient, post, setTokenProvider } from '../httpClient';

type Captured = InternalAxiosRequestConfig;
type Step = { status: number; data?: unknown; reject?: boolean };

/** Plays the given steps in order, one per request; the last step repeats. */
const sentAuth: unknown[] = [];

function playSteps(captured: Captured[], steps: Step[]) {
  sentAuth.length = 0;
  apiClient.defaults.adapter = async config => {
    captured.push(config);
    sentAuth.push(config.headers.get('Authorization'));
    const step = steps[Math.min(captured.length - 1, steps.length - 1)];
    const response = {
      data: step.data ?? {},
      status: step.status,
      statusText: '',
      headers: {},
      config,
    };
    if (step.reject) {
      throw new AxiosError('failed', 'ERR_BAD_REQUEST', config, null, response);
    }
    return response;
  };
}

const refreshToken = jest.fn();
let loggedIn = false;

beforeEach(() => {
  refreshToken.mockReset();
  refreshToken.mockResolvedValue('new-token');
  loggedIn = false;
  setAuthRefresher({ refreshToken, hasLoggedInSession: () => loggedIn });
  setTokenProvider(async () => 'old-token');
});

afterEach(() => {
  setAuthRefresher(null);
  setTokenProvider(null);
});

describe('isAuthFailure', () => {
  // the three auth-failure signals (BRD 8.4.3, FR-032)
  it('detects HTTP 401, HTTP 400 with an auth code, and HTTP 200 with returnCode 401', () => {
    expect(isAuthFailure(401, undefined)).toBe(true);
    expect(isAuthFailure(400, { statusCode: '401' })).toBe(true);
    expect(isAuthFailure(400, { statusCode: 'API_3000' })).toBe(true);
    expect(isAuthFailure(400, { returnStatus: { returnCode: '401' } })).toBe(true);
    expect(isAuthFailure(400, { returnStatus: { returnCode: 'API_3000' } })).toBe(true);
    expect(isAuthFailure(200, { returnStatus: { returnCode: '401' } })).toBe(true);
  });

  it('ignores everything else', () => {
    expect(isAuthFailure(200, { returnStatus: { returnCode: '0000' } })).toBe(false);
    expect(isAuthFailure(200, [])).toBe(false);
    expect(isAuthFailure(400, { message: 'bad request' })).toBe(false);
    expect(isAuthFailure(500, undefined)).toBe(false);
    expect(isAuthFailure(undefined, null)).toBe(false);
  });
});

describe('one retry after a token refresh', () => {
  // HTTP 401 refreshes once and replays with the new Bearer (FR-032, BR-3, P-08)
  it('replays once with the new Bearer after an HTTP 401', async () => {
    const captured: Captured[] = [];
    playSteps(captured, [{ status: 401, reject: true }, { status: 200, data: [{ question: 'q' }] }]);
    const result = await post<unknown>('FormBasedQuery/Services/v1/fetch-faq', {});
    expect(result).toEqual([{ question: 'q' }]);
    expect(captured).toHaveLength(2);
    expect(refreshToken).toHaveBeenCalledTimes(1);
    expect(sentAuth).toEqual(['Bearer old-token', 'Bearer new-token']);
  });

  // HTTP 400 with an auth code (FR-032)
  it('replays once after an HTTP 400 with an auth code in the body', async () => {
    const captured: Captured[] = [];
    playSteps(captured, [
      { status: 400, reject: true, data: { statusCode: 'API_3000' } },
      { status: 200, data: { ok: true } },
    ]);
    await expect(post('x', {})).resolves.toEqual({ ok: true });
    expect(captured).toHaveLength(2);
    expect(refreshToken).toHaveBeenCalledTimes(1);
  });

  // HTTP 200 with returnCode 401 in the body (FR-032)
  it('replays once after an HTTP 200 whose body carries returnCode 401', async () => {
    const captured: Captured[] = [];
    playSteps(captured, [
      { status: 200, data: { returnStatus: { returnCode: '401' } } },
      { status: 200, data: { returnStatus: { returnCode: '0000' } } },
    ]);
    await expect(post('forceUpdate/Secured', {})).resolves.toEqual({
      returnStatus: { returnCode: '0000' },
    });
    expect(captured).toHaveLength(2);
  });

  // a failing replay passes the original error on; no third call (FR-032)
  it('does not retry twice and passes the original error on when the replay fails', async () => {
    const captured: Captured[] = [];
    playSteps(captured, [{ status: 401, reject: true }]);
    await expect(post('x', {})).rejects.toMatchObject({ response: { status: 401 } });
    expect(captured).toHaveLength(2);
    expect(refreshToken).toHaveBeenCalledTimes(1);
  });

  // a 200 body that stays 401 after the replay passes the original body on (FR-032)
  it('passes the original body on when a 200 returnCode 401 stays 401 after the replay', async () => {
    const captured: Captured[] = [];
    const body = { returnStatus: { returnCode: '401', returnMessage: 'expired' } };
    playSteps(captured, [{ status: 200, data: body }]);
    await expect(post('forceUpdate/Secured', {})).resolves.toEqual(body);
    expect(captured).toHaveLength(2);
  });

  // a logged-in session never retries (FR-029, BR-3, E-13)
  it('does not retry when a logged-in session exists', async () => {
    loggedIn = true;
    const captured: Captured[] = [];
    playSteps(captured, [{ status: 401, reject: true }]);
    await expect(post('x', {})).rejects.toMatchObject({ response: { status: 401 } });
    expect(captured).toHaveLength(1);
    expect(refreshToken).not.toHaveBeenCalled();
  });

  // the token call itself (skipAuth) never retries (FR-030)
  it('does not retry a skipAuth call', async () => {
    const captured: Captured[] = [];
    playSteps(captured, [{ status: 401, reject: true }]);
    await expect(post('v1/generatetoken', {}, { skipAuth: true })).rejects.toBeDefined();
    expect(captured).toHaveLength(1);
    expect(refreshToken).not.toHaveBeenCalled();
  });

  // no new token means the original error passes on and no replay is sent (FR-032)
  it('passes the original error on when the refresh gives no token', async () => {
    refreshToken.mockResolvedValue(undefined);
    const captured: Captured[] = [];
    playSteps(captured, [{ status: 401, reject: true }]);
    await expect(post('x', {})).rejects.toMatchObject({ response: { status: 401 } });
    expect(captured).toHaveLength(1);
  });

  // only auth failures are replayed (FR-032)
  it('does not replay a 500 or a network failure', async () => {
    const captured: Captured[] = [];
    playSteps(captured, [{ status: 500, reject: true }]);
    await expect(post('x', {})).rejects.toMatchObject({ response: { status: 500 } });
    expect(captured).toHaveLength(1);
    expect(refreshToken).not.toHaveBeenCalled();
  });

  // standard headers on the replay, no X-BHFL-Auth anywhere (FR-028, FR-034)
  it('keeps the standard headers on the replay and never sends X-BHFL-Auth', async () => {
    const captured: Captured[] = [];
    playSteps(captured, [{ status: 401, reject: true }, { status: 200 }]);
    await post('FormBasedQuery/Services/v1/fetch-faq', {});
    captured.forEach(config => {
      expect(config.headers.get('app-version')).toBe('1.8.9');
      expect(config.headers.get('platform')).toBeDefined();
      expect(config.headers.get('device-details')).toBeDefined();
      expect(config.headers.has('X-BHFL-Auth')).toBe(false);
    });
  });
});
