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
  // Covers: HOME_VER_TC_010 - endpoint, body, Bearer and standard headers, no X-BHFL-Auth (FR-048, FR-034, TV-5)
  it('[HOME_VER_TC_010] posts { version, user_agent } to forceUpdate/Secured with Bearer and no X-BHFL-Auth', async () => {
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

  // Covers: HOME_VER_TC_010 - iOS sends exactly "iOS" (TV-5, E-09)
  it('[HOME_VER_TC_010] sends user_agent exactly "iOS" on iOS', async () => {
    setPlatformOS('ios');
    const captured: Captured[] = [];
    stub(captured, () => ok);
    await checkAppVersion();
    expect(JSON.parse(String(captured[0].data)).user_agent).toBe('iOS');
  });

  // Covers: HOME_VER_TC_007 - numeric dotted compare, missing parts count as 0 (TV-3, E-08)
  it('[HOME_VER_TC_007] compares versions numerically with missing parts as 0', () => {
    expect(compareVersions('1.8.9', '1.8.10')).toBe(-1);
    expect(compareVersions('1.8.10', '1.8.9')).toBe(1);
    expect(compareVersions('1.8', '1.8.0')).toBe(0);
    expect(compareVersions('2', '1.9.9')).toBe(1);
  });

  // 401 first, then message, then maintenance, then update (contracts/force-update.md classification order)
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

  // Covers: HOME_VER_TC_006 - only "Active" enforces (TV-4, N-07)
  it('[HOME_VER_TC_006] enforces only when status is "Active"', () => {
    const body = { ...ok, version: '1.9.0', target_url: 'u', force_update_flag: 'Y' };
    expect(classifyVersionResponse({ ...body, status: 'Active' }, '1.8.9').kind).toBe('mandatory');
    expect(classifyVersionResponse({ ...body, status: 'Inactive' }, '1.8.9').kind).toBe('none');
    expect(classifyVersionResponse({ ...body, status: 'active' }, '1.8.9').kind).toBe('none');
  });

  // Covers: HOME_VER_TC_009 - a failed call or empty body fails open (FR-056, N-09)
  it('[HOME_VER_TC_009] fails open on a thrown request and on null and empty bodies', async () => {
    stub([], () => new Error('Network Error'));
    await expect(checkAppVersion()).resolves.toEqual({ kind: 'none' });
    stub([], () => null);
    await expect(checkAppVersion()).resolves.toEqual({ kind: 'none' });
    stub([], () => ({}));
    await expect(checkAppVersion()).resolves.toEqual({ kind: 'none' });
  });
});
