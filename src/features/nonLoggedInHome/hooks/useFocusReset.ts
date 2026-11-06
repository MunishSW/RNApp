import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../../store';
import { clearSelectedOffer, resetOffersForm } from '../../../store/offersSlice';
import { setRegisterNowReturnScreen } from '../../../store/sessionFlagsSlice';
import type { NavigationLike } from './useGuardedNavigate';

/**
 * Forgets leftover pre-login state every time Home gains focus (FR-4.9-01 to FR-4.9-04, BR-11):
 * the offers form, the selected offer and the register return screen. Home stays mounted under
 * pushed screens, so the reset hangs on the focus event. It never touches the FAQ cache or the
 * non-logged token and calls no service.
 */
export function useFocusReset(navigation: NavigationLike): void {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const reset = () => {
      dispatch(resetOffersForm());
      dispatch(clearSelectedOffer());
      dispatch(setRegisterNowReturnScreen(null));
    };
    reset();
    return navigation.addListener('focus', reset);
  }, [dispatch, navigation]);
}
