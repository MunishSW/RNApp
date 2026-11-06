import { useCallback, useEffect, useRef } from 'react';
import type { RouteName } from '../../../navigation/routes';

/** The part of a React Navigation `navigation` object the Home hooks need. */
export interface NavigationLike {
  navigate(name: string, params?: object): void;
  addListener(type: 'focus' | 'blur', listener: () => void): () => void;
}

export const NAV_LOCK_MS = 800;

/**
 * Navigates at most once per burst of taps (no duplicate stack entries, FR-4.2-10).
 * The lock is released when the screen regains focus, with a timer as safety net.
 */
export function useGuardedNavigate(navigation: NavigationLike) {
  const locked = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      locked.current = false;
    });
    return () => {
      unsubscribe();
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [navigation]);

  return useCallback(
    (name: RouteName, params?: object) => {
      if (locked.current) {
        return;
      }
      locked.current = true;
      if (timer.current) {
        clearTimeout(timer.current);
      }
      timer.current = setTimeout(() => {
        locked.current = false;
      }, NAV_LOCK_MS);
      navigation.navigate(name, params);
    },
    [navigation],
  );
}
