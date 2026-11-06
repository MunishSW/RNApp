import React from 'react';
import { AccessibilityInfo, BackHandler, Dimensions, Image, StatusBar, StyleSheet } from 'react-native';
import { restorePlatformOS, setPlatformOS } from '../../../testUtils/platform';
import { act, fireEvent, render, screen, within } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { requestNonLoggedToken } from '../../../services/authService';
import { fetchFaq } from '../../../services/faqService';
import { checkAppVersion } from '../../../services/versionService';
import { createAppStore } from '../../../store';
import { setSelectedOffer } from '../../../store/offersSlice';
import { setRegisterNowReturnScreen } from '../../../store/sessionFlagsSlice';
import { themes } from '../../../theme/tokens';
import NonLoggedInHomeScreen from '../NonLoggedInHomeScreen';

jest.mock('../../../services/authService', () => ({ requestNonLoggedToken: jest.fn() }));
jest.mock('../../../services/versionService', () => ({ checkAppVersion: jest.fn() }));
jest.mock('../../../services/faqService', () => ({ fetchFaq: jest.fn() }));
jest.mock('../../../services/sessionService', () => ({ logout: jest.fn().mockResolvedValue(undefined) }));

type ScreenProps = React.ComponentProps<typeof NonLoggedInHomeScreen>;

function setup() {
  const store = createAppStore();
  const listeners: Record<string, Array<() => void>> = {};
  const navigation = {
    navigate: jest.fn(),
    addListener: jest.fn((type: string, cb: () => void) => {
      (listeners[type] = listeners[type] || []).push(cb);
      return () => undefined;
    }),
  };
  const props = {
    navigation,
    route: { key: 'home', name: 'NonLoggedInHome' },
  } as unknown as ScreenProps;
  const utils = render(
    <Provider store={store}>
      <NonLoggedInHomeScreen {...props} />
    </Provider>,
  );
  return { ...utils, navigation, store, emit: (t: string) => act(() => (listeners[t] || []).forEach(cb => cb())) };
}

let backHandlers: Array<() => boolean> = [];

beforeEach(() => {
  setPlatformOS('android');
  backHandlers = [];
  jest.spyOn(BackHandler, 'addEventListener').mockImplementation((_event, handler) => {
    backHandlers.push(handler as () => boolean);
    return {
      remove: () => {
        backHandlers = backHandlers.filter(h => h !== handler);
      },
    };
  });
  jest.spyOn(BackHandler, 'exitApp').mockImplementation(() => undefined);
  (requestNonLoggedToken as jest.Mock).mockReset();
  (requestNonLoggedToken as jest.Mock).mockResolvedValue('token');
  (fetchFaq as jest.Mock).mockReset();
  (checkAppVersion as jest.Mock).mockReset();
  (checkAppVersion as jest.Mock).mockResolvedValue({ kind: 'none' });
});

afterEach(() => {
  restorePlatformOS();
  jest.restoreAllMocks();
});

const pressBack = () => act(() => backHandlers[backHandlers.length - 1]());

