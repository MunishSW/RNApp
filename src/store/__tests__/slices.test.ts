import { createAppStore } from '../index';
import { clearFaq, setFaqItems } from '../faqSlice';
import {
  clearSelectedOffer,
  resetOffersForm,
  setOffersForm,
  setSelectedOffer,
} from '../offersSlice';
import {
  setFaqsFromNonLogin,
  setIsNonLoggedUser,
  setRegisterNowReturnScreen,
} from '../sessionFlagsSlice';
import { clearNonLoggedToken, setLoggedInToken, setNonLoggedToken } from '../tokenSlice';

describe('store slices', () => {
  // Covers: HOME_RESET_TC_001 — offers form reset
  it('[HOME_RESET_TC_001] resetOffersForm restores the empty form', () => {
    const s = createAppStore();
    s.dispatch(setOffersForm({ fullName: 'A B', mobileNo: '9999999999', tncAccepted: true }));
    s.dispatch(resetOffersForm());
    expect(s.getState().offers.form).toEqual({ fullName: '', mobileNo: '', tncAccepted: false });
  });

  // Covers: HOME_RESET_TC_002 — selected offer cleared
  it('[HOME_RESET_TC_002] clearSelectedOffer empties the selection', () => {
    const s = createAppStore();
    s.dispatch(setSelectedOffer({ id: 1 }));
    s.dispatch(clearSelectedOffer());
    expect(s.getState().offers.selectedOffer).toBeNull();
  });

  // Covers: HOME_RESET_TC_003 — register return flag null
  it('[HOME_RESET_TC_003] registerNowReturnScreen can be set back to null', () => {
    const s = createAppStore();
    s.dispatch(setRegisterNowReturnScreen('changePassword'));
    s.dispatch(setRegisterNowReturnScreen(null));
    expect(s.getState().sessionFlags.registerNowReturnScreen).toBeNull();
  });

  // Covers: HOME_RESET_TC_005 — FAQ cache is independent of the offers reset
  it('[HOME_RESET_TC_005] offers reset leaves FAQ cache and token alone', () => {
    const s = createAppStore();
    s.dispatch(setFaqItems([{ question: 'q', answer: 'a' }]));
    s.dispatch(setNonLoggedToken('tok'));
    s.dispatch(resetOffersForm());
    s.dispatch(clearSelectedOffer());
    expect(s.getState().faq.items).toHaveLength(1);
    expect(s.getState().token.nonLoggedToken).toBe('tok');
  });

  it('keeps logged-in and non-logged tokens separate', () => {
    const s = createAppStore();
    s.dispatch(setLoggedInToken('logged'));
    expect(s.getState().token.nonLoggedToken).toBeNull();
    s.dispatch(setNonLoggedToken('app'));
    s.dispatch(clearNonLoggedToken());
    expect(s.getState().token.loggedInToken).toBe('logged');
  });

  // Covers: HOME_ACTION_TC_004 — faqsFromNonLogin flag
  it('stores session flags and clears the FAQ cache on demand', () => {
    const s = createAppStore();
    s.dispatch(setFaqsFromNonLogin(true));
    s.dispatch(setIsNonLoggedUser(true));
    s.dispatch(setFaqItems([{ question: 'q', answer: 'a' }]));
    s.dispatch(clearFaq());
    expect(s.getState().sessionFlags).toMatchObject({ faqsFromNonLogin: true, isNonLoggedUser: true });
    expect(s.getState().faq.items).toBeNull();
  });
});
