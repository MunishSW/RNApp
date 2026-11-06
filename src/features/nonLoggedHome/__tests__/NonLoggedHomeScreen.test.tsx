import React from 'react';
import { AccessibilityInfo, BackHandler, Dimensions, Linking } from 'react-native';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { restorePlatformOS, setPlatformOS } from '../../../testUtils/platform';
import { setAnalyticsSink } from '../../../services/analytics';
import { fetchFaq } from '../../../services/faqService';
import { requestNonLoggedToken } from '../../../services/authService';
import { logout } from '../../../services/sessionService';
import { checkAppVersion } from '../../../services/versionService';
import { createAppStore } from '../../../store';
import { setFaqItems } from '../../../store/faqSlice';
import { setOffersForm, setSelectedOffer } from '../../../store/offersSlice';
import { setRegisterNowReturnScreen } from '../../../store/sessionFlagsSlice';
import { setNonLoggedToken } from '../../../store/tokenSlice';
import NonLoggedHomeScreen from '../NonLoggedHomeScreen';
import { buildPayNowParams } from '../hooks/useHomeActions';
import { popupMaxHeight } from '../components/CustomerCarePopup';
import { SERVER_ERROR_MESSAGE } from '../nonLoggedHomeConstants';

jest.mock('../../../services/faqService', () => ({ fetchFaq: jest.fn() }));
jest.mock('../../../services/authService', () => ({ requestNonLoggedToken: jest.fn() }));
jest.mock('../../../services/versionService', () => ({ checkAppVersion: jest.fn() }));
jest.mock('../../../services/sessionService', () => ({ logout: jest.fn() }));

type ScreenProps = React.ComponentProps<typeof NonLoggedHomeScreen>;

const TILE_NAMES = ['Pay Now', 'Our Products', 'Track Application', 'FAQs', 'Offers', 'Contact Us'];

let backHandlers: Array<() => boolean> = [];
let spies: jest.SpyInstance[] = [];

function setup(
  options: { faqCache?: boolean; prepare?: (store: ReturnType<typeof createAppStore>) => void } = {},
) {
  const store = createAppStore();
  options.prepare?.(store);
  if (options.faqCache) {
    store.dispatch(setFaqItems([{ question: 'q', answer: 'a' }]));
  }
  const listeners: Record<string, Array<() => void>> = {};
  const navigation = {
    navigate: jest.fn(),
    addListener: jest.fn((type: string, cb: () => void) => {
      (listeners[type] = listeners[type] || []).push(cb);
      return () => {
        listeners[type] = listeners[type].filter(x => x !== cb);
      };
    }),
  };
  const props = {
    navigation,
    route: { key: 'home', name: 'NonLoggedHome' },
  } as unknown as ScreenProps;
  const utils = render(
    <Provider store={store}>
      <NonLoggedHomeScreen {...props} />
    </Provider>,
  );
  const emit = (type: string) => act(() => (listeners[type] || []).slice().forEach(cb => cb()));
  return { ...utils, store, navigation, emit };
}

const pressBack = () => act(() => backHandlers[backHandlers.length - 1]());
const tile = (name: string) => screen.getByRole('button', { name });

const sink = jest.fn();

beforeEach(() => {
  setPlatformOS('android');
  backHandlers = [];
  spies = [];
  spies.push(jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_event, handler) => {
    backHandlers.push(handler as () => boolean);
    return {
      remove: () => {
        backHandlers = backHandlers.filter(h => h !== handler);
      },
    };
  }));
  spies.push(jest.spyOn(BackHandler, 'exitApp').mockImplementation(() => undefined));
  spies.push(jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined));
  (checkAppVersion as jest.Mock).mockResolvedValue({ kind: 'none' });
  (requestNonLoggedToken as jest.Mock).mockResolvedValue('tok');
  (fetchFaq as jest.Mock).mockResolvedValue([]);
  (logout as jest.Mock).mockResolvedValue(undefined);
  sink.mockClear();
  setAnalyticsSink(sink);
  Dimensions.set({
    window: { width: 360, height: 812, scale: 1, fontScale: 1 },
    screen: { width: 360, height: 812, scale: 1, fontScale: 1 },
  });
});

