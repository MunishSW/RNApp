import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { setAnalyticsSink } from '../../../services/analytics';
import { createAppStore } from '../../../store';
import { useFaqFlow } from '../hooks/useFaqFlow';
import { useHomeActions } from '../hooks/useHomeActions';
import { TILES } from '../nonLoggedInHomeConstants';

jest.mock('../hooks/useFaqFlow', () => ({
  useFaqFlow: jest.fn(),
}));

const sink = jest.fn();
const faqPress = jest.fn();

function setup(handlers: Parameters<typeof useHomeActions>[1] = {}, failNavigation = false) {
  const store = createAppStore();
  const navigation = {
    navigate: jest.fn(() => {
      if (failNavigation) {
        throw new Error('navigation failed');
      }
    }),
    addListener: jest.fn(() => () => undefined),
  };
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  const hook = renderHook(() => useHomeActions(navigation, handlers), { wrapper });
  return { store, navigation, ...hook };
}

const tile = (id: string) => TILES.find(t => t.id === id)!;

beforeEach(() => {
  jest.useFakeTimers();
  sink.mockClear();
  faqPress.mockClear();
  (useFaqFlow as jest.Mock).mockReturnValue({
    loading: false,
    errorVisible: false,
    onFaqPress: faqPress,
    onErrorOkay: jest.fn(),
  });
  setAnalyticsSink(sink);
});

afterEach(() => {
  jest.useRealTimers();
  setAnalyticsSink(() => undefined);
});

describe('useHomeActions', () => {
  // Covers: FR-4.3-02, BR-8, P-02, TC-201 - Login records cta_clicked, then opens the Login screen
  it('[TC-201] records cta_clicked then navigates to LoginScreen', () => {
    const { result, navigation } = setup();
    act(() => result.current.onLoginPress());
    expect(sink).toHaveBeenCalledWith({
      name: 'cta_clicked',
      properties: { cta_name: 'login', screen: 'non_logged_home' },
    });
    expect(navigation.navigate).toHaveBeenCalledWith('LoginScreen', undefined);
    expect(sink.mock.invocationCallOrder[0]).toBeLessThan(navigation.navigate.mock.invocationCallOrder[0]);
  });

  // Covers: FR-4.2-06, FR-4.2-07, P-04, P-05, P-14, TC-203, TC-204, TC-206 - tile destinations
  it.each([
    ['ourProducts', 'Products', undefined],
    ['trackApplication', 'TrackApplication', undefined],
    ['offers', 'Offers', undefined],
    ['payNow', 'NonLoggedInPayNow', { title: 'Pay Now' }],
  ])('%s opens %s', (id, route, params) => {
    const { result, navigation } = setup();
    act(() => result.current.onTilePress(tile(id)));
    expect(navigation.navigate).toHaveBeenCalledWith(route, params);
  });

  // Covers: FR-4.2-09, TC-207 - every tile records quick_link_clicked with the right link name
  it('[TC-207] records quick_link_clicked with link_name, location and logged_in false', () => {
    const { result, navigation } = setup({ onContactPress: jest.fn() });
    TILES.forEach(t => {
      act(() => result.current.onTilePress(t));
      act(() => {
        jest.advanceTimersByTime(1000);
      });
    });
    const clicks = sink.mock.calls
      .map(c => c[0])
      .filter(e => e.name === 'quick_link_clicked')
      .map(e => e.properties);
    expect(clicks).toEqual(
      ['pay_now', 'products', 'track_application', 'faq', 'offers', 'contact_us'].map(link_name => ({
        link_name,
        location: 'non_logged_home',
        logged_in: false,
      })),
    );
    expect(navigation.navigate).toHaveBeenCalledTimes(4);
  });

  // Covers: FR-4.2-09 - a failed navigation is still counted
  it('counts the tap even when navigation throws', () => {
    const { result } = setup({}, true);
    expect(() => act(() => result.current.onTilePress(tile('offers')))).toThrow();
    expect(sink).toHaveBeenCalledWith({
      name: 'quick_link_clicked',
      properties: { link_name: 'offers', location: 'non_logged_home', logged_in: false },
    });
  });

  // Covers: FR-4.2-08, BR-7, P-06 - Contact Us marks a non-logged user, records both events, does not navigate
  it('Contact Us sets the non-logged flag, records events and opens the popup without a route change', () => {
    const onContactPress = jest.fn();
    const { result, navigation, store } = setup({ onContactPress });
    act(() => result.current.onTilePress(tile('contactUs')));
    expect(store.getState().sessionFlags.isNonLoggedUser).toBe(true);
    expect(sink).toHaveBeenCalledWith({
      name: 'contact_us_clicked',
      properties: { channel: 'non_logged_home' },
    });
    expect(onContactPress).toHaveBeenCalledTimes(1);
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  // Covers: FR-4.2-06, FR-4.5-01 - FAQs hands off to the FAQ flow, no direct navigation
  it('FAQs runs the FAQ handler and does not navigate itself', () => {
    const { result, navigation } = setup();
    act(() => result.current.onTilePress(tile('faqs')));
    expect(faqPress).toHaveBeenCalledTimes(1);
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  // Covers: FR-4.2-10, E-14 - rapid taps on different tiles open only one destination
  it('[E-14] opens one destination for rapid taps on different tiles', () => {
    const { result, navigation } = setup();
    act(() => {
      result.current.onTilePress(tile('offers'));
      result.current.onTilePress(tile('ourProducts'));
      result.current.onLoginPress();
    });
    expect(navigation.navigate).toHaveBeenCalledTimes(1);
  });
});
