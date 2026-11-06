import { useCallback, useEffect, useState } from 'react';
import { BackHandler, Platform } from 'react-native';
import type { NavigationLike } from '../../../navigation/useGuardedNavigate';

interface ExitConfirmOptions {
  navigation: NavigationLike;
  popupOpen: boolean;
  closePopup: () => void;
  /** A non-dismissable dialog (maintenance, mandatory update) is open */
  blocked: boolean;
}

/**
 * Android hardware back on Home (FR-018): closes the Contact Us popup first, otherwise asks for
 * exit confirmation. Only intercepts while Home is focused; the listener is removed on blur/unmount.
 */
export function useExitConfirm({ navigation, popupOpen, closePopup, blocked }: ExitConfirmOptions) {
  const [exitVisible, setExitVisible] = useState(false);
  const [focused, setFocused] = useState(true);

  useEffect(() => {
    const offFocus = navigation.addListener('focus', () => setFocused(true));
    const offBlur = navigation.addListener('blur', () => setFocused(false));
    return () => {
      offFocus();
      offBlur();
    };
  }, [navigation]);

  useEffect(() => {
    if (Platform.OS !== 'android' || !focused) {
      return undefined;
    }
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (blocked) {
        return true;
      }
      if (popupOpen) {
        closePopup();
        return true;
      }
      if (exitVisible) {
        setExitVisible(false);
        return true;
      }
      setExitVisible(true);
      return true;
    });
    return () => subscription.remove();
  }, [focused, blocked, popupOpen, closePopup, exitVisible]);

  const onCancel = useCallback(() => setExitVisible(false), []);
  const onOkay = useCallback(() => {
    setExitVisible(false);
    BackHandler.exitApp();
  }, []);

  return { exitVisible, onCancel, onOkay };
}
