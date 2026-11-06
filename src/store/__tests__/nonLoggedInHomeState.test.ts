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
  // Covers: FR-4.5-02, FR-4.9-04, P-07 - FAQ cache starts null, is set by items, cleared only by clearFaq
  it('keeps the FAQ cache null until set and clears it only through clearFaq', () => {
    expect(store.getState().faq.items).toBeNull();
    store.dispatch(setFaqItems([{ question: 'q', answer: 'a' }]));
    expect(store.getState().faq.items).toEqual([{ question: 'q', answer: 'a' }]);
    store.dispatch(clearFaq());
    expect(store.getState().faq.items).toBeNull();
  });

  // Covers: FR-4.4-05, E-13 - separate token slots
  it('keeps the non-logged and logged-in token slots separate', () => {
    store.dispatch(setLoggedInToken('LOGGED-IN'));
    expect(store.getState().token.nonLoggedToken).toBeNull();
    store.dispatch(setNonLoggedToken('APP'));
    expect(store.getState().token.nonLoggedToken).toBe('APP');
    expect(store.getState().token.loggedInToken).toBe('LOGGED-IN');
    store.dispatch(clearNonLoggedToken());
    expect(store.getState().token.loggedInToken).toBe('LOGGED-IN');
  });

  // Covers: FR-4.9-01, FR-4.9-02, BR-11, P-13, TC-504, TC-505 - reset values of the offers form and selected offer
  it('resets the offers form to empty and clears the selected offer', () => {
    store.dispatch(setOffersForm({ fullName: 'A B', mobileNo: '9999999999', tncAccepted: true }));
    store.dispatch(setSelectedOffer({ id: 1 }));
    store.dispatch(resetOffersForm());
    store.dispatch(clearSelectedOffer());
    expect(store.getState().offers.form).toEqual({ fullName: '', mobileNo: '', tncAccepted: false });
    expect(store.getState().offers.selectedOffer).toBeNull();
  });

  // Covers: FR-4.9-03, FR-4.2-08, FR-4.5-01, TC-506 - session flags
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

  // Covers: FR-4.9-04 - the focus reset leaves the FAQ cache and the token alone
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
