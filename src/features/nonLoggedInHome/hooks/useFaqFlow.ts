import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useDispatch, useStore } from 'react-redux';
import { RouteName, ROUTES } from '../../../navigation/routes';
import { track } from '../../../services/analytics';
import { fetchFaq } from '../../../services/faqService';
import type { AppDispatch, RootState } from '../../../store';
import { setFaqItems } from '../../../store/faqSlice';
import { setFaqsFromNonLogin } from '../../../store/sessionFlagsSlice';
import { FAQ_ERROR_DIALOG_NAME, LOCATION, SERVER_ERROR_MESSAGE } from '../nonLoggedInHomeConstants';

type Navigate = (name: RouteName, params?: object) => void;

/**
 * Cache-first FAQ flow (FR-4.5-01 to FR-4.5-07, BR-6):
 * - a stored list opens the FAQ screen at once, no spinner, no request;
 * - otherwise a blocking spinner and ONE request (taps while loading are ignored);
 * - a non-empty list is stored and opens the FAQ screen;
 * - an empty or non-list answer stays on Home with no dialog;
 * - a failure shows the standard error dialog and records dialog_shown. The spinner always clears.
 */
export function useFaqFlow(navigate: Navigate) {
  const dispatch = useDispatch<AppDispatch>();
  const store = useStore<RootState>();
  const [loading, setLoading] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const inFlight = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const onFaqPress = useCallback(async () => {
    // Set on every tap so FAQ back returns to Home (FR-4.5-01).
    dispatch(setFaqsFromNonLogin(true));
    if (inFlight.current) {
      return;
    }
    if (store.getState().faq.items !== null) {
      navigate(ROUTES.Faq);
      return;
    }
    inFlight.current = true;
    setLoading(true);
    try {
      const items = await fetchFaq();
      if (items.length > 0) {
        dispatch(setFaqItems(items));
        navigate(ROUTES.Faq);
      }
    } catch {
      if (mounted.current) {
        setErrorVisible(true);
      }
      track({
        name: 'dialog_shown',
        properties: { dialog_name: FAQ_ERROR_DIALOG_NAME, screen: LOCATION, kind: 'error' },
      });
      AccessibilityInfo.announceForAccessibility(SERVER_ERROR_MESSAGE);
    } finally {
      inFlight.current = false;
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [dispatch, navigate, store]);

  const onErrorOkay = useCallback(() => setErrorVisible(false), []);

  return { loading, errorVisible, onFaqPress, onErrorOkay };
}
