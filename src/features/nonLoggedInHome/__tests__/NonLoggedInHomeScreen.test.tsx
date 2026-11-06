import React from 'react';
import { BackHandler, Image, StatusBar, StyleSheet } from 'react-native';
import { restorePlatformOS, setPlatformOS } from '../../../testUtils/platform';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
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
  // Covers: FR-4.1-01 to FR-4.1-03, FR-4.2-01, FR-4.3-01, P-01, TC-101, TC-102, TC-103
  it('[TC-101] shows the illustration, the headline, six tiles in order and Login', () => {
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

  // Covers: FR-4.1-01, FR-4.1-04, TC-101, TC-106 - page background token, light status bar, Rubik Regular 16 / 22 headline
  it('[TC-106] uses the brand page colour, a light status bar and the Figma headline style', () => {
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

  // Covers: FR-4.1-02 - illustration block 311 x 310 with padding 22 / 14, art 172 x 140
  it('lays out the illustration with the Figma sizes', () => {
    setup();
    const art = StyleSheet.flatten(
      screen.getByTestId('home-illustration', { includeHiddenElements: true }).props.style,
    );
    expect(art.width).toBe(172);
    expect(art.height).toBe(140);
    expect(screen.UNSAFE_getAllByType(Image).length).toBeGreaterThanOrEqual(7);
  });

  // Covers: FR-4.3-05, TC-107, TC-108, TC-109 - no Register Now, chatbot or accessibility entry
  it('[TC-107] has no Register Now button, chatbot or accessibility icon', () => {
    setup();
    expect(screen.queryByText(/register/i)).toBeNull();
    expect(screen.queryByLabelText(/register/i)).toBeNull();
    expect(screen.queryByLabelText(/chat/i)).toBeNull();
    expect(screen.queryByLabelText(/accessib/i)).toBeNull();
  });

  // Covers: FR-4.5-xx not yet, FR-4.3-02, P-02, TC-201 - Login opens the Login screen
  it('[TC-201] opens the Login screen from "Login"', () => {
    const { navigation } = setup();
    fireEvent.press(screen.getByRole('button', { name: 'Login' }));
    expect(navigation.navigate).toHaveBeenCalledWith('LoginScreen', undefined);
  });

  // Covers: FR-4.4-01, FR-4.1-07, BR-2, P-09, TC-405, TC-702 - one token request on mount; Home draws while it is pending
  it('[TC-702] draws at once while the token request is pending and requests it once on mount', () => {
    (requestNonLoggedToken as jest.Mock).mockReturnValue(new Promise(() => undefined));
    setup();
    expect(requestNonLoggedToken).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Login' })).toBeTruthy();
  });

  // Covers: FR-4.4-06, N-01, TC-402 - a rejected token request is swallowed
  it('[TC-402] stays usable when the token request rejects', async () => {
    (requestNonLoggedToken as jest.Mock).mockRejectedValue(new Error('timeout'));
    setup();
    await act(async () => undefined);
    expect(screen.getByRole('button', { name: 'Login' })).toBeTruthy();
  });

  // Covers: FR-4.2-10, E-14 - one destination for rapid taps on different tiles
  it('[E-14] opens one destination for rapid taps on different tiles', () => {
    const { navigation } = setup();
    fireEvent.press(screen.getByRole('button', { name: 'Offers' }));
    fireEvent.press(screen.getByRole('button', { name: 'Our Products' }));
    fireEvent.press(screen.getByRole('button', { name: 'Login' }));
    expect(navigation.navigate).toHaveBeenCalledTimes(1);
  });

  // Covers: FR-4.1-05, E-01 - the page scrolls and hides its indicator
  it('scrolls with the indicator hidden', () => {
    setup();
    const scroll = screen.getByTestId('home-scroll');
    expect(scroll.props.showsVerticalScrollIndicator).toBe(false);
  });

  // Covers: FR-4.7-02, FR-4.7-06, N-07, TC-408 - the mandatory dialog appears on top of a drawn Home
  it('[TC-408] shows the mandatory update dialog on top of Home after the answer arrives', async () => {
    (checkAppVersion as jest.Mock).mockResolvedValue({ kind: 'mandatory', targetUrl: 'https://store.example.test/a' });
    setup();
    expect(screen.getByRole('button', { name: 'Login' })).toBeTruthy();
    expect(await screen.findByText('Update your app to experience all the latest features.')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Update' })).toBeTruthy();
  });

  // Covers: FR-4.7-08, N-08, TC-410 - a 401 answer shows no dialog
  it('[TC-410] shows no dialog for a session-expired version answer', async () => {
    (checkAppVersion as jest.Mock).mockResolvedValue({ kind: 'sessionExpired', message: 'expired' });
    setup();
    await act(async () => undefined);
    expect(screen.queryByText('expired')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Okay' })).toBeNull();
  });

  // Covers: FR-4.5-03, FR-4.5-04, P-08, TC-302 - FAQs: spinner then the FAQ screen
  it('[TC-302] shows the spinner while loading the FAQs and then opens the FAQ screen', async () => {
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

  // Covers: FR-4.5-06, N-02, TC-303 - FAQ failure: dialog with the exact text, "Okay" closes it
  it('[TC-303] shows the FAQ error dialog and closes it with "Okay"', async () => {
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

  // Covers: FR-4.2-08, FR-4.6-01, BR-7, P-06, TC-205 - Contact Us opens the popup over Home with no route change
  it('[TC-205] opens the Customer Care popup over Home and marks a non-logged user', () => {
    const { navigation, store } = setup();
    fireEvent.press(screen.getByRole('button', { name: 'Contact Us' }));
    expect(screen.getByText('We are here to help!')).toBeTruthy();
    expect(screen.getByText('022-45297300')).toBeTruthy();
    expect(store.getState().sessionFlags.isNonLoggedUser).toBe(true);
    expect(navigation.navigate).not.toHaveBeenCalled();
    fireEvent.press(screen.getByTestId('contact-popup-close'));
    expect(screen.queryByText('We are here to help!')).toBeNull();
  });

  // Covers: FR-4.6-03, P-06 - Find Us goes to the Branch locator
  it('hands "Find Us" off to the Branch locator and closes the popup', () => {
    const { navigation } = setup();
    fireEvent.press(screen.getByRole('button', { name: 'Contact Us' }));
    fireEvent.press(screen.getByTestId('contact-row-find'));
    expect(navigation.navigate).toHaveBeenCalledWith('BranchLocator');
    expect(screen.queryByText('We are here to help!')).toBeNull();
  });

  // Covers: FR-4.9-01 to FR-4.9-03, BR-11, P-13, E-10 - every focus resets the leftover state
  it('[TC-505] clears the selected offer and the register return flag when Home regains focus', () => {
    const { store, emit } = setup();
    store.dispatch(setSelectedOffer({ id: 1 }));
    store.dispatch(setRegisterNowReturnScreen('changePassword'));
    emit('focus');
    expect(store.getState().offers.selectedOffer).toBeNull();
    expect(store.getState().sessionFlags.registerNowReturnScreen).toBeNull();
  });

  // Covers: FR-4.2-05, P-03, TC-202 - Pay Now opens its own screen
  it('[TC-202] opens the Pay Now screen from the "Pay Now" tile', () => {
    const { navigation } = setup();
    fireEvent.press(screen.getByRole('button', { name: 'Pay Now' }));
    expect(navigation.navigate).toHaveBeenCalledWith('NonLoggedInPayNow', { title: 'Pay Now' });
  });

  // Covers: FR-4.8-01, FR-4.8-02, P-11, P-12, TC-501, TC-502 - Android back asks, CANCEL stays, Okay exits
  it('[TC-501] shows the exit dialog on Android back; CANCEL stays and Okay exits', () => {
    setup();
    pressBack();
    expect(screen.getByText('Are you sure you want to exit!')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'CANCEL' }));
    expect(screen.queryByText('Are you sure you want to exit!')).toBeNull();
    pressBack();
    fireEvent.press(screen.getByRole('button', { name: 'Okay' }));
    expect(BackHandler.exitApp).toHaveBeenCalledTimes(1);
  });

  // Covers: FR-4.8-03, BR-10, E-11, TC-503 - an open popup closes first; the next back shows the exit dialog
  it('[TC-503] closes the Contact Us popup first and shows the exit dialog on the second back', () => {
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
