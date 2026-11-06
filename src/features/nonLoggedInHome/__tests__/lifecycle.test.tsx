import React from 'react';
import { BackHandler } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { restorePlatformOS, setPlatformOS } from '../../../testUtils/platform';
import { createAppStore } from '../../../store';
import NonLoggedInHomeScreen from '../NonLoggedInHomeScreen';

jest.mock('../../../services/authService', () => ({ requestNonLoggedToken: jest.fn().mockResolvedValue('t') }));
jest.mock('../../../services/versionService', () => ({
  checkAppVersion: jest.fn().mockResolvedValue({ kind: 'none' }),
}));
jest.mock('../../../services/sessionService', () => ({ logout: jest.fn().mockResolvedValue(undefined) }));
jest.mock('../../../services/faqService', () => ({ fetchFaq: jest.fn().mockResolvedValue([]) }));

type ScreenProps = React.ComponentProps<typeof NonLoggedInHomeScreen>;

let backAdded = 0;
let backRemoved = 0;
let navAdded = 0;
let navRemoved = 0;

function mount() {
  const navigation = {
    navigate: jest.fn(),
    addListener: jest.fn(() => {
      navAdded += 1;
      return () => {
        navRemoved += 1;
      };
    }),
  };
  const props = { navigation, route: { key: 'home', name: 'NonLoggedInHome' } } as unknown as ScreenProps;
  return render(
    <Provider store={createAppStore()}>
      <NonLoggedInHomeScreen {...props} />
    </Provider>,
  );
}

beforeEach(() => {
  setPlatformOS('android');
  backAdded = 0;
  backRemoved = 0;
  navAdded = 0;
  navRemoved = 0;
  jest.spyOn(BackHandler, 'addEventListener').mockImplementation(() => {
    backAdded += 1;
    return {
      remove: () => {
        backRemoved += 1;
      },
    };
  });
});

afterEach(() => {
  restorePlatformOS();
  jest.restoreAllMocks();
});

describe('lifecycle and cleanup (PERF-5, constitution VIII)', () => {
  // Covers: HOME_NET_TC_010 - 50 mount and unmount cycles leave no listener behind (PERF-5)
  it('[HOME_NET_TC_010] leaves no back or navigation listener after 50 mount and unmount cycles', async () => {
    for (let i = 0; i < 50; i += 1) {
      const view = mount();
      await act(async () => undefined);
      view.unmount();
    }
    expect(backAdded).toBeGreaterThan(0);
    expect(backRemoved).toBe(backAdded);
    expect(navAdded).toBeGreaterThan(0);
    expect(navRemoved).toBe(navAdded);
  });

  // opening and closing the popup 50 times does not add listeners that stay (PERF-5)
  it('keeps the live listener count steady while the popup opens and closes 50 times', async () => {
    const view = mount();
    await act(async () => undefined);
    const liveBack = () => backAdded - backRemoved;
    const baseline = liveBack();
    for (let i = 0; i < 50; i += 1) {
      fireEvent.press(screen.getByRole('button', { name: 'Contact Us' }));
      fireEvent.press(screen.getByTestId('contact-popup-close'));
    }
    expect(liveBack()).toBe(baseline);
    view.unmount();
    expect(backRemoved).toBe(backAdded);
  });
});
