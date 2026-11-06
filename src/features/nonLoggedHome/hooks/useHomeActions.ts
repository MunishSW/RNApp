import { useCallback, useRef, useState } from 'react';
import { Linking } from 'react-native';
import { useDispatch } from 'react-redux';
import { ENV } from '../../../config/env';
import { ROUTES } from '../../../navigation/routes';
import { NavigationLike, useGuardedNavigate } from '../../../navigation/useGuardedNavigate';
import { track } from '../../../services/analytics';
import type { AppDispatch } from '../../../store';
import { setIsNonLoggedUser } from '../../../store/sessionFlagsSlice';
import type { ContactRow } from '../components/CustomerCarePopup';
import {
  NON_LOGGED_HOME_LOCATION,
  PAY_NOW_PATH,
  PAY_NOW_TITLE,
  QuickLinkConfig,
} from '../nonLoggedHomeConstants';
import { useFaqFlow } from './useFaqFlow';

/** Pay Now params: URL from build config; a missing portal URL is passed as null, never thrown on. */
export function buildPayNowParams() {
  return {
    title: PAY_NOW_TITLE,
    url: ENV.portalBaseUrl ? `${ENV.portalBaseUrl}${PAY_NOW_PATH}` : null,
    loader: false,
  };
}

/** Tile, Login and Contact Us behaviour for Home. Analytics fire before navigation (FR-007). */
export function useHomeActions(navigation: NavigationLike) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useGuardedNavigate(navigation);
  const faq = useFaqFlow(navigate);
  const [popupOpen, setPopupOpen] = useState(false);
  const popupOpenRef = useRef(false);

  const openPopup = useCallback(() => {
    if (popupOpenRef.current) {
      return;
    }
    popupOpenRef.current = true;
    dispatch(setIsNonLoggedUser(true));
    track({ name: 'contact_us_clicked', properties: { channel: NON_LOGGED_HOME_LOCATION } });
    setPopupOpen(true);
  }, [dispatch]);

  const closePopup = useCallback(() => {
    popupOpenRef.current = false;
    setPopupOpen(false);
  }, []);

  const onTilePress = useCallback(
    (config: QuickLinkConfig) => {
      track({
        name: 'quick_link_clicked',
        properties: { link_name: config.linkName, location: NON_LOGGED_HOME_LOCATION, logged_in: false },
      });
      switch (config.id) {
        case 'payNow':
          navigate(ROUTES.PayNowWebView, buildPayNowParams());
          break;
        case 'ourProducts':
          navigate(ROUTES.Products);
          break;
        case 'trackApplication':
          navigate(ROUTES.TrackApplication);
          break;
        case 'faqs':
          faq.onFaqPress();
          break;
        case 'offers':
          navigate(ROUTES.Offers);
          break;
        case 'contactUs':
          openPopup();
          break;
      }
    },
    [faq, navigate, openPopup],
  );

  const onLoginPress = useCallback(() => {
    track({ name: 'cta_clicked', properties: { cta_name: 'login', screen: NON_LOGGED_HOME_LOCATION } });
    navigate(ROUTES.LoginScreen);
  }, [navigate]);

  const onContactRowPress = useCallback(
    (row: ContactRow) => {
      if (row.url) {
        Linking.openURL(row.url).catch(() => undefined);
        return;
      }
      closePopup();
      navigate(ROUTES.BranchLocator);
    },
    [closePopup, navigate],
  );

  return {
    faq,
    popupOpen,
    closePopup,
    onTilePress,
    onLoginPress,
    onContactRowPress,
  };
}
