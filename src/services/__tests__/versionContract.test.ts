import type { InternalAxiosRequestConfig } from 'axios';
import { restorePlatformOS, setPlatformOS } from '../../testUtils/platform';
import { apiClient, setTokenProvider } from '../httpClient';
import { checkAppVersion, classifyVersionResponse, compareVersions } from '../versionService';

type Captured = InternalAxiosRequestConfig;

function stub(captured: Captured[], respond: () => unknown) {
  apiClient.defaults.adapter = async config => {
    captured.push(config);
    const data = respond();
    if (data instanceof Error) {
      throw data;
    }
    return { data, status: 200, statusText: 'OK', headers: {}, config };
  };
}

const ok = { returnStatus: { returnCode: '0000', returnMessage: 'success' } };

afterEach(() => {
  setTokenProvider(null);
  restorePlatformOS();
});

describe('version service contract (contracts/force-update.md)', () => {
  // Covers: FR-4.7-01, FR-4.4-08, TV-5 - endpoint, body, Bearer and standard headers, no X-BHFL-Auth
  it('[TC-413] posts { version, user_agent } to forceUpdate/Secured with Bearer and no X-BHFL-Auth', async () => {
    setPlatformOS('android');
    setTokenProvider(async () => 'tok');
    const captured: Captured[] = [];
    stub(captured, () => ok);
    await checkAppVersion();
    const h = captured[0].headers;
    expect(captured[0].url).toBe('forceUpdate/Secured');
    expect(JSON.parse(String(captured[0].data))).toEqual({ version: '1.8.9', user_agent: 'Android' });
    expect(h.get('Authorization')).toBe('Bearer tok');
    expect(h.get('app-version')).toBe('1.8.9');
    expect(h.get('platform')).toBe('android');
    expect(h.has('X-BHFL-Auth')).toBe(false);
  });

  // Covers: TV-5, E-09 - iOS sends exactly "iOS"
  it('[TC-413] sends user_agent exactly "iOS" on iOS', async () => {
    setPlatformOS('ios');
    const captured: Captured[] = [];
    stub(captured, () => ok);
    await checkAppVersion();
    expect(JSON.parse(String(captured[0].data)).user_agent).toBe('iOS');
  });

  // Covers: TV-3, E-08, TC-412 - numeric dotted compare, missing parts count as 0
  it('[TC-412] compares versions numerically with missing parts as 0', () => {
    expect(compareVersions('1.8.9', '1.8.10')).toBe(-1);
    expect(compareVersions('1.8.10', '1.8.9')).toBe(1);
    expect(compareVersions('1.8', '1.8.0')).toBe(0);
    expect(compareVersions('2', '1.9.9')).toBe(1);
  });

  // Covers: contracts/force-update.md classification order - 401 first, then message, then maintenance, then update
  it('classifies in the documented order', () => {
    const outdated = {
      version: '1.9.0',
      status: 'Active',
      target_url: 'https://store.example.test/app',
      force_update_flag: 'Y',
      optional_update: 'Y',
    };
    expect(
      classifyVersionResponse({ returnStatus: { returnCode: '401', returnMessage: 'x' }, ...outdated }, '1.8.9').kind,
    ).toBe('sessionExpired');
    expect(
      classifyVersionResponse({ returnStatus: { returnCode: '0000', returnMessage: 'failure' }, ...outdated }, '1.8.9').kind,
    ).toBe('error');
    expect(classifyVersionResponse({ ...ok, ...outdated, maintenance_flag: 'Y', maintenance_msg: 'down' }, '1.8.9').kind).toBe(
      'maintenance',
    );
    expect(classifyVersionResponse({ ...ok, ...outdated }, '1.8.9').kind).toBe('mandatory');
    expect(classifyVersionResponse({ ...ok, ...outdated, force_update_flag: 'N' }, '1.8.9').kind).toBe('optional');
    expect(classifyVersionResponse({ ...ok, ...outdated, force_update_flag: 'N', optional_update: 'N' }, '1.8.9').kind).toBe('none');
  });

  // Covers: TV-4, N-07 - only "Active" enforces
  it('[TC-408] enforces only when status is "Active"', () => {
    const body = { ...ok, version: '1.9.0', target_url: 'u', force_update_flag: 'Y' };
    expect(classifyVersionResponse({ ...body, status: 'Active' }, '1.8.9').kind).toBe('mandatory');
    expect(classifyVersionResponse({ ...body, status: 'Inactive' }, '1.8.9').kind).toBe('none');
    expect(classifyVersionResponse({ ...body, status: 'active' }, '1.8.9').kind).toBe('none');
  });

  // Covers: FR-4.7-09, N-09, TC-411 - a failed call or empty body fails open
  it('[TC-411] fails open on a thrown request and on null and empty bodies', async () => {
    stub([], () => new Error('Network Error'));
    await expect(checkAppVersion()).resolves.toEqual({ kind: 'none' });
    stub([], () => null);
    await expect(checkAppVersion()).resolves.toEqual({ kind: 'none' });
    stub([], () => ({}));
    await expect(checkAppVersion()).resolves.toEqual({ kind: 'none' });
  });
});
