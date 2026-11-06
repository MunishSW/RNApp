import { useCallback, useEffect, useState } from 'react';
import { BackHandler, Platform } from 'react-native';
import type { NavigationLike } from './useGuardedNavigate';

interface ExitConfirmOptions {
  navigation: NavigationLike;
  popupOpen: boolean;
  closePopup: () => void;
  /** A dismissable dialog is open (FAQ error, optional update, version error) */
  dialogOpen: boolean;
  closeDialog: () => void;
  /** A message that cannot be dismissed is open (maintenance, mandatory update) or a blocking spinner is showing */
  blocked: boolean;
}

/**
 * Android hardware back on Home (FR-4.8-01 to FR-4.8-04, BR-10). Order: a blocking message swallows
 * back; an open popup closes first; an open dialog closes next; otherwise the exit dialog shows.
 * Registered only while Home is focused and removed on blur and unmount. iOS registers nothing.
 */
export function useExitConfirm({
  navigation,
  popupOpen,
  closePopup,
  dialogOpen,
  closeDialog,
  blocked,
}: ExitConfirmOptions) {
  const [exitVisible, setExitVisible] = useState(false);
  const [focused, setFocused] = useState(true);

  useEffect(() => {
    const offFocus = navigation.addListener('focus', () => setFocused(true));
    const offBlur = navigation.addListener('blur', () => {
      setFocused(false);
      setExitVisible(false);
    });
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
      if (dialogOpen) {
        closeDialog();
        return true;
      }
      setExitVisible(visible => !visible);
      return true;
    });
    return () => subscription.remove();
  }, [focused, blocked, popupOpen, closePopup, dialogOpen, closeDialog]);

  const onCancel = useCallback(() => setExitVisible(false), []);
  const onOkay = useCallback(() => {
    setExitVisible(false);
    BackHandler.exitApp();
  }, []);

  return { exitVisible, onCancel, onOkay };
}
