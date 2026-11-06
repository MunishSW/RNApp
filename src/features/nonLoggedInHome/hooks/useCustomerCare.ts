import { ComponentRef, useCallback, useRef, useState } from 'react';
import { AccessibilityInfo, findNodeHandle, Linking, Pressable } from 'react-native';
import { ROUTES } from '../../../navigation/routes';
import type { ContactRowId } from '../components/CustomerCarePopup';
import { CONTACT_POPUP } from '../nonLoggedInHomeConstants';
import type { NavigationLike } from './useGuardedNavigate';

const rowSubtitle = (id: ContactRowId) => CONTACT_POPUP.rows.find(row => row.id === id)?.subtitle ?? '';

/**
 * Customer Care popup state and hand-offs (FR-4.6-01 to FR-4.6-04, BR-7). The popup is not a route.
 * Each row closes the popup and then hands off: dialer, mail app, or the Branch locator.
 * On close, accessibility focus returns to the "Contact Us" tile.
 */
export function useCustomerCare(navigation: NavigationLike) {
  const [visible, setVisible] = useState(false);
  const openRef = useRef(false);
  const contactTileRef = useRef<ComponentRef<typeof Pressable>>(null);

  const open = useCallback(() => {
    if (openRef.current) {
      return;
    }
    openRef.current = true;
    setVisible(true);
  }, []);

  const close = useCallback(() => {
    openRef.current = false;
    setVisible(false);
    const node = findNodeHandle(contactTileRef.current);
    if (node) {
      AccessibilityInfo.setAccessibilityFocus(node);
    }
  }, []);

  const onRowPress = useCallback(
    (rowId: ContactRowId) => {
      close();
      switch (rowId) {
        case 'call':
          Linking.openURL(`tel:${rowSubtitle('call').replace(/-/g, '')}`).catch(() => undefined);
          break;
        case 'email':
          Linking.openURL(`mailto:${rowSubtitle('email')}`).catch(() => undefined);
          break;
        case 'find':
          navigation.navigate(ROUTES.BranchLocator);
          break;
      }
    },
    [close, navigation],
  );

  return { visible, open, close, onRowPress, contactTileRef };
}
