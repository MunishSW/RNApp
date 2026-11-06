import { act, renderHook } from '@testing-library/react-native';
import { ROUTES } from '../../../navigation/routes';
import { NAV_LOCK_MS, NavigationLike, useGuardedNavigate } from '../hooks/useGuardedNavigate';

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

describe('useGuardedNavigate (feature copy)', () => {
  // Covers: FR-4.2-10, E-14 - rapid taps on different tiles open one destination
  it('opens one destination for rapid taps on different tiles', () => {
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

  // Covers: FR-4.2-10 - the lock is released on focus
  it('unlocks when the screen regains focus', () => {
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

  // Covers: FR-4.2-10 - the safety timer releases the lock
  it('unlocks after the safety timer', () => {
    const { nav } = fakeNavigation();
    const { result } = renderHook(() => useGuardedNavigate(nav));
    act(() => result.current(ROUTES.Offers));
    act(() => {
      jest.advanceTimersByTime(NAV_LOCK_MS + 1);
    });
    act(() => result.current(ROUTES.Products));
    expect(nav.navigate).toHaveBeenCalledTimes(2);
  });

  // Covers: PERF-5 - cleanup on unmount
  it('removes its focus listener on unmount', () => {
    const { nav } = fakeNavigation();
    const { unmount } = renderHook(() => useGuardedNavigate(nav));
    unmount();
    expect(nav.unsubscribed).toBe(1);
  });
});