describe('NonLoggedInHomeScreen (US1)', () => {
  // Covers: HOME_LAYOUT_TC_001, HOME_LAYOUT_TC_002 - illustration, 3-line headline, six tiles in the fixed order and Login are shown (FR-001 to FR-003, FR-010, FR-020, P-01)
  it('[HOME_LAYOUT_TC_001] shows the illustration, the headline, six tiles in order and Login', () => {
    setup();
    expect(screen.getByTestId('home-illustration', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.getByTestId('home-headline').props.children).toBe(
      'Login to download account statements,\nmake payments, and manage your\naccount, on the go!',
    );
    expect(screen.getAllByRole('button').map(b => b.props.accessibilityLabel)).toEqual([
      'Pay Now',
      'Our Products',
      'Track Application',
      'FAQs',
      'Offers',
      'Contact Us',
      'Login',
    ]);
  });

  // page background token, light status bar, Rubik Regular 16 / 22 headline (FR-001, FR-004)
  it('uses the brand page colour, a light status bar and the Figma headline style', () => {
    const { UNSAFE_getByType } = setup();
    const bar = UNSAFE_getByType(StatusBar);
    expect(bar.props.barStyle).toBe('light-content');
        const headline = StyleSheet.flatten(screen.getByTestId('home-headline').props.style);
    expect(headline.fontFamily).toBe('Rubik-Regular');
    expect(headline.fontSize).toBe(16);
    expect(headline.lineHeight).toBe(22);
    expect(headline.textAlign).toBe('center');
    expect(headline.color).toBe(themes.light.textOnPage);
  });

  // illustration block 311 x 310 with padding 22 / 14, art 172 x 140 (FR-002)
  it('lays out the illustration with the Figma sizes', () => {
    setup();
    const art = StyleSheet.flatten(
      screen.getByTestId('home-illustration', { includeHiddenElements: true }).props.style,
    );
    expect(art.width).toBe(172);
    expect(art.height).toBe(140);
    expect(screen.UNSAFE_getAllByType(Image).length).toBeGreaterThanOrEqual(7);
  });

  // Covers: HOME_LAYOUT_TC_001 - no Register Now, chatbot or accessibility entry (FR-024)
  it('[HOME_LAYOUT_TC_001] has no Register Now button, chatbot or accessibility icon', () => {
    setup();
    expect(screen.queryByText(/register/i)).toBeNull();
    expect(screen.queryByLabelText(/register/i)).toBeNull();
    expect(screen.queryByLabelText(/chat/i)).toBeNull();
    expect(screen.queryByLabelText(/accessib/i)).toBeNull();
  });

  // Covers: HOME_ACTION_TC_007 - Login opens the Login screen (FR-021, P-02)
  it('[HOME_ACTION_TC_007] opens the Login screen from "Login"', () => {
    const { navigation } = setup();
    fireEvent.press(screen.getByRole('button', { name: 'Login' }));
    expect(navigation.navigate).toHaveBeenCalledWith('LoginScreen', undefined);
  });

  // Covers: HOME_LAYOUT_TC_003 - one token request on mount; Home draws while it is pending (FR-025, FR-007, BR-2, P-09)
  it('[HOME_LAYOUT_TC_003] draws at once while the token request is pending and requests it once on mount', () => {
    (requestNonLoggedToken as jest.Mock).mockReturnValue(new Promise(() => undefined));
    setup();
    expect(requestNonLoggedToken).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Login' })).toBeTruthy();
  });

  // Covers: HOME_STATE_TC_003, HOME_TOKEN_TC_002 - a rejected token request is swallowed (FR-030, N-01)
  it('[HOME_STATE_TC_003] stays usable when the token request rejects', async () => {
    (requestNonLoggedToken as jest.Mock).mockRejectedValue(new Error('timeout'));
    setup();
    await act(async () => undefined);
    expect(screen.getByRole('button', { name: 'Login' })).toBeTruthy();
  });

  // Covers: HOME_NET_TC_005 - one destination for rapid taps on different tiles (FR-019, E-14)
  it('[HOME_NET_TC_005] opens one destination for rapid taps on different tiles', () => {
    const { navigation } = setup();
    fireEvent.press(screen.getByRole('button', { name: 'Offers' }));
    fireEvent.press(screen.getByRole('button', { name: 'Our Products' }));
    fireEvent.press(screen.getByRole('button', { name: 'Login' }));
    expect(navigation.navigate).toHaveBeenCalledTimes(1);
  });

  // the page scrolls and hides its indicator (FR-005, E-01)
  it('scrolls with the indicator hidden', () => {
    setup();
    const scroll = screen.getByTestId('home-scroll');
    expect(scroll.props.showsVerticalScrollIndicator).toBe(false);
  });

  // Covers: HOME_VER_TC_003 - the mandatory dialog appears on top of a drawn Home (FR-049, FR-053, N-07)
  it('[HOME_VER_TC_003] shows the mandatory update dialog on top of Home after the answer arrives', async () => {
    (checkAppVersion as jest.Mock).mockResolvedValue({ kind: 'mandatory', targetUrl: 'https://store.example.test/a' });
    setup();
    expect(screen.getByRole('button', { name: 'Login' })).toBeTruthy();
    expect(await screen.findByText('Update your app to experience all the latest features.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Update' })).toBeTruthy();
  });

  // a 401 answer shows no dialog (FR-055, N-08)
  it('shows no dialog for a session-expired version answer', async () => {
    (checkAppVersion as jest.Mock).mockResolvedValue({ kind: 'sessionExpired', message: 'expired' });
    setup();
    await act(async () => undefined);
    expect(screen.queryByText('expired')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Okay' })).toBeNull();
  });

  // Covers: HOME_ACTION_TC_004, HOME_ACTION_TC_008 - FAQs: spinner then the FAQ screen (FR-037, FR-038, P-08)
  it('[HOME_ACTION_TC_004] shows the spinner while loading the FAQs and then opens the FAQ screen', async () => {
    let release!: (items: unknown[]) => void;
    (fetchFaq as jest.Mock).mockReturnValue(new Promise(resolve => { release = resolve; }));
    const { navigation } = setup();
    fireEvent.press(screen.getByRole('button', { name: 'FAQs' }));
    expect(screen.getByTestId('loading-overlay')).toBeTruthy();
    await act(async () => {
      release([{ question: 'q', answer: 'a' }]);
    });
    expect(screen.queryByTestId('loading-overlay')).toBeNull();
    expect(navigation.navigate).toHaveBeenCalledWith('Faq', undefined);
  });

  // Covers: HOME_NEG_TC_001, HOME_FAQ_TC_007 - FAQ failure: dialog with the exact text, "Okay" closes it (FR-040, N-02)
  it('[HOME_NEG_TC_001] shows the FAQ error dialog and closes it with "Okay"', async () => {
    (fetchFaq as jest.Mock).mockRejectedValue(new Error('500'));
    setup();
    fireEvent.press(screen.getByRole('button', { name: 'FAQs' }));
    expect(
      await screen.findByText(
        'Your request could not be processed at this moment. Request you to try again after sometime.',
      ),
    ).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'Okay' }));
    expect(screen.queryByText(/could not be processed/)).toBeNull();
    expect(screen.queryByTestId('loading-overlay')).toBeNull();
  });

  // Covers: HOME_ACTION_TC_006, HOME_CONTACT_TC_002 - Contact Us opens the popup over Home with no route change (FR-017, FR-043, BR-7, P-06)
  it('[HOME_ACTION_TC_006] opens the Customer Care popup over Home and marks a non-logged user', () => {
    const { navigation, store } = setup();
    fireEvent.press(screen.getByRole('button', { name: 'Contact Us' }));
    expect(screen.getByText('We are here to help!')).toBeTruthy();
    expect(screen.getByText('022-45297300')).toBeTruthy();
    expect(store.getState().sessionFlags.isNonLoggedUser).toBe(true);
    expect(navigation.navigate).not.toHaveBeenCalled();
    fireEvent.press(screen.getByTestId('contact-popup-close'));
    expect(screen.queryByText('We are here to help!')).toBeNull();
  });

  // Covers: HOME_CONTACT_TC_005 - Find Us goes to the Branch locator (FR-045, P-06)
  it('hands "Find Us" off to the Branch locator and closes the popup', () => {
    const { navigation } = setup();
    fireEvent.press(screen.getByRole('button', { name: 'Contact Us' }));
    fireEvent.press(screen.getByTestId('contact-row-find'));
    expect(navigation.navigate).toHaveBeenCalledWith('BranchLocator');
    expect(screen.queryByText('We are here to help!')).toBeNull();
  });

  // Covers: HOME_RESET_TC_002, HOME_RESET_TC_003 - every focus resets the leftover state (FR-062 to FR-064, BR-11, P-13, E-10)
  it('[HOME_RESET_TC_002] clears the selected offer and the register return flag when Home regains focus', () => {
    const { store, emit } = setup();
    store.dispatch(setSelectedOffer({ id: 1 }));
    store.dispatch(setRegisterNowReturnScreen('changePassword'));
    emit('focus');
    expect(store.getState().offers.selectedOffer).toBeNull();
    expect(store.getState().sessionFlags.registerNowReturnScreen).toBeNull();
  });

  // Pay Now opens its own screen (FR-014, P-03)
  it('opens the Pay Now screen from the "Pay Now" tile', () => {
    const { navigation } = setup();
    fireEvent.press(screen.getByRole('button', { name: 'Pay Now' }));
    expect(navigation.navigate).toHaveBeenCalledWith('NonLoggedInPayNow', { title: 'Pay Now' });
  });

  // Covers: HOME_BACK_TC_001, HOME_BACK_TC_002, HOME_BACK_TC_003 - Android back asks, CANCEL stays, Okay exits (FR-058, FR-059, P-11, P-12)
  it('[HOME_BACK_TC_001] shows the exit dialog on Android back; CANCEL stays and Okay exits', () => {
    setup();
    pressBack();
    expect(screen.getByText('Are you sure you want to exit!')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'CANCEL' }));
    expect(screen.queryByText('Are you sure you want to exit!')).toBeNull();
    pressBack();
    fireEvent.press(screen.getByRole('button', { name: 'Okay' }));
    expect(BackHandler.exitApp).toHaveBeenCalledTimes(1);
  });

  // Covers: HOME_BACK_TC_004 - an open popup closes first; the next back shows the exit dialog (FR-060, BR-10, E-11)
  it('[HOME_BACK_TC_004] closes the Contact Us popup first and shows the exit dialog on the second back', () => {
    setup();
    fireEvent.press(screen.getByRole('button', { name: 'Contact Us' }));
    expect(screen.getByText('We are here to help!')).toBeTruthy();
    pressBack();
    expect(screen.queryByText('We are here to help!')).toBeNull();
    expect(screen.queryByText('Are you sure you want to exit!')).toBeNull();
    pressBack();
    expect(screen.getByText('Are you sure you want to exit!')).toBeTruthy();
  });
});

