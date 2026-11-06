import React from 'react';
import { AccessibilityInfo, Dimensions, StyleSheet, Text } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { fetchFaq } from '../../../services/faqService';
import { checkAppVersion } from '../../../services/versionService';
import { createAppStore } from '../../../store';
import { layout } from '../../../theme/tokens';
import NonLoggedInHomeScreen from '../NonLoggedInHomeScreen';

jest.mock('../../../services/authService', () => ({ requestNonLoggedToken: jest.fn().mockResolvedValue('t') }));
jest.mock('../../../services/versionService', () => ({ checkAppVersion: jest.fn() }));
jest.mock('../../../services/sessionService', () => ({ logout: jest.fn().mockResolvedValue(undefined) }));
jest.mock('../../../services/faqService', () => ({ fetchFaq: jest.fn() }));

type ScreenProps = React.ComponentProps<typeof NonLoggedInHomeScreen>;

const original = Dimensions.get('window');

function setFontScale(fontScale: number) {
  const window = { width: 360, height: 812, scale: 3, fontScale };
  act(() => {
    Dimensions.set({ window, screen: window });
  });
}

function setup() {
  const navigation = { navigate: jest.fn(), addListener: jest.fn(() => () => undefined) };
  const props = { navigation, route: { key: 'home', name: 'NonLoggedInHome' } } as unknown as ScreenProps;
  return render(
    <Provider store={createAppStore()}>
      <NonLoggedInHomeScreen {...props} />
    </Provider>,
  );
}

const TILE_LABELS = ['Pay Now', 'Our Products', 'Track Application', 'FAQs', 'Offers', 'Contact Us'];

beforeEach(() => {
  (checkAppVersion as jest.Mock).mockReset().mockResolvedValue({ kind: 'none' });
  (fetchFaq as jest.Mock).mockReset();
  jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
  (AccessibilityInfo.announceForAccessibility as jest.Mock).mockClear();
});

afterEach(() => {
  act(() => {
    Dimensions.set({ window: original, screen: original });
  });
  jest.restoreAllMocks();
});

describe('Home accessibility (BRD 7.4, BR-12)', () => {
  // reading order: headline, tiles row-wise, Login (FR-066, E-04)
  it('reads the headline, then the six tiles in order, then Login', () => {
    const { toJSON } = setup();
    const json = JSON.stringify(toJSON());
    const positions = [
      json.indexOf('Login to download account statements'),
      ...TILE_LABELS.map(label => json.indexOf(`"accessibilityLabel":"${label}"`)),
      json.indexOf('"accessibilityLabel":"Login"'),
    ];
    expect(positions.every(p => p >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });

  // the six tiles and Login are buttons whose label equals the visible text (FR-066)
  it('exposes the six tiles and Login as buttons labelled with their visible text', () => {
    setup();
    const buttons = screen.getAllByRole('button');
    expect(buttons.map(b => b.props.accessibilityLabel)).toEqual([...TILE_LABELS, 'Login']);
    [...TILE_LABELS, 'Login'].forEach(label => expect(screen.getByText(label)).toBeTruthy());
  });

  // the illustration and tile icons are hidden from the accessibility tree (FR-002, FR-011, E-04)
  it('hides the illustration and the six tile icons from screen readers', () => {
    const { toJSON } = setup();
    const hidden = JSON.stringify(toJSON()).split('"accessibilityElementsHidden":true').length - 1;
    expect(hidden).toBe(7);
    expect(screen.queryAllByRole('image')).toHaveLength(0);
  });

  // every touch target is at least 44 x 44 (FR-069)
  it('gives every tile and the Login button a 44 x 44 touch target', () => {
    setFontScale(1);
    setup();
    TILE_LABELS.forEach(label => {
      const style = StyleSheet.flatten(screen.getByRole('button', { name: label }).props.style);
      expect(style.minHeight).toBeGreaterThanOrEqual(44);
      expect(Math.max(style.minWidth ?? 0, style.width ?? 0)).toBeGreaterThanOrEqual(44);
    });
    const login = screen.getByRole('button', { name: 'Login' });
    const slop = login.props.hitSlop as { top: number; bottom: number };
    expect(layout.ctaHeight + slop.top + slop.bottom).toBeGreaterThanOrEqual(44);
  });

  // at font scale 1.5 and 2 the tiles stack and nothing is fixed-height (FR-012, E-01)
  it.each([1.5, 2])('stacks the tiles at font scale %s with no fixed text heights', scale => {
    setFontScale(scale);
    setup();
    expect(screen.queryByTestId('home-grid-row-1')).toBeNull();
    expect(screen.getAllByRole('button')).toHaveLength(7);
    screen.UNSAFE_getAllByType(Text).forEach(node => {
      const style = StyleSheet.flatten(node.props.style) ?? {};
      expect(style.height).toBeUndefined();
      expect(style.maxHeight).toBeUndefined();
      expect(node.props.numberOfLines).toBeUndefined();
    });
    expect(screen.getByTestId('home-scroll')).toBeTruthy();
  });

  // at default settings the grid is the exact Figma layout (FR-012)
  it('keeps the 3 + 3 Figma grid at font scale 1', () => {
    setFontScale(1);
    setup();
    expect(screen.getByTestId('home-grid-row-1')).toBeTruthy();
    expect(screen.getByTestId('home-grid-row-2')).toBeTruthy();
  });

  // the FAQ spinner and the failure dialog are announced (FR-042, E-04)
  it('announces the FAQ spinner and the failure dialog', async () => {
    (fetchFaq as jest.Mock).mockRejectedValue(new Error('500'));
    setup();
    fireEvent.press(screen.getByRole('button', { name: 'FAQs' }));
    await screen.findByText(/could not be processed/);
    const announced = (AccessibilityInfo.announceForAccessibility as jest.Mock).mock.calls.map(c => c[0]);
    expect(announced).toContain('Loading');
    expect(announced).toContain(
      'Your request could not be processed at this moment. Request you to try again after sometime.',
    );
  });

  // the popup is modal for screen readers (FR-044)
  it('makes the Contact Us popup modal for screen readers', () => {
    setup();
    fireEvent.press(screen.getByRole('button', { name: 'Contact Us' }));
    expect(screen.getByTestId('contact-popup').props.accessibilityViewIsModal).toBe(true);
  });
});
