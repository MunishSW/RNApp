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
  // Covers: FR-4.9-01 to FR-4.9-03, BR-11, P-13, TC-504, TC-505, TC-506 - reset on focus
  it('[TC-504] resets the offers form, the selected offer and the register return flag on focus', () => {
    const { store, focus } = setup();
    dirty(store);
    focus();
    expect(store.getState().offers.form).toEqual({ fullName: '', mobileNo: '', tncAccepted: false });
    expect(store.getState().offers.selectedOffer).toBeNull();
    expect(store.getState().sessionFlags.registerNowReturnScreen).toBeNull();
  });

  // Covers: FR-4.9-04, E-10 - it runs again on every later focus (Offers back, Offers fail "Ok", FAQ back, Pay Now back)
  it('[E-10] runs on every focus, not only the first', () => {
    const { store, focus } = setup();
    for (let i = 0; i < 3; i += 1) {
      dirty(store);
      focus();
      expect(store.getState().offers.selectedOffer).toBeNull();
      expect(store.getState().offers.form.fullName).toBe('');
    }
  });

  // Covers: FR-4.9-04 - it leaves the FAQ cache and the token alone
  it('does not clear the FAQ cache or the non-logged token', () => {
    const { store, focus } = setup();
    store.dispatch(setFaqItems([{ question: 'q', answer: 'a' }]));
    store.dispatch(setNonLoggedToken('APP'));
    focus();
    expect(store.getState().faq.items).toHaveLength(1);
    expect(store.getState().token.nonLoggedToken).toBe('APP');
  });

  // Covers: FR-4.9-01 - also starts clean on the first mount
  it('starts clean on the first mount', () => {
    const store = createAppStore();
    dirty(store);
    const navigation = { navigate: jest.fn(), addListener: jest.fn(() => () => undefined) };
    renderHook(() => useFocusReset(navigation), {
      wrapper: ({ children }: { children: React.ReactNode }) => <Provider store={store}>{children}</Provider>,
    });
    expect(store.getState().offers.selectedOffer).toBeNull();
  });

  // Covers: PERF-5 - the focus listener is removed on unmount
  it('removes its focus listener on unmount', () => {
    const { unsubscribe, unmount } = setup();
    unmount();
    expect(unsubscribe).toHaveBeenCalledTimes(1);
  });
});
