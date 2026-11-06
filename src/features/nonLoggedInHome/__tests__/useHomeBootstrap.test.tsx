import { BackHandler, Linking } from 'react-native';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { requestNonLoggedToken } from '../../../services/authService';
import { logout } from '../../../services/sessionService';
import { checkAppVersion } from '../../../services/versionService';
import { useHomeBootstrap } from '../hooks/useHomeBootstrap';

jest.mock('../../../services/authService', () => ({ requestNonLoggedToken: jest.fn() }));
jest.mock('../../../services/versionService', () => ({ checkAppVersion: jest.fn() }));
jest.mock('../../../services/sessionService', () => ({ logout: jest.fn() }));

const check = checkAppVersion as jest.Mock;

beforeEach(() => {
  (requestNonLoggedToken as jest.Mock).mockReset().mockResolvedValue('token');
  (logout as jest.Mock).mockReset().mockResolvedValue(undefined);
  check.mockReset();
});

afterEach(() => jest.restoreAllMocks());

describe('useHomeBootstrap', () => {
  // one token request and one version check per mount (FR-025, FR-048, BR-9)
  it('requests the token and checks the version once per mount', async () => {
    check.mockResolvedValue({ kind: 'none' });
    const { rerender } = renderHook(() => useHomeBootstrap());
    rerender({});
    rerender({});
    await act(async () => undefined);
    expect(requestNonLoggedToken).toHaveBeenCalledTimes(1);
    expect(check).toHaveBeenCalledTimes(1);
  });

  // Home is not blocked while the check is pending (FR-049, BR-9)
  it('starts with no dialog while the version call is pending', () => {
    check.mockReturnValue(new Promise(() => undefined));
    const { result } = renderHook(() => useHomeBootstrap());
    expect(result.current.outcome).toEqual({ kind: 'none' });
    expect(result.current.blocking).toBe(false);
  });

  // Covers: HOME_VER_TC_002, HOME_VER_TC_003, HOME_VER_TC_005 - outcomes surface as dialogs (FR-052, FR-053, FR-054, N-06, N-07)
  it.each([
    [{ kind: 'maintenance', message: 'down' }, true],
    [{ kind: 'mandatory', targetUrl: 'u' }, true],
    [{ kind: 'optional', targetUrl: 'u' }, false],
    [{ kind: 'error', message: 'oops' }, false],
  ])('surfaces %j (blocking=%s)', async (outcome, blocking) => {
    check.mockResolvedValue(outcome);
    const { result } = renderHook(() => useHomeBootstrap());
    await waitFor(() => expect(result.current.outcome).toEqual(outcome));
    expect(result.current.blocking).toBe(blocking);
  });

  // 401 shows nothing and clears the logged-in token silently (FR-055, N-08)
  it('shows nothing for a session-expired answer and runs the silent logout', async () => {
    check.mockResolvedValue({ kind: 'sessionExpired', message: 'expired' });
    const { result } = renderHook(() => useHomeBootstrap());
    await waitFor(() => expect(logout).toHaveBeenCalledTimes(1));
    expect(result.current.outcome).toEqual({ kind: 'none' });
  });

  // Covers: HOME_VER_TC_009 - a rejected version call fails open (FR-056, N-09)
  it('[HOME_VER_TC_009] stays on none when the version call rejects', async () => {
    check.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useHomeBootstrap());
    await act(async () => undefined);
    expect(result.current.outcome).toEqual({ kind: 'none' });
  });

  // a rejected token request is swallowed (FR-030, N-01)
  it('swallows a rejected token request', async () => {
    (requestNonLoggedToken as jest.Mock).mockRejectedValue(new Error('timeout'));
    check.mockResolvedValue({ kind: 'none' });
    const { result } = renderHook(() => useHomeBootstrap());
    await act(async () => undefined);
    expect(result.current.outcome).toEqual({ kind: 'none' });
  });

  // Covers: HOME_VER_TC_004, HOME_VER_TC_005 - Update opens the store link, Exit closes the app, Skip dismisses (FR-053, FR-054)
  it('opens the store link, exits the app and dismisses the optional dialog', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    const exit = jest.spyOn(BackHandler, 'exitApp').mockImplementation(() => undefined);
    check.mockResolvedValue({ kind: 'optional', targetUrl: 'https://store.example.test/a' });
    const { result } = renderHook(() => useHomeBootstrap());
    await waitFor(() => expect(result.current.outcome.kind).toBe('optional'));
    act(() => result.current.onUpdate('https://store.example.test/a'));
    expect(open).toHaveBeenCalledWith('https://store.example.test/a');
    act(() => result.current.onExit());
    expect(exit).toHaveBeenCalledTimes(1);
    act(() => result.current.onSkip());
    expect(result.current.outcome).toEqual({ kind: 'none' });
  });
});