afterEach(() => {
  spies.forEach(s => s.mockRestore());
  restorePlatformOS();
  [fetchFaq, requestNonLoggedToken, checkAppVersion, logout].forEach(m => (m as jest.Mock).mockReset());
  setAnalyticsSink(() => undefined);
});

describe('layout and content', () => {
  // Covers: HOME_LAYOUT_TC_001 — illustration, headline, six tiles (3 + 3) and one Login button
  it('[HOME_LAYOUT_TC_001] shows illustration, 3-line headline, six tiles in two rows and Login', () => {
    setup();
    expect(screen.getByTestId('home-illustration', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByTestId('home-headline').props.children).toBe(
      'Login to download account statements,\nmake payments, and manage your\naccount, on the go!',
    );
    expect(screen.getByTestId('home-grid').children).toHaveLength(2);
    expect(screen.getByTestId('login-button')).toBeTruthy();
    expect(screen.queryByText('Register Now')).toBeNull();
  });

  // Covers: HOME_LAYOUT_TC_002 — tile labels and order, Login last in focus order
  it('[HOME_LAYOUT_TC_002] lists the tiles in the fixed order followed by Login', () => {
    setup();
    const names = screen.getAllByRole('button').map(b => b.props.accessibilityLabel);
    expect(names).toEqual([...TILE_NAMES, 'Login']);
  });

  // Covers: HOME_LAYOUT_TC_003 — Home draws without waiting for background calls
  // Covers: HOME_NET_TC_001 — Home renders with no network
  it('[HOME_LAYOUT_TC_003] renders and is tappable while token and version calls are pending', () => {
    (requestNonLoggedToken as jest.Mock).mockReturnValue(new Promise(() => undefined));
    (checkAppVersion as jest.Mock).mockReturnValue(new Promise(() => undefined));
    setup();
    expect(screen.queryByTestId('loading-overlay')).toBeNull();
    expect(screen.getAllByRole('button')).toHaveLength(7);
  });

  it('[HOME_NET_TC_001] renders fully when every network call rejects', async () => {
    (requestNonLoggedToken as jest.Mock).mockRejectedValue(new Error('offline'));
    (checkAppVersion as jest.Mock).mockRejectedValue(new Error('offline'));
    (fetchFaq as jest.Mock).mockRejectedValue(new Error('offline'));
    setup();
    await act(async () => undefined);
    expect(screen.getAllByRole('button')).toHaveLength(7);
    expect(screen.queryByTestId('version-dialog')).toBeNull();
  });

  // Covers: HOME_NET_TC_008 — wide screen: content centred in a 360 wide column, not stretched
  it('[HOME_NET_TC_008] keeps the content column at most 360 wide and centred', () => {
    const { toJSON } = setup();
    const json = JSON.stringify(toJSON());
    expect(json).toContain('"maxWidth":360');
    expect(json).toContain('"alignItems":"center"');
  });

  // Covers: HOME_NET_TC_007 — Login stays inside the scroll view so it is reachable (visual check manual)
  it('puts the content inside a scroll view with hidden indicators', () => {
    setup();
    const scroll = screen.getByTestId('home-scroll');
    expect(scroll.props.showsVerticalScrollIndicator).toBe(false);
  });

  it('stacks the tiles one per row at text scale 1.5x', () => {
    Dimensions.set({
      window: { width: 360, height: 812, scale: 1, fontScale: 1.5 },
      screen: { width: 360, height: 812, scale: 1, fontScale: 1.5 },
    });
    setup();
    expect(screen.getByTestId('home-grid').children).toHaveLength(6);
    expect(screen.getByTestId('login-button')).toBeTruthy();
  });
});

describe('tiles and Login', () => {
  // Covers: HOME_ACTION_TC_001 — Pay Now opens the payment portal route with title Pay Now
  it('[HOME_ACTION_TC_001] Pay Now navigates to the WebView route with portal URL and title', () => {
    const { navigation } = setup();
    fireEvent.press(tile('Pay Now'));
    expect(navigation.navigate).toHaveBeenCalledWith('PayNowWebView', {
      title: 'Pay Now',
      url: 'https://portal.example.test/#/payments/paynow',
      loader: false,
    });
  });

  // Covers: HOME_NEG_TC_002 — Pay Now URL unavailable is handled
  it('[HOME_NEG_TC_002] builds null params without throwing when the portal URL is missing', () => {
    expect(buildPayNowParams('')).toEqual({ title: 'Pay Now', url: null, loader: false });
    expect(buildPayNowParams('https://p.example')).toEqual({
      title: 'Pay Now',
      url: 'https://p.example/#/payments/paynow',
      loader: false,
    });
  });

  // Covers: HOME_ACTION_TC_002 — Our Products routes to Products
  it('[HOME_ACTION_TC_002] Our Products navigates to Products', () => {
    const { navigation } = setup();
    fireEvent.press(tile('Our Products'));
    expect(navigation.navigate).toHaveBeenCalledWith('Products', undefined);
  });

  // Covers: HOME_ACTION_TC_003 — Track Application goes to its route stub (O-03)
  it('[HOME_ACTION_TC_003] Track Application navigates to its route stub', () => {
    const { navigation } = setup();
    fireEvent.press(tile('Track Application'));
    expect(navigation.navigate).toHaveBeenCalledWith('TrackApplication', undefined);
  });

  // Covers: HOME_ACTION_TC_005 — Offers routes to non-logged Offers
  it('[HOME_ACTION_TC_005] Offers navigates to Offers', () => {
    const { navigation } = setup();
    fireEvent.press(tile('Offers'));
    expect(navigation.navigate).toHaveBeenCalledWith('Offers', undefined);
  });

  // Covers: HOME_ACTION_TC_007 — Login records cta_clicked and routes to LoginScreen
  it('[HOME_ACTION_TC_007] Login records cta_clicked, then navigates to LoginScreen', () => {
    const order: string[] = [];
    sink.mockImplementation(() => order.push('track'));
    const { navigation } = setup();
    navigation.navigate.mockImplementation(() => order.push('navigate'));
    fireEvent.press(screen.getByRole('button', { name: 'Login' }));
    expect(sink).toHaveBeenCalledWith({
      name: 'cta_clicked',
      properties: { cta_name: 'login', screen: 'non_logged_home' },
    });
    expect(navigation.navigate).toHaveBeenCalledWith('LoginScreen', undefined);
    expect(order).toEqual(['track', 'navigate']);
  });

  it('records quick_link_clicked with the right link_name before navigating', () => {
    const order: string[] = [];
    sink.mockImplementation(() => order.push('track'));
    const { navigation } = setup();
    navigation.navigate.mockImplementation(() => order.push('navigate'));
    fireEvent.press(tile('Our Products'));
    expect(sink).toHaveBeenCalledWith({
      name: 'quick_link_clicked',
      properties: { link_name: 'products', location: 'non_logged_home', logged_in: false },
    });
    expect(order).toEqual(['track', 'navigate']);
  });

  // Covers: HOME_NET_TC_005 — rapid taps on different tiles open one destination
  it('[HOME_NET_TC_005] opens only one destination for rapid taps on different tiles', () => {
    const { navigation } = setup();
    fireEvent.press(tile('Our Products'));
    fireEvent.press(tile('Offers'));
    fireEvent.press(screen.getByRole('button', { name: 'Login' }));
    expect(navigation.navigate).toHaveBeenCalledTimes(1);
  });

  // Covers: HOME_NET_TC_006 — rapid taps on the same tile do not duplicate screens
  it('[HOME_NET_TC_006] ignores repeat taps on Offers and unlocks when Home regains focus', () => {
    const { navigation, emit } = setup();
    fireEvent.press(tile('Offers'));
    fireEvent.press(tile('Offers'));
    expect(navigation.navigate).toHaveBeenCalledTimes(1);
    emit('focus');
    fireEvent.press(tile('Offers'));
    expect(navigation.navigate).toHaveBeenCalledTimes(2);
  });

  // Covers: HOME_ACTION_TC_010 — user returns to Home after closing the Pay Now WebView
  it('[HOME_ACTION_TC_010] stays usable after returning from Pay Now', () => {
    const { navigation, emit } = setup();
    fireEvent.press(tile('Pay Now'));
    emit('focus');
    fireEvent.press(tile('Our Products'));
    expect(navigation.navigate).toHaveBeenCalledTimes(2);
    expect(screen.getAllByRole('button')).toHaveLength(7);
  });

  // Covers: HOME_STATE_TC_002 — token success leaves every quick action available
  it('[HOME_STATE_TC_002] keeps all quick actions enabled after the token succeeds', async () => {
    setup();
    await act(async () => undefined);
    screen.getAllByRole('button').forEach(b => {
      expect(b.props.accessibilityState?.disabled).toBeFalsy();
    });
  });

  // Covers: HOME_STATE_TC_003 — token failure is silent
  it('[HOME_STATE_TC_003] shows nothing and stays usable when the token call fails', async () => {
    (requestNonLoggedToken as jest.Mock).mockRejectedValue(new Error('500'));
    setup();
    await act(async () => undefined);
    expect(screen.queryByTestId('common-message-dialog')).toBeNull();
    expect(screen.getAllByRole('button')).toHaveLength(7);
  });
});

describe('FAQ flow', () => {
  // Covers: HOME_ACTION_TC_008 — no cache: spinner, FAQ API called, FAQ screen opens
  // Covers: HOME_ACTION_TC_004 — FAQs opens the FAQ screen
  // Covers: HOME_FAQ_TC_004 — spinner blocks other touches while FAQ loads
  it('[HOME_ACTION_TC_008] shows the spinner, calls the API once and opens the FAQ screen', async () => {
    let resolve: (v: unknown) => void = () => undefined;
    (fetchFaq as jest.Mock).mockReturnValue(new Promise(r => { resolve = r; }));
    const { navigation, store } = setup();
    fireEvent.press(tile('FAQs'));
    expect(screen.getByTestId('loading-overlay')).toBeTruthy();
    expect(store.getState().sessionFlags.faqsFromNonLogin).toBe(true);
    await act(async () => resolve([{ question: 'q', answer: 'a' }]));
    expect(screen.queryByTestId('loading-overlay')).toBeNull();
    expect(navigation.navigate).toHaveBeenCalledWith('Faq', undefined);
    expect(fetchFaq).toHaveBeenCalledTimes(1);
    expect(store.getState().faq.items).toHaveLength(1);
  });

  // Covers: HOME_ACTION_TC_009 — cached FAQ opens immediately with no new API call
  it('[HOME_ACTION_TC_009] opens the FAQ screen from cache without calling the API', async () => {
    const { navigation } = setup({ faqCache: true });
    await act(async () => {
      fireEvent.press(tile('FAQs'));
    });
    expect(fetchFaq).not.toHaveBeenCalled();
    expect(navigation.navigate).toHaveBeenCalledWith('Faq', undefined);
    expect(screen.queryByTestId('loading-overlay')).toBeNull();
  });

  // Covers: HOME_NEG_TC_001 — FAQ failure shows the exact error, spinner clears
  // Covers: HOME_FAQ_TC_007 — spinner always clears on failure
  // Covers: HOME_FAQ_TC_006 — Okay closes the dialog and keeps the user on Home
  it('[HOME_NEG_TC_001] shows the exact error dialog, records dialog_shown and Okay closes it', async () => {
    (fetchFaq as jest.Mock).mockRejectedValue(new Error('500'));
    const { navigation } = setup();
    await act(async () => {
      fireEvent.press(tile('FAQs'));
    });
    expect(screen.queryByTestId('loading-overlay')).toBeNull();
    expect(screen.getByText(SERVER_ERROR_MESSAGE)).toBeTruthy();
    expect(screen.queryByText('Close')).toBeNull();
    expect(sink).toHaveBeenCalledWith({
      name: 'dialog_shown',
      properties: { dialog_name: 'faq_error', screen: 'non_logged_home', kind: 'error' },
    });
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(SERVER_ERROR_MESSAGE);
    fireEvent.press(screen.getByTestId('common-message-okay'));
    expect(screen.queryByText(SERVER_ERROR_MESSAGE)).toBeNull();
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  // Covers: HOME_FAQ_TC_001 — empty list stays on Home with no dialog
  // Covers: HOME_FAQ_TC_002 — non-array treated as empty (service returns [])
  it('[HOME_FAQ_TC_001] stays on Home with no dialog for an empty list', async () => {
    (fetchFaq as jest.Mock).mockResolvedValue([]);
    const { navigation } = setup();
    await act(async () => {
      fireEvent.press(tile('FAQs'));
    });
    expect(screen.queryByTestId('loading-overlay')).toBeNull();
    expect(screen.queryByTestId('common-message-dialog')).toBeNull();
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  // Covers: HOME_FAQ_TC_003 — double tap sends one request
  it('[HOME_FAQ_TC_003] ignores a second FAQs tap while loading', async () => {
    let resolve: (v: unknown) => void = () => undefined;
    (fetchFaq as jest.Mock).mockReturnValue(new Promise(r => { resolve = r; }));
    setup();
    fireEvent.press(tile('FAQs'));
    fireEvent.press(tile('FAQs'));
    expect(fetchFaq).toHaveBeenCalledTimes(1);
    await act(async () => resolve([]));
  });

  // Covers: HOME_FAQ_TC_005 — retry after failure succeeds
  // Covers: HOME_NET_TC_002 — no network shows the error dialog and clears the spinner
  // Covers: HOME_NET_TC_004 — network lost mid fetch
  it('[HOME_FAQ_TC_005] opens the FAQ screen on the second attempt after a failure', async () => {
    (fetchFaq as jest.Mock)
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockResolvedValueOnce([{ question: 'q', answer: 'a' }]);
    const { navigation } = setup();
    await act(async () => {
      fireEvent.press(tile('FAQs'));
    });
    expect(screen.getByText(SERVER_ERROR_MESSAGE)).toBeTruthy();
    fireEvent.press(screen.getByTestId('common-message-okay'));
    await act(async () => {
      fireEvent.press(tile('FAQs'));
    });
    expect(navigation.navigate).toHaveBeenCalledWith('Faq', undefined);
  });

  // Covers: HOME_TOKEN_TC_005 — FAQ shows the error after a token failure
  it('[HOME_TOKEN_TC_005] shows the FAQ error when both token and FAQ requests fail', async () => {
    (requestNonLoggedToken as jest.Mock).mockRejectedValue(new Error('500'));
    (fetchFaq as jest.Mock).mockRejectedValue(new Error('401'));
    setup();
    await act(async () => {
      fireEvent.press(tile('FAQs'));
    });
    expect(screen.getByText(SERVER_ERROR_MESSAGE)).toBeTruthy();
  });

  // Covers: HOME_BACK_TC_005 — FAQ back returns to Home (flag set, Home regains focus cleanly)
  it('[HOME_BACK_TC_005] sets faqsFromNonLogin and Home stays intact after returning', async () => {
    const { store, emit } = setup({ faqCache: true });
    await act(async () => {
      fireEvent.press(tile('FAQs'));
    });
    expect(store.getState().sessionFlags.faqsFromNonLogin).toBe(true);
    emit('focus');
    expect(screen.getAllByRole('button')).toHaveLength(7);
  });
});

describe('Contact Us popup', () => {
  // Covers: HOME_ACTION_TC_006 — Contact Us opens the Customer Care popup (not a route)
  // Covers: HOME_CONTACT_TC_001 — heading and three rows
  it('[HOME_CONTACT_TC_001] opens the popup with heading, three rows and the non-login flag', () => {
    const { navigation, store } = setup();
    fireEvent.press(tile('Contact Us'));
    expect(screen.getByText('We are here to help!')).toBeTruthy();
    expect(screen.getByText('022-45297300')).toBeTruthy();
    expect(screen.getByText('bhflwecare@bajajhousing.co.in')).toBeTruthy();
    expect(screen.getByText('Branch locator')).toBeTruthy();
    expect(navigation.navigate).not.toHaveBeenCalled();
    expect(store.getState().sessionFlags.isNonLoggedUser).toBe(true);
    expect(sink).toHaveBeenCalledWith({
      name: 'contact_us_clicked',
      properties: { channel: 'non_logged_home' },
    });
  });

  // Covers: HOME_CONTACT_TC_002 — close control closes the popup
  it('[HOME_CONTACT_TC_002] closes with the close control and Home stays', () => {
    setup();
    fireEvent.press(tile('Contact Us'));
    fireEvent.press(screen.getByTestId('contact-popup-close'));
    expect(screen.queryByText('We are here to help!')).toBeNull();
    expect(screen.getByTestId('home-grid')).toBeTruthy();
  });

  // Covers: HOME_CONTACT_TC_004 — popup height cap and inner scroll
  it('[HOME_CONTACT_TC_004] caps the popup height at window minus insets minus 64 and scrolls inside', () => {
    expect(popupMaxHeight(812, 44, 34)).toBe(812 - 44 - 34 - 64);
    expect(popupMaxHeight(100, 44, 34)).toBe(0);
    setup();
    fireEvent.press(tile('Contact Us'));
    expect(screen.getByTestId('contact-popup-scroll')).toBeTruthy();
    expect(JSON.stringify(screen.getByTestId('contact-popup').props.style)).toContain(`"maxHeight":${popupMaxHeight(812, 0, 0)}`);
  });

  // Covers: HOME_CONTACT_TC_006 — rapid taps open one popup
  it('[HOME_CONTACT_TC_006] opens only one popup instance on rapid taps', () => {
    setup();
    fireEvent.press(tile('Contact Us'));
    fireEvent.press(tile('Contact Us'));
    expect(screen.getAllByText('We are here to help!')).toHaveLength(1);
    expect(sink.mock.calls.filter(c => c[0].name === 'contact_us_clicked')).toHaveLength(1);
  });

  // Covers: HOME_CONTACT_TC_005 — Call, Email and Find Us tap behaviour (O-06)
  it('[HOME_CONTACT_TC_005] Call opens the dialer, Email the mail app, Find Us the Branch Locator', () => {
    const { navigation } = setup();
    fireEvent.press(tile('Contact Us'));
    fireEvent.press(screen.getByTestId('contact-row-call'));
    expect(Linking.openURL).toHaveBeenCalledWith('tel:02245297300');
    fireEvent.press(screen.getByTestId('contact-row-email'));
    expect(Linking.openURL).toHaveBeenCalledWith('mailto:bhflwecare@bajajhousing.co.in');
    fireEvent.press(screen.getByTestId('contact-row-find'));
    expect(navigation.navigate).toHaveBeenCalledWith('BranchLocator', undefined);
    expect(screen.queryByText('We are here to help!')).toBeNull();
  });

  it('does not crash when the dialer or mail app cannot be opened', async () => {
    (Linking.openURL as jest.Mock).mockRejectedValue(new Error('no handler'));
    setup();
    fireEvent.press(tile('Contact Us'));
    await act(async () => {
      fireEvent.press(screen.getByTestId('contact-row-call'));
    });
    expect(screen.getByText('We are here to help!')).toBeTruthy();
  });
});

describe('Android back and exit', () => {
  // Covers: HOME_BACK_TC_001 — exit confirmation on Android back
  it('[HOME_BACK_TC_001] shows the exit dialog with CANCEL and Okay', () => {
    setup();
    pressBack();
    expect(screen.getByText('Are you sure you want to exit!')).toBeTruthy();
    expect(screen.getByTestId('exit-cancel')).toBeTruthy();
    expect(screen.getByTestId('exit-okay')).toBeTruthy();
  });

  // Covers: HOME_BACK_TC_002 — Okay closes the app
  it('[HOME_BACK_TC_002] Okay exits the app', () => {
    setup();
    pressBack();
    fireEvent.press(screen.getByTestId('exit-okay'));
    expect(BackHandler.exitApp).toHaveBeenCalledTimes(1);
  });

  // Covers: HOME_BACK_TC_003 — CANCEL keeps the user on Home
  it('[HOME_BACK_TC_003] CANCEL closes the dialog and does not exit', () => {
    setup();
    pressBack();
    fireEvent.press(screen.getByTestId('exit-cancel'));
    expect(screen.queryByText('Are you sure you want to exit!')).toBeNull();
    expect(BackHandler.exitApp).not.toHaveBeenCalled();
  });

  // Covers: HOME_BACK_TC_004 — back closes the popup before the exit dialog
  it('[HOME_BACK_TC_004] first back closes the popup only, second back shows the exit dialog', () => {
    setup();
    fireEvent.press(tile('Contact Us'));
    pressBack();
    expect(screen.queryByText('We are here to help!')).toBeNull();
    expect(screen.queryByText('Are you sure you want to exit!')).toBeNull();
    pressBack();
    expect(screen.getByText('Are you sure you want to exit!')).toBeTruthy();
  });

  it('does not intercept back on iOS and removes the listener on unmount', () => {
    setPlatformOS('ios');
    const { unmount } = setup();
    expect(backHandlers).toHaveLength(0);
    unmount();
    setPlatformOS('android');
    const second = setup();
    expect(backHandlers).toHaveLength(1);
    second.unmount();
    expect(backHandlers).toHaveLength(0);
  });

  it('stops intercepting back while Home is blurred', () => {
    const { emit } = setup();
    emit('blur');
    expect(backHandlers).toHaveLength(0);
    emit('focus');
    expect(backHandlers).toHaveLength(1);
  });
});

describe('state reset on focus', () => {
  function dirtyState(store: ReturnType<typeof createAppStore>) {
    store.dispatch(setOffersForm({ fullName: 'A B', mobileNo: '9999999999', tncAccepted: true }));
    store.dispatch(setSelectedOffer({ id: 7 }));
    store.dispatch(setRegisterNowReturnScreen('changePassword'));
  }

  // Covers: HOME_STATE_TC_001 — stale flags reset on Home entry
  it('[HOME_STATE_TC_001] resets leftover state when Home is entered', () => {
    const { store } = setup({ prepare: dirtyState });
    expect(store.getState().offers.form).toEqual({ fullName: '', mobileNo: '', tncAccepted: false });
    expect(store.getState().offers.selectedOffer).toBeNull();
    expect(store.getState().sessionFlags.registerNowReturnScreen).toBeNull();
  });

  // Covers: HOME_RESET_TC_001 — offers form cleared on return
  // Covers: HOME_RESET_TC_002 — selected offer cleared on return
  // Covers: HOME_RESET_TC_003 — register return flag cleared on return
  // Covers: HOME_RESET_TC_004 — Offers fail screen Ok returns to Home with reset state
  it('[HOME_RESET_TC_001] clears offers form, selected offer and register flag on every focus', () => {
    const { store, emit } = setup();
    dirtyState(store);
    emit('focus');
    expect(store.getState().offers.form).toEqual({ fullName: '', mobileNo: '', tncAccepted: false });
    expect(store.getState().offers.selectedOffer).toBeNull();
    expect(store.getState().sessionFlags.registerNowReturnScreen).toBeNull();
    dirtyState(store);
    emit('focus');
    expect(store.getState().offers.selectedOffer).toBeNull();
  });

  // Covers: HOME_RESET_TC_005 — focus reset does not clear FAQ cache or token
  it('[HOME_RESET_TC_005] leaves the FAQ cache and the token untouched', () => {
    const { store, emit } = setup({ faqCache: true });
    store.dispatch(setNonLoggedToken('keep-me'));
    emit('focus');
    expect(store.getState().faq.items).toHaveLength(1);
    expect(store.getState().token.nonLoggedToken).toBe('keep-me');
  });
});

describe('version gate', () => {
  // Covers: HOME_VER_TC_001 — up to date, no dialog
  it('[HOME_VER_TC_001] shows no dialog and Home stays usable when up to date', async () => {
    setup();
    await act(async () => undefined);
    expect(screen.queryByTestId('version-dialog')).toBeNull();
    expect(screen.getAllByRole('button')).toHaveLength(7);
  });

  // Covers: HOME_VER_TC_002 — maintenance dialog with Exit on Android, not dismissable
  // Covers: HOME_VER_TC_012 — blocking dialog cannot be dismissed by Android back
  it('[HOME_VER_TC_002] shows the maintenance message with Exit and ignores Android back', async () => {
    (checkAppVersion as jest.Mock).mockResolvedValue({ kind: 'maintenance', message: 'Back at 6 PM' });
    setup();
    expect(await screen.findByText('Back at 6 PM')).toBeTruthy();
    expect(screen.getByTestId('version-exit')).toBeTruthy();
    pressBack();
    expect(screen.getByText('Back at 6 PM')).toBeTruthy();
    expect(screen.queryByText('Are you sure you want to exit!')).toBeNull();
    fireEvent.press(screen.getByTestId('version-exit'));
    expect(BackHandler.exitApp).toHaveBeenCalledTimes(1);
  });

  // Covers: HOME_VER_TC_003 — mandatory update dialog with Update and Exit
  // Covers: HOME_VER_TC_004 — Update opens the store link
  it('[HOME_VER_TC_003] shows the mandatory dialog and Update opens target_url', async () => {
    (checkAppVersion as jest.Mock).mockResolvedValue({
      kind: 'mandatory',
      targetUrl: 'https://store.example/app',
    });
    setup();
    expect(
      await screen.findByText('Update your app to experience all the latest features.'),
    ).toBeTruthy();
    expect(screen.getByTestId('version-exit')).toBeTruthy();
    fireEvent.press(screen.getByTestId('version-update'));
    expect(Linking.openURL).toHaveBeenCalledWith('https://store.example/app');
  });

  // Covers: HOME_VER_TC_011 — iOS has no Exit button on blocking dialogs
  it('[HOME_VER_TC_011] hides Exit on iOS for the mandatory dialog', async () => {
    setPlatformOS('ios');
    (checkAppVersion as jest.Mock).mockResolvedValue({
      kind: 'mandatory',
      targetUrl: 'https://store.example/app',
    });
    setup();
    await screen.findByText('Update your app to experience all the latest features.');
    expect(screen.queryByTestId('version-exit')).toBeNull();
    expect(screen.getByTestId('version-update')).toBeTruthy();
  });

  // Covers: HOME_VER_TC_005 — optional update dialog can be dismissed (Update + Skip)
  // Covers: NLMISC_TC_016 — optional update skipped, Home stays usable
  it('[HOME_VER_TC_005] shows Update and Skip, and Skip dismisses the dialog', async () => {
    (checkAppVersion as jest.Mock).mockResolvedValue({
      kind: 'optional',
      targetUrl: 'https://store.example/app',
    });
    setup();
    await screen.findByTestId('version-skip');
    expect(screen.getByTestId('version-update')).toBeTruthy();
    fireEvent.press(screen.getByTestId('version-skip'));
    expect(screen.queryByTestId('version-dialog')).toBeNull();
  });

  // Covers: HOME_VER_TC_008 — 401 shows the server message, Okay runs logout
  it('[HOME_VER_TC_008] shows the 401 message and Okay runs logout', async () => {
    (checkAppVersion as jest.Mock).mockResolvedValue({
      kind: 'sessionExpired',
      message: 'Session expired',
    });
    setup();
    expect(await screen.findByText('Session expired')).toBeTruthy();
    fireEvent.press(screen.getByTestId('version-okay'));
    expect(logout).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Session expired')).toBeNull();
  });

  // Covers: HOME_VER_TC_009 — a failed version call fails open
  it('[HOME_VER_TC_009] shows no dialog when the version call rejects', async () => {
    (checkAppVersion as jest.Mock).mockRejectedValue(new Error('down'));
    setup();
    await act(async () => undefined);
    await waitFor(() => expect(screen.queryByTestId('version-dialog')).toBeNull());
  });
});
