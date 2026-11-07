import { useCallback, useEffect, useRef } from 'react';
import { BackHandler, NativeEventSubscription } from 'react-native';
import { ROUTES } from '../../../navigation/routes';
import { NavigationLike, useGuardedNavigate } from '../../../navigation/useGuardedNavigate';

/**
 * Back to the pre-login Home page with an explicit target (FR-4.6-01, BR-1). Rapid presses go back once
 * (FR-4.6-02). The Android hardware back uses the same path and is subscribed only while the screen has focus.
 */
export function useFaqBack(navigation: NavigationLike) {
  const guarded = useGuardedNavigate(navigation);
  const onBack = useCallback(() => guarded(ROUTES.NonLoggedInHome), [guarded]);
  const subscription = useRef<NativeEventSubscription | null>(null);

  useEffect(() => {
    const subscribe = () => {
      if (subscription.current) {
        return;
      }
      subscription.current = BackHandler.addEventListener('hardwareBackPress', () => {
        onBack();
        return true;
      });
    };
    const unsubscribe = () => {
      subscription.current?.remove();
      subscription.current = null;
    };
    subscribe();
    const offFocus = navigation.addListener('focus', subscribe);
    const offBlur = navigation.addListener('blur', unsubscribe);
    return () => {
      offFocus();
      offBlur();
      unsubscribe();
    };
  }, [navigation, onBack]);

  return { onBack };
}
