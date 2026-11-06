import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import type { NavigationLike } from '../../../navigation/useGuardedNavigate';
import type { AppDispatch } from '../../../store';
import { clearSelectedOffer, resetOffersForm } from '../../../store/offersSlice';
import { setRegisterNowReturnScreen } from '../../../store/sessionFlagsSlice';

/**
 * Every time Home gains focus, reset leftover pre-login state (FR-019): offers form, selected offer
 * and the register return flag. The FAQ cache and the non-logged token are deliberately untouched.
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
