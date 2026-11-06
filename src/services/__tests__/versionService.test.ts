import type { InternalAxiosRequestConfig } from 'axios';
import { restorePlatformOS, setPlatformOS } from '../../testUtils/platform';
import { apiClient } from '../httpClient';
import { checkAppVersion, classifyVersionResponse, compareVersions } from '../versionService';

type Captured = InternalAxiosRequestConfig;

const ok = { returnCode: '0', returnMessage: 'success' };

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

afterEach(() => restorePlatformOS());

describe('classifyVersionResponse', () => {
  // Covers: HOME_VER_TC_001 - up to date, no dialog
  it('[HOME_VER_TC_001] returns none when the installed version equals the published one', () => {
    expect(
      classifyVersionResponse(
        { returnStatus: ok, version: '1.8.9', status: 'Active', force_update_flag: 'Y' },
        '1.8.9',
      ),
    ).toEqual({ kind: 'none' });
  });

  // Covers: HOME_VER_TC_002 - maintenance
  it('[HOME_VER_TC_002] returns maintenance with the server message', () => {
    expect(
      classifyVersionResponse(
        { returnStatus: ok, maintenance_flag: 'Y', maintenance_msg: 'Back at 6 PM' },
        '1.8.9',
      ),
    ).toEqual({ kind: 'maintenance', message: 'Back at 6 PM' });
  });

  // Covers: HOME_VER_TC_003 - mandatory update
  it('[HOME_VER_TC_003] returns mandatory for an older version, force Y, Active', () => {
    expect(
      classifyVersionResponse(
        {
          returnStatus: ok,
          version: '2.0.0',
          status: 'Active',
          force_update_flag: 'Y',
          target_url: 'https://store.example/app',
        },
        '1.8.9',
      ),
    ).toEqual({ kind: 'mandatory', targetUrl: 'https://store.example/app' });
  });

  // Covers: HOME_VER_TC_005 - optional update
  it('[HOME_VER_TC_005] returns optional for an older version, optional Y, Active', () => {
    expect(
      classifyVersionResponse(
        {
          returnStatus: ok,
          version: '2.0.0',
          status: 'Active',
          force_update_flag: 'N',
          optional_update: 'Y',
          target_url: 'https://store.example/app',
        },
        '1.8.9',
      ),
    ).toEqual({ kind: 'optional', targetUrl: 'https://store.example/app' });
  });

  // Covers: HOME_VER_TC_006 - not Active, not enforced
  it('[HOME_VER_TC_006] does not enforce an update when status is not Active', () => {
    expect(
      classifyVersionResponse(
        {
          returnStatus: ok,
          version: '2.0.0',
          status: 'Inactive',
          force_update_flag: 'Y',
          target_url: 'https://store.example/app',
        },
        '1.8.9',
      ),
    ).toEqual({ kind: 'none' });
  });

  // Covers: HOME_VER_TC_007 - 1.8.10 is newer than 1.8.9
  it('[HOME_VER_TC_007] treats 1.8.10 as newer than 1.8.9', () => {
    expect(compareVersions('1.8.9', '1.8.10')).toBe(-1);
    expect(compareVersions('1.8.10', '1.8.9')).toBe(1);
    expect(compareVersions('1.8', '1.8.0')).toBe(0);
    expect(
      classifyVersionResponse(
        {
          returnStatus: ok,
          version: '1.8.10',
          status: 'Active',
          force_update_flag: 'Y',
          target_url: 'https://store.example/app',
        },
        '1.8.9',
      ),
    ).toMatchObject({ kind: 'mandatory' });
  });

  // 401 session expired with server message
  it('returns sessionExpired with the server message for returnCode 401', () => {
    expect(
      classifyVersionResponse(
        { returnStatus: { returnCode: '401', returnMessage: 'Session expired' } },
        '1.8.9',
      ),
    ).toEqual({ kind: 'sessionExpired', message: 'Session expired' });
  });

  it('returns error with returnMessage, or the generic text when it is missing', () => {
    expect(
      classifyVersionResponse(
        { returnStatus: { returnCode: '500', returnMessage: 'Boom' } },
        '1.8.9',
      ),
    ).toEqual({ kind: 'error', message: 'Boom' });
    const generic = classifyVersionResponse({ returnStatus: { returnCode: '500' } }, '1.8.9');
    expect(generic.kind).toBe('error');
  });

  // Covers: HOME_VER_TC_009 - null, empty or malformed bodies fail open
  it('[HOME_VER_TC_009] fails open on null, empty and malformed bodies', () => {
    [null, undefined, '', {}, 'x', 42, []].forEach(body => {
      expect(classifyVersionResponse(body, '1.8.9')).toEqual({ kind: 'none' });
    });
  });
});

describe('checkAppVersion', () => {
  // Covers: HOME_VER_TC_010 - capitalised platform value and installed version
  it('[HOME_VER_TC_010] posts the installed version with user_agent Android', async () => {
    setPlatformOS('android');
    const captured: Captured[] = [];
    stub(captured, () => ({ returnStatus: ok }));
    await checkAppVersion();
    expect(captured[0].url).toBe('forceUpdate/Secured');
    expect(captured[0].baseURL).toBe('https://api.example.test/Services/');
    expect(JSON.parse(String(captured[0].data))).toEqual({
      version: '1.8.9',
      user_agent: 'Android',
    });
  });

  // Covers: HOME_VER_TC_010 - user_agent is exactly iOS on iOS, never lowercase
  it('[HOME_VER_TC_010] posts user_agent iOS on iOS (never lowercase)', async () => {
    setPlatformOS('ios');
    const captured: Captured[] = [];
    stub(captured, () => ({ returnStatus: ok }));
    await checkAppVersion();
    expect(JSON.parse(String(captured[0].data)).user_agent).toBe('iOS');
  });

  // Covers: HOME_VER_TC_009 - a failed call fails open
  it('[HOME_VER_TC_009] resolves to none when the request fails', async () => {
    stub([], () => new Error('Network Error'));
    await expect(checkAppVersion()).resolves.toEqual({ kind: 'none' });
  });
});
