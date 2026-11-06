import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { createAppStore } from '../../../store';
import { setFaqItems } from '../../../store/faqSlice';
import { setOffersForm, setSelectedOffer } from '../../../store/offersSlice';
import { setRegisterNowReturnScreen } from '../../../store/sessionFlagsSlice';
import { setNonLoggedToken } from '../../../store/tokenSlice';
import { useFocusReset } from '../hooks/useFocusReset';

function setup() {
  const store = createAppStore();
  const listeners: Array<() => void> = [];
  const unsubscribe = jest.fn();
  const navigation = {
    navigate: jest.fn(),
    addListener: jest.fn((_type: string, cb: () => void) => {
      listeners.push(cb);
      return unsubscribe;
    }),
  };
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  const hook = renderHook(() => useFocusReset(navigation), { wrapper });
  const focus = () => act(() => listeners.forEach(cb => cb()));
  return { store, navigation, unsubscribe, focus, ...hook };
}

function dirty(store: ReturnType<typeof createAppStore>) {
  store.dispatch(setOffersForm({ fullName: 'A B', mobileNo: '9999999999', tncAccepted: true }));
  store.dispatch(setSelectedOffer({ id: 7 }));
  store.dispatch(setRegisterNowReturnScreen('changePassword'));
}

describe('useFocusReset', () => {
  // Covers: HOME_RESET_TC_001, HOME_RESET_TC_002, HOME_RESET_TC_003, HOME_STATE_TC_001 - reset on focus (FR-062 to FR-064, BR-11, P-13)
  it('[HOME_RESET_TC_001] resets the offers form, the selected offer and the register return flag on focus', () => {
    const { store, focus } = setup();
    dirty(store);
    focus();
    expect(store.getState().offers.form).toEqual({ fullName: '', mobileNo: '', tncAccepted: false });
    expect(store.getState().offers.selectedOffer).toBeNull();
    expect(store.getState().sessionFlags.registerNowReturnScreen).toBeNull();
  });

  // Covers: HOME_RESET_TC_004 - it runs again on every later focus (Offers back, Offers fail "Ok", FAQ back, Pay Now back) (FR-065, E-10)
  it('[HOME_RESET_TC_004] runs on every focus, not only the first', () => {
    const { store, focus } = setup();
    for (let i = 0; i < 3; i += 1) {
      dirty(store);
      focus();
      expect(store.getState().offers.selectedOffer).toBeNull();
      expect(store.getState().offers.form.fullName).toBe('');
    }
  });

  // Covers: HOME_RESET_TC_005 - it leaves the FAQ cache and the token alone (FR-065)
  it('does not clear the FAQ cache or the non-logged token', () => {
    const { store, focus } = setup();
    store.dispatch(setFaqItems([{ question: 'q', answer: 'a' }]));
    store.dispatch(setNonLoggedToken('APP'));
    focus();
    expect(store.getState().faq.items).toHaveLength(1);
    expect(store.getState().token.nonLoggedToken).toBe('APP');
  });

  // also starts clean on the first mount (FR-062)
  it('starts clean on the first mount', () => {
    const store = createAppStore();
    dirty(store);
    const navigation = { navigate: jest.fn(), addListener: jest.fn(() => () => undefined) };
    renderHook(() => useFocusReset(navigation), {
      wrapper: ({ children }: { children: React.ReactNode }) => <Provider store={store}>{children}</Provider>,
    });
    expect(store.getState().offers.selectedOffer).toBeNull();
  });

  // the focus listener is removed on unmount (PERF-5)
  it('removes its focus listener on unmount', () => {
    const { unsubscribe, unmount } = setup();
    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