const FAQ_ERROR = 'Your request could not be processed at this moment. Request you to try again after sometime.';

describe('NonLoggedInHomeScreen (QA acceptance cases)', () => {
  // Covers: HOME_LAYOUT_TC_001 - the page paints the brand-blue token and shows the tiles as 3 + 3 above Login
  it('[HOME_LAYOUT_TC_001] paints the brand-blue page and lays the tiles out three per row', () => {
    // The jest default window has fontScale 2, which stacks the grid; the 3 + 3 layout is the default text size
    const original = Dimensions.get('window');
    const reference = { width: 360, height: 812, scale: 3, fontScale: 1 };
    act(() => {
      Dimensions.set({ window: reference, screen: reference });
    });
    try {
      setup();
      const page = StyleSheet.flatten(screen.root!.props.style);
      expect(page.backgroundColor).toBe(themes.light.pageBackground);
      expect(page.backgroundColor).toBe('#035795');
      expect(within(screen.getByTestId('home-grid-row-1')).getAllByRole('button')).toHaveLength(3);
      expect(within(screen.getByTestId('home-grid-row-2')).getAllByRole('button')).toHaveLength(3);
    } finally {
      act(() => {
        Dimensions.set({ window: original, screen: original });
      });
    }
  });

  // Covers: HOME_LAYOUT_TC_003 - with the token and version calls both pending, Home shows no loader or dialog and Login works
  it('[HOME_LAYOUT_TC_003] draws and stays tappable while the token and version calls are pending', () => {
    (requestNonLoggedToken as jest.Mock).mockReturnValue(new Promise(() => undefined));
    (checkAppVersion as jest.Mock).mockReturnValue(new Promise(() => undefined));
    const { navigation } = setup();
    expect(screen.queryByTestId('loading-overlay')).toBeNull();
    expect(screen.queryByTestId('version-dialog')).toBeNull();
    fireEvent.press(screen.getByRole('button', { name: 'Login' }));
    expect(navigation.navigate).toHaveBeenCalledWith('LoginScreen', undefined);
  });

  // Covers: HOME_STATE_TC_002 - after a successful token request all six tiles and Login are present, enabled and working
  it('[HOME_STATE_TC_002] keeps every quick action available after the token request succeeds', async () => {
    const { navigation } = setup();
    await act(async () => undefined);
    expect(requestNonLoggedToken).toHaveBeenCalledTimes(1);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(7);
    buttons.forEach(b => expect(b.props.accessibilityState?.disabled).not.toBe(true));
    fireEvent.press(screen.getByRole('button', { name: 'Offers' }));
    expect(navigation.navigate).toHaveBeenCalledWith('Offers', undefined);
  });

  // Covers: HOME_STATE_TC_003 - a failed token request shows no error, no loader and leaves all seven buttons in place
  it('[HOME_STATE_TC_003] shows no error and keeps Home usable when the token request fails', async () => {
    (requestNonLoggedToken as jest.Mock).mockRejectedValue(new Error('timeout'));
    setup();
    await act(async () => undefined);
    expect(screen.queryByText(/could not be processed/)).toBeNull();
    expect(screen.queryByRole('button', { name: 'Okay' })).toBeNull();
    expect(screen.queryByTestId('loading-overlay')).toBeNull();
    expect(screen.getAllByRole('button')).toHaveLength(7);
  });

  // Covers: HOME_TOKEN_TC_005 - a failed token request does not stop the FAQ call; its failure shows the error dialog
  it('[HOME_TOKEN_TC_005] shows the FAQ error dialog when the FAQ call fails after a failed token request', async () => {
    (requestNonLoggedToken as jest.Mock).mockRejectedValue(new Error('timeout'));
    (fetchFaq as jest.Mock).mockRejectedValue(new Error('Request failed with status code 401'));
    setup();
    await act(async () => undefined);
    fireEvent.press(screen.getByRole('button', { name: 'FAQs' }));
    expect(await screen.findByText(FAQ_ERROR)).toBeTruthy();
    expect(fetchFaq).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('loading-overlay')).toBeNull();
  });

  // Covers: HOME_CONTACT_TC_006 - rapid Contact Us taps leave exactly one popup instance
  it('[HOME_CONTACT_TC_006] opens only one popup on rapid Contact Us taps', () => {
    setup();
    const tile = screen.getByRole('button', { name: 'Contact Us' });
    fireEvent.press(tile);
    fireEvent.press(tile);
    fireEvent.press(tile);
    expect(screen.getAllByText('We are here to help!')).toHaveLength(1);
    fireEvent.press(screen.getByTestId('contact-popup-close'));
    expect(screen.queryByText('We are here to help!')).toBeNull();
  });

  // Covers: HOME_FAQ_TC_006 - "Okay" closes the FAQ error dialog and the user is still on Home (no navigation)
  it('[HOME_FAQ_TC_006] keeps the user on Home when "Okay" closes the FAQ error dialog', async () => {
    (fetchFaq as jest.Mock).mockRejectedValue(new Error('500'));
    const { navigation } = setup();
    fireEvent.press(screen.getByRole('button', { name: 'FAQs' }));
    await screen.findByText(FAQ_ERROR);
    fireEvent.press(screen.getByRole('button', { name: 'Okay' }));
    expect(screen.queryByText(FAQ_ERROR)).toBeNull();
    expect(navigation.navigate).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Login' })).toBeTruthy();
  });

  // Covers: HOME_NET_TC_001 - with every background call failing offline, Home renders fully and local tiles still open
  it('[HOME_NET_TC_001] renders fully and opens local destinations with no network', async () => {
    const offline = new Error('Network Error');
    (requestNonLoggedToken as jest.Mock).mockRejectedValue(offline);
    (checkAppVersion as jest.Mock).mockRejectedValue(offline);
    const { navigation } = setup();
    await act(async () => undefined);
    expect(screen.getAllByRole('button')).toHaveLength(7);
    expect(screen.getByTestId('home-illustration', { includeHiddenElements: true })).toBeTruthy();
    expect(screen.queryByText(/could not be processed/)).toBeNull();
    fireEvent.press(screen.getByRole('button', { name: 'Offers' }));
    expect(navigation.navigate).toHaveBeenCalledWith('Offers', undefined);
  });

  // Covers: HOME_NET_TC_002 - FAQs with no network shows the error dialog and the spinner clears
  it('[HOME_NET_TC_002] shows the error dialog and clears the spinner when FAQs is tapped with no network', async () => {
    (fetchFaq as jest.Mock).mockRejectedValue(new Error('Network Error'));
    setup();
    fireEvent.press(screen.getByRole('button', { name: 'FAQs' }));
    expect(await screen.findByText(FAQ_ERROR)).toBeTruthy();
    expect(screen.queryByTestId('loading-overlay')).toBeNull();
  });

  // Covers: HOME_NET_TC_004 - the network drops while the FAQ request is in flight: spinner clears, error dialog shows
  it('[HOME_NET_TC_004] clears the spinner and shows the error dialog when the network drops mid FAQ fetch', async () => {
    let fail!: (reason: Error) => void;
    (fetchFaq as jest.Mock).mockReturnValue(new Promise((_resolve, reject) => { fail = reject; }));
    const { navigation } = setup();
    fireEvent.press(screen.getByRole('button', { name: 'FAQs' }));
    expect(screen.getByTestId('loading-overlay')).toBeTruthy();
    await act(async () => {
      fail(new Error('Network Error'));
    });
    expect(screen.queryByTestId('loading-overlay')).toBeNull();
    expect(screen.getByText(FAQ_ERROR)).toBeTruthy();
    expect(navigation.navigate).not.toHaveBeenCalled();
  });

  // Covers: HOME_NET_TC_007 - on a 320 x 568 screen Login sits inside the scrolling content with no fixed height
  it('[HOME_NET_TC_007] keeps Login inside the scrolling content on a 320 x 568 screen', () => {
    const original = Dimensions.get('window');
    const small = { width: 320, height: 568, scale: 2, fontScale: 1 };
    act(() => {
      Dimensions.set({ window: small, screen: small });
    });
    try {
      setup();
      const scroll = screen.getByTestId('home-scroll');
      expect(within(scroll).getByRole('button', { name: 'Login' })).toBeTruthy();
      expect(scroll.props.showsVerticalScrollIndicator).toBe(false);
      expect(StyleSheet.flatten(scroll.props.contentContainerStyle).height).toBeUndefined();
    } finally {
      act(() => {
        Dimensions.set({ window: original, screen: original });
      });
    }
  });

  // Covers: HOME_CONTACT_TC_003 - closing the popup moves accessibility focus to the node of the Contact Us tile
  it('[HOME_CONTACT_TC_003] returns accessibility focus to the Contact Us tile when the popup closes', () => {
    const handles: Array<{ props?: { accessibilityLabel?: string } } | null> = [];
    jest.spyOn(require('react-native'), 'findNodeHandle').mockImplementation((node: unknown) => {
      handles.push(node as { props?: { accessibilityLabel?: string } } | null);
      return node ? 42 : null;
    });
    const focus = jest.spyOn(AccessibilityInfo, 'setAccessibilityFocus').mockImplementation(() => undefined);
    setup();
    fireEvent.press(screen.getByRole('button', { name: 'Contact Us' }));
    fireEvent.press(screen.getByTestId('contact-popup-close'));
    expect(focus).toHaveBeenCalledWith(42);
    expect(handles[handles.length - 1]?.props?.accessibilityLabel).toBe('Contact Us');
  });
});
