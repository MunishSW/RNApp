import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RouteName, ROUTES } from '../../../navigation/routes';
import { track } from '../../../services/analytics';
import { fetchFaq } from '../../../services/faqService';
import type { AppDispatch, RootState } from '../../../store';
import { setFaqItems } from '../../../store/faqSlice';
import { setFaqsFromNonLogin } from '../../../store/sessionFlagsSlice';
import { FAQ_ERROR_DIALOG_NAME, NON_LOGGED_HOME_LOCATION, SERVER_ERROR_MESSAGE } from '../nonLoggedHomeConstants';

type Navigate = (name: RouteName, params?: object) => void;

/**
 * Cache-first FAQ flow (FR-013, FR-014): cached list opens at once; otherwise a blocking spinner,
 * one request (double taps ignored), empty or non-array stays on Home, failure shows the dialog.
 */
export function useFaqFlow(navigate: Navigate) {
  const dispatch = useDispatch<AppDispatch>();
  const cached = useSelector((state: RootState) => state.faq.items);
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
    dispatch(setFaqsFromNonLogin(true));
    if (inFlight.current) {
      return;
    }
    if (cached && cached.length > 0) {
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
        properties: { dialog_name: FAQ_ERROR_DIALOG_NAME, screen: NON_LOGGED_HOME_LOCATION, kind: 'error' },
      });
      AccessibilityInfo.announceForAccessibility(SERVER_ERROR_MESSAGE);
    } finally {
      inFlight.current = false;
      if (mounted.current) {
        setLoading(false);
      }
    }
  }, [cached, dispatch, navigate]);

  const onErrorOkay = useCallback(() => setErrorVisible(false), []);

  return { loading, errorVisible, onFaqPress, onErrorOkay };
}
