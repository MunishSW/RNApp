import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { ROUTES } from '../../../navigation/routes';
import { track } from '../../../services/analytics';
import type { AppDispatch } from '../../../store';
import { setIsNonLoggedUser } from '../../../store/sessionFlagsSlice';
import {
  LOCATION,
  LOGIN_CTA_NAME,
  PAY_NOW_TITLE,
  TileConfig,
} from '../nonLoggedInHomeConstants';
import { useFaqFlow } from './useFaqFlow';
import { NavigationLike, useGuardedNavigate } from './useGuardedNavigate';

export interface HomeActionHandlers {
  /** Opens the Customer Care popup over Home (FR-4.6-xx) */
  onContactPress?: () => void;
}

/**
 * Tile and Login behaviour. The analytics event fires first, then the guarded navigation, so a
 * failed navigation is still counted (FR-4.2-09). FAQs runs the cache-first flow (FR-4.5-xx).
 */
export function useHomeActions(navigation: NavigationLike, handlers: HomeActionHandlers = {}) {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useGuardedNavigate(navigation);
  const faq = useFaqFlow(navigate);
  const { onContactPress } = handlers;
  const { onFaqPress } = faq;

  const onTilePress = useCallback(
    (tile: TileConfig) => {
      track({
        name: 'quick_link_clicked',
        properties: { link_name: tile.linkName, location: LOCATION, logged_in: false },
      });
      switch (tile.id) {
        case 'payNow':
          navigate(ROUTES.NonLoggedInPayNow, { title: PAY_NOW_TITLE });
          break;
        case 'ourProducts':
          navigate(ROUTES.Products);
          break;
        case 'trackApplication':
          navigate(ROUTES.TrackApplication);
          break;
        case 'faqs':
          onFaqPress();
          break;
        case 'offers':
          navigate(ROUTES.Offers);
          break;
        case 'contactUs':
          dispatch(setIsNonLoggedUser(true));
          track({ name: 'contact_us_clicked', properties: { channel: LOCATION } });
          onContactPress?.();
          break;
      }
    },
    [dispatch, navigate, onContactPress, onFaqPress],
  );

  const onLoginPress = useCallback(() => {
    track({ name: 'cta_clicked', properties: { cta_name: LOGIN_CTA_NAME, screen: LOCATION } });
    navigate(ROUTES.LoginScreen);
  }, [navigate]);

  return { navigate, faq, onTilePress, onLoginPress };
}
