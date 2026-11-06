import { store } from '..';
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

beforeEach(() => {
  store.dispatch(clearFaq());
  store.dispatch(clearNonLoggedToken());
  store.dispatch(setLoggedInToken(null));
  store.dispatch(resetOffersForm());
  store.dispatch(clearSelectedOffer());
  store.dispatch(setRegisterNowReturnScreen(null));
  store.dispatch(setFaqsFromNonLogin(false));
  store.dispatch(setIsNonLoggedUser(false));
});

describe('Home state (data-model.md)', () => {
  // FAQ cache starts null, is set by items, cleared only by clearFaq (FR-036, FR-065, P-07)
  it('keeps the FAQ cache null until set and clears it only through clearFaq', () => {
    expect(store.getState().faq.items).toBeNull();
    store.dispatch(setFaqItems([{ question: 'q', answer: 'a' }]));
    expect(store.getState().faq.items).toEqual([{ question: 'q', answer: 'a' }]);
    store.dispatch(clearFaq());
    expect(store.getState().faq.items).toBeNull();
  });

  // separate token slots (FR-029, E-13)
  it('keeps the non-logged and logged-in token slots separate', () => {
    store.dispatch(setLoggedInToken('LOGGED-IN'));
    expect(store.getState().token.nonLoggedToken).toBeNull();
    store.dispatch(setNonLoggedToken('APP'));
    expect(store.getState().token.nonLoggedToken).toBe('APP');
    expect(store.getState().token.loggedInToken).toBe('LOGGED-IN');
    store.dispatch(clearNonLoggedToken());
    expect(store.getState().token.loggedInToken).toBe('LOGGED-IN');
  });

  // Covers: HOME_RESET_TC_001, HOME_RESET_TC_002 - reset values of the offers form and selected offer (FR-062, FR-063, BR-11, P-13)
  it('resets the offers form to empty and clears the selected offer', () => {
    store.dispatch(setOffersForm({ fullName: 'A B', mobileNo: '9999999999', tncAccepted: true }));
    store.dispatch(setSelectedOffer({ id: 1 }));
    store.dispatch(resetOffersForm());
    store.dispatch(clearSelectedOffer());
    expect(store.getState().offers.form).toEqual({ fullName: '', mobileNo: '', tncAccepted: false });
    expect(store.getState().offers.selectedOffer).toBeNull();
  });

  // Covers: HOME_RESET_TC_003 - session flags (FR-064, FR-017, FR-035)
  it('defaults the session flags and sets the register return flag back to null', () => {
    const flags = store.getState().sessionFlags;
    expect(flags.isNonLoggedUser).toBe(false);
    expect(flags.faqsFromNonLogin).toBe(false);
    expect(flags.registerNowReturnScreen).toBeNull();
    store.dispatch(setRegisterNowReturnScreen('changePassword'));
    store.dispatch(setFaqsFromNonLogin(true));
    store.dispatch(setIsNonLoggedUser(true));
    expect(store.getState().sessionFlags.registerNowReturnScreen).toBe('changePassword');
    store.dispatch(setRegisterNowReturnScreen(null));
    expect(store.getState().sessionFlags.registerNowReturnScreen).toBeNull();
    expect(store.getState().sessionFlags.faqsFromNonLogin).toBe(true);
  });

  // Covers: HOME_RESET_TC_005 - the focus reset leaves the FAQ cache and the token alone (FR-065)
  it('does not touch the FAQ cache or the token when the focus-reset actions run', () => {
    store.dispatch(setFaqItems([{ question: 'q', answer: 'a' }]));
    store.dispatch(setNonLoggedToken('APP'));
    store.dispatch(resetOffersForm());
    store.dispatch(clearSelectedOffer());
    store.dispatch(setRegisterNowReturnScreen(null));
    expect(store.getState().faq.items).toHaveLength(1);
    expect(store.getState().token.nonLoggedToken).toBe('APP');
  });
});
