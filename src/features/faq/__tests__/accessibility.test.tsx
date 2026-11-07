import React from 'react';
import { AccessibilityInfo, BackHandler, StyleSheet } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { fetchFaq } from '../../../services/faqService';
import { createAppStore } from '../../../store';
import { setFaqItems } from '../../../store/faqSlice';
import FaqScreen from '../FaqScreen';

jest.mock('../../../services/faqService', () => ({ fetchFaq: jest.fn() }));

const mockFetch = fetchFaq as jest.Mock;
type ScreenProps = React.ComponentProps<typeof FaqScreen>;

const ERROR =
  'Your request could not be processed at this moment. Request you to try again after sometime.';
const ITEMS = [
  { question: 'First question', answer: 'First answer' },
  { question: 'Second question', answer: 'Second answer' },
];

function setup(stored?: typeof ITEMS) {
  const store = createAppStore();
  if (stored) {
    store.dispatch(setFaqItems(stored));
  }
  const navigation = {
    navigate: jest.fn(),
    addListener: jest.fn(() => () => undefined),
  };
  const props = { navigation, route: { key: 'faq', name: 'Faq' } } as unknown as ScreenProps;
  return render(
    <Provider store={store}>
      <FaqScreen {...props} />
    </Provider>,
  );
}

type Json = { props?: Record<string, unknown>; children?: Array<Json | string> | null };

/** Accessibility roles in tree order, so the reading order can be asserted. */
function rolesInOrder(node: Json | Json[] | null, out: string[] = []): string[] {
  if (!node) {
    return out;
  }
  if (Array.isArray(node)) {
    node.forEach(n => rolesInOrder(n, out));
    return out;
  }
  const role = node.props?.accessibilityRole as string | undefined;
  if (role === 'header' || role === 'button') {
    out.push(role);
  }
  (node.children ?? []).forEach(child => {
    if (typeof child !== 'string') {
      rolesInOrder(child, out);
    }
  });
  return out;
}

beforeEach(() => {
  jest.useFakeTimers();
  mockFetch.mockReset();
  mockFetch.mockResolvedValue(ITEMS);
  jest.spyOn(BackHandler, 'addEventListener').mockImplementation(() => ({ remove: () => undefined }));
  jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
});

afterEach(() => {
  act(() => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('FaqScreen accessibility', () => {
  // Covers: FAQ_FUNC_TC_016 - title, Back and each card are buttons or headings with labels in reading order (FR-028, FR-029, E-04)
  it('reads the title, then Back, then each card', async () => {
    setup(ITEMS);
    await act(async () => undefined);
    expect(rolesInOrder(screen.toJSON() as Json | Json[])).toEqual([
      'header',
      'button',
      'button',
      'button',
    ]);
    expect(screen.getAllByRole('button').map(b => b.props.accessibilityLabel)).toEqual([
      'Back',
      'First question',
      'Second question',
    ]);
    expect(screen.getByRole('header').props.children).toBe('FAQs');
  });

  // Covers: FAQ_FUNC_TC_016 - every card is a button labelled with the question and exposes expanded state (FR-028, E-04)
  it('gives every card a button role, the question as label and an expanded state that follows the press', async () => {
    setup(ITEMS);
    await act(async () => undefined);
    ITEMS.forEach(item => {
      const card = screen.getByRole('button', { name: item.question });
      expect(card.props.accessibilityLabel).toBe(item.question);
      expect(card.props.accessibilityState).toEqual({ expanded: false });
    });
    fireEvent.press(screen.getByRole('button', { name: 'First question' }));
    expect(screen.getByRole('button', { name: 'First question' }).props.accessibilityState).toEqual({
      expanded: true,
    });
    expect(screen.getByRole('button', { name: 'Second question' }).props.accessibilityState).toEqual({
      expanded: false,
    });
  });

  it('hides every chevron from screen readers', async () => {
    setup(ITEMS);
    await act(async () => undefined);
    const chevrons = screen.getAllByTestId('faq-chevron', { includeHiddenElements: true });
    expect(chevrons).toHaveLength(2);
    chevrons.forEach(chevron => {
      expect(chevron.props.accessibilityElementsHidden).toBe(true);
      expect(chevron.props.importantForAccessibility).toBe('no-hide-descendants');
    });
    expect(screen.queryAllByTestId('faq-chevron')).toHaveLength(0);
  });

  it('keeps every touch target at least 44 high or wide', async () => {
    setup(ITEMS);
    await act(async () => undefined);
    ITEMS.forEach(item => {
      const style = StyleSheet.flatten(screen.getByRole('button', { name: item.question }).props.style);
      expect(style.minHeight).toBeGreaterThanOrEqual(44);
    });
    const back = screen.getByRole('button', { name: 'Back' });
    const slop = back.props.hitSlop;
    const style = StyleSheet.flatten(back.props.style);
    expect(style.width + slop.left + slop.right).toBeGreaterThanOrEqual(44);
    expect(style.height + slop.top + slop.bottom).toBeGreaterThanOrEqual(44);
  });

  it('announces the loader to screen readers while the first request is pending', () => {
    mockFetch.mockReturnValue(new Promise(() => undefined));
    setup();
    expect(screen.getByTestId('faq-loader').props.accessibilityLiveRegion).toBe('polite');
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith('Loading');
  });

  it('announces the error message to screen readers', async () => {
    mockFetch.mockRejectedValue(new Error('offline'));
    setup();
    await act(async () => undefined);
    expect(screen.getByText(ERROR).props.accessibilityRole).toBe('alert');
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(ERROR);
  });

  it('uses no fixed height on any text so a 2x text size cannot clip it', async () => {
    setup(ITEMS);
    await act(async () => undefined);
    fireEvent.press(screen.getByRole('button', { name: 'First question' }));
    ['First question', 'Second question', 'First answer'].forEach(text => {
      const style = StyleSheet.flatten(screen.getByText(text).props.style);
      expect(style.height).toBeUndefined();
      expect(style.maxHeight).toBeUndefined();
      expect(style.lineHeight).toBe(18);
    });
    expect(screen.getByTestId('faq-column').props.style).not.toHaveProperty('height');
  });
});
