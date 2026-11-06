import { act, renderHook } from '@testing-library/react-native';
import { NAV_LOCK_MS, NavigationLike, useGuardedNavigate } from '../useGuardedNavigate';
import { ROUTES } from '../routes';

function fakeNavigation() {
  const listeners: Record<string, Array<() => void>> = {};
  const nav: NavigationLike & { navigate: jest.Mock; unsubscribed: number } = {
    navigate: jest.fn(),
    unsubscribed: 0,
    addListener: (type, cb) => {
      (listeners[type] = listeners[type] || []).push(cb);
      return () => {
        nav.unsubscribed += 1;
      };
    },
  };
  return { nav, emit: (type: string) => (listeners[type] || []).forEach(cb => cb()) };
}

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('useGuardedNavigate', () => {
  // Covers: HOME_NET_TC_005 — rapid taps on different tiles open one destination
  it('[HOME_NET_TC_005] opens one destination for rapid taps on different tiles', () => {
    const { nav } = fakeNavigation();
    const { result } = renderHook(() => useGuardedNavigate(nav));
    act(() => {
      result.current(ROUTES.Products);
      result.current(ROUTES.Offers);
      result.current(ROUTES.LoginScreen);
    });
    expect(nav.navigate).toHaveBeenCalledTimes(1);
    expect(nav.navigate).toHaveBeenCalledWith('Products', undefined);
  });

  // Covers: HOME_NET_TC_006 — rapid taps on the same tile do not duplicate screens
  it('[HOME_NET_TC_006] ignores repeated taps on the same tile, then unlocks on focus', () => {
    const { nav, emit } = fakeNavigation();
    const { result } = renderHook(() => useGuardedNavigate(nav));
    act(() => {
      result.current(ROUTES.Offers);
      result.current(ROUTES.Offers);
    });
    expect(nav.navigate).toHaveBeenCalledTimes(1);
    act(() => emit('focus'));
    act(() => result.current(ROUTES.Offers));
    expect(nav.navigate).toHaveBeenCalledTimes(2);
  });

  it('unlocks after the safety timer and passes params through', () => {
    const { nav } = fakeNavigation();
    const { result } = renderHook(() => useGuardedNavigate(nav));
    act(() => result.current(ROUTES.PayNowWebView, { title: 'Pay Now' }));
    act(() => {
      jest.advanceTimersByTime(NAV_LOCK_MS);
    });
    act(() => result.current(ROUTES.Products));
    expect(nav.navigate).toHaveBeenNthCalledWith(1, 'PayNowWebView', { title: 'Pay Now' });
    expect(nav.navigate).toHaveBeenCalledTimes(2);
  });

  it('removes its focus listener and timer on unmount', () => {
    const { nav } = fakeNavigation();
    const { result, unmount } = renderHook(() => useGuardedNavigate(nav));
    act(() => result.current(ROUTES.Products));
    unmount();
    expect(nav.unsubscribed).toBe(1);
    expect(jest.getTimerCount()).toBe(0);
  });
});
