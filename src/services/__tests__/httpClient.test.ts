import { restorePlatformOS, setPlatformOS } from '../../testUtils/platform';
import type { InternalAxiosRequestConfig } from 'axios';
import { apiClient, post, setTokenProvider } from '../httpClient';

type Captured = InternalAxiosRequestConfig;

function stubAdapter(
  captured: Captured[],
  data: unknown = {},
  wait?: Promise<void>,
) {
  apiClient.defaults.adapter = async config => {
    if (wait) {
      await wait;
    }
    captured.push(config);
    return { data, status: 200, statusText: 'OK', headers: {}, config };
  };
}

beforeEach(() => {
  setPlatformOS('android');
});

afterEach(() => {
  setTokenProvider(null);
  restorePlatformOS();
});

describe('httpClient', () => {
  // Covers: HOME_TOKEN_TC_001 - Bearer plus app-version, platform and device-details headers
  it('[HOME_TOKEN_TC_001] adds Bearer token and standard headers', async () => {
    const captured: Captured[] = [];
    stubAdapter(captured);
    setTokenProvider(async () => 'abc.def');
    await post('FormBasedQuery/Services/v1/fetch-faq', {});
    const h = captured[0].headers;
    expect(h.get('Authorization')).toBe('Bearer abc.def');
    expect(h.get('app-version')).toBe('1.8.9');
    expect(h.get('platform')).toBe('android');
    expect(JSON.parse(String(h.get('device-details')))).toMatchObject({
      brand: 'TestBrand',
      model: 'TestModel',
    });
  });

  // Covers: HOME_TOKEN_TC_003 - request waits for the in-flight token
  it('[HOME_TOKEN_TC_003] waits for the token provider before sending', async () => {
    const captured: Captured[] = [];
    stubAdapter(captured);
    let release: (t: string) => void = () => undefined;
    setTokenProvider(
      () => new Promise<string>(resolve => { release = resolve; }),
    );
    const pending = post('x', {});
    await Promise.resolve();
    expect(captured).toHaveLength(0);
    release('late-token');
    await pending;
    expect(captured[0].headers.get('Authorization')).toBe('Bearer late-token');
  });

  it('keeps an explicit Authorization header untouched', async () => {
    const captured: Captured[] = [];
    stubAdapter(captured);
    setTokenProvider(async () => 'other');
    await post('x', {}, { headers: { Authorization: 'Bearer fixed' } });
    expect(captured[0].headers.get('Authorization')).toBe('Bearer fixed');
  });

  it('skips auth and standard headers for the token call', async () => {
    const captured: Captured[] = [];
    stubAdapter(captured);
    setTokenProvider(async () => 'should-not-be-used');
    await post('v1/generatetoken', {}, { skipAuth: true });
    expect(captured[0].headers.has('Authorization')).toBe(false);
    expect(captured[0].headers.has('app-version')).toBe(false);
  });

  it('sends without Authorization when no token exists', async () => {
    const captured: Captured[] = [];
    stubAdapter(captured);
    setTokenProvider(async () => undefined);
    await post('x', {});
    expect(captured[0].headers.has('Authorization')).toBe(false);
  });

  it('applies the configured timeout and returns response data typed', async () => {
    const captured: Captured[] = [];
    stubAdapter(captured, { ok: true });
    const result = await post<{ ok: boolean }>('x', {});
    expect(result.ok).toBe(true);
    expect(captured[0].timeout).toBe(30000);
  });
});
