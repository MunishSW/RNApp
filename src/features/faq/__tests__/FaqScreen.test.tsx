import React from 'react';
import { BackHandler, Linking, StyleSheet } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { fetchFaq } from '../../../services/faqService';
import { createAppStore } from '../../../store';
import { setFaqItems } from '../../../store/faqSlice';
import { themes } from '../../../theme/tokens';
import FaqScreen from '../FaqScreen';

jest.mock('../../../services/faqService', () => ({ fetchFaq: jest.fn() }));

const mockFetch = fetchFaq as jest.Mock;

type ScreenProps = React.ComponentProps<typeof FaqScreen>;

const ERROR =
  'Your request could not be processed at this moment. Request you to try again after sometime.';
const A = { question: 'What is EMI?', answer: 'Equated monthly instalment' };
const B = { question: 'How do I prepay?', answer: 'Visit a branch' };
const C = { question: 'Third question', answer: 'Third answer' };

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function setup(stored?: Array<{ question: string; answer: string }>) {
  const store = createAppStore();
  if (stored) {
    store.dispatch(setFaqItems(stored));
  }
  const listeners: Record<string, Array<() => void>> = {};
  const navigation = {
    navigate: jest.fn(),
    addListener: jest.fn((type: string, cb: () => void) => {
      (listeners[type] = listeners[type] || []).push(cb);
      return () => {
        listeners[type] = (listeners[type] || []).filter(l => l !== cb);
      };
    }),
  };
  const props = { navigation, route: { key: 'faq', name: 'Faq' } } as unknown as ScreenProps;
  const utils = render(
    <Provider store={store}>
      <FaqScreen {...props} />
    </Provider>,
  );
  return {
    ...utils,
    store,
    navigation,
    emit: (type: string) => act(() => (listeners[type] || []).slice().forEach(cb => cb())),
  };
}

const card = (name: string) => screen.getByRole('button', { name });
const isOpen = (name: string) => card(name).props.accessibilityState.expanded === true;

beforeEach(() => {
  jest.useFakeTimers();
  mockFetch.mockReset();
  mockFetch.mockResolvedValue([]);
  jest.spyOn(BackHandler, 'addEventListener').mockImplementation(() => ({ remove: () => undefined }));
});

afterEach(() => {
  act(() => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('FaqScreen list (US1)', () => {
  // Covers: FAQ_FUNC_TC_001 - FAQ accordion list displays all questions
  it('shows the header, one closed card per stored item and no loader', async () => {
    mockFetch.mockResolvedValue([A, B]);
    setup([A, B]);
    expect(screen.getByRole('header').props.children).toBe('FAQs');
    expect(screen.getByRole('button', { name: 'Back' })).toBeTruthy();
    expect(screen.getByText(A.question)).toBeTruthy();
    expect(screen.getByText(B.question)).toBeTruthy();
    expect(isOpen(A.question)).toBe(false);
    expect(isOpen(B.question)).toBe(false);
    expect(screen.queryByTestId('faq-loader')).toBeNull();
    expect(screen.queryByText(A.answer)).toBeNull();
    await act(async () => undefined);
  });

  it('uses the page colour token and the Figma list spacing', () => {
    mockFetch.mockReturnValue(new Promise(() => undefined));
    setup([A, B]);
    const root = StyleSheet.flatten(screen.getByTestId('faq-screen').props.style);
    expect(root.backgroundColor).toBe(themes.light.faqPageBackground);
    const content = StyleSheet.flatten(screen.getByTestId('faq-scroll').props.contentContainerStyle);
    expect(content.paddingTop).toBe(12);
    const column = StyleSheet.flatten(screen.getByTestId('faq-column').props.style);
    expect(column.paddingHorizontal).toBe(18);
    expect(column.gap).toBe(8);
  });

  it('keeps the content in a centred column of at most 360 on a wide window', () => {
    mockFetch.mockReturnValue(new Promise(() => undefined));
    setup([A]);
    const content = StyleSheet.flatten(screen.getByTestId('faq-scroll').props.contentContainerStyle);
    expect(content.alignItems).toBe('center');
    const column = StyleSheet.flatten(screen.getByTestId('faq-column').props.style);
    expect(column.maxWidth).toBe(360);
    expect(column.width).toBe('100%');
  });

  // Covers: FAQ_FUNC_TC_002, FAQ_FUNC_TC_003 - answer expands on tap and collapses on second tap
  it('opens one card only, then closes it again on the second press', () => {
    mockFetch.mockReturnValue(new Promise(() => undefined));
    setup([A, B]);
    fireEvent.press(card(A.question));
    expect(isOpen(A.question)).toBe(true);
    expect(isOpen(B.question)).toBe(false);
    expect(screen.getByText(A.answer)).toBeTruthy();
    expect(screen.queryByText(B.answer)).toBeNull();
    fireEvent.press(card(A.question));
    expect(isOpen(A.question)).toBe(false);
    expect(screen.queryByText(A.answer)).toBeNull();
  });

  it('lets two cards be open together', () => {
    mockFetch.mockReturnValue(new Promise(() => undefined));
    setup([A, B]);
    fireEvent.press(card(A.question));
    fireEvent.press(card(B.question));
    expect(isOpen(A.question)).toBe(true);
    expect(isOpen(B.question)).toBe(true);
    expect(screen.getByText(A.answer)).toBeTruthy();
    expect(screen.getByText(B.answer)).toBeTruthy();
  });

  // Covers: FAQ_FUNC_TC_013 - rapid presses do not freeze UI and flip only targeted card
  it('ends consistent after ten rapid presses on one card and flips only that card', () => {
    mockFetch.mockReturnValue(new Promise(() => undefined));
    setup([A, B]);
    for (let i = 0; i < 10; i += 1) {
      fireEvent.press(card(A.question));
    }
    expect(isOpen(A.question)).toBe(false);
    expect(isOpen(B.question)).toBe(false);
    fireEvent.press(card(A.question));
    expect(isOpen(A.question)).toBe(true);
    expect(isOpen(B.question)).toBe(false);
  });

  it('starts every card closed again each time the screen is returned to', async () => {
    mockFetch.mockResolvedValue([A, B]);
    const { emit } = setup([A, B]);
    fireEvent.press(card(A.question));
    fireEvent.press(card(B.question));
    emit('focus');
    await act(async () => undefined);
    expect(isOpen(A.question)).toBe(false);
    expect(isOpen(B.question)).toBe(false);
  });

  // Covers: FAQ_FUNC_TC_009 - long question wraps fully with no line limit
  it('shows a very long question in full with no line limit and no fixed text height', () => {
    mockFetch.mockReturnValue(new Promise(() => undefined));
    const long = 'Very long question '.repeat(20).trim();
    setup([{ question: long, answer: 'ok' }]);
    const text = screen.getByText(long);
    expect(text.props.numberOfLines).toBeUndefined();
    expect(StyleSheet.flatten(text.props.style).height).toBeUndefined();
  });

  // Covers: FAQ_FUNC_TC_012 - header back arrow and hardware back navigate to NonLoggedInHome
  it('goes to Home from the header back arrow and from the hardware back', () => {
    mockFetch.mockReturnValue(new Promise(() => undefined));
    const add = BackHandler.addEventListener as jest.Mock;
    const { navigation } = setup([A]);
    fireEvent.press(screen.getByRole('button', { name: 'Back' }));
    expect(navigation.navigate).toHaveBeenCalledWith('NonLoggedInHome', undefined);
    expect(add).toHaveBeenCalledWith('hardwareBackPress', expect.any(Function));
  });
});

describe('FaqScreen loading, empty and error (US2)', () => {
  // Covers: FAQ_FUNC_TC_014 - loader displays during pending request and hides upon response
  it('shows the loader while the first request is pending and then the list', async () => {
    const pending = deferred<typeof A[]>();
    mockFetch.mockReturnValue(pending.promise);
    setup();
    expect(screen.getByTestId('faq-loader')).toBeTruthy();
    expect(screen.queryByRole('button', { name: A.question })).toBeNull();
    await act(async () => pending.resolve([A, B]));
    expect(screen.queryByTestId('faq-loader')).toBeNull();
    expect(screen.getByText(A.question)).toBeTruthy();
    expect(screen.getByText(B.question)).toBeTruthy();
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  // Covers: FAQ_FUNC_TC_007, FAQ_FUNC_TC_017 - API failure with no cache displays error message and retry button
  it('shows the error message and Retry when the first request fails, and the list after Retry', async () => {
    mockFetch.mockRejectedValueOnce(new Error('offline'));
    setup();
    await act(async () => undefined);
    expect(screen.queryByTestId('faq-loader')).toBeNull();
    expect(screen.getByText(ERROR)).toBeTruthy();

    const pending = deferred<typeof A[]>();
    mockFetch.mockReturnValueOnce(pending.promise);
    fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
    expect(screen.getByTestId('faq-loader')).toBeTruthy();
    expect(screen.queryByText(ERROR)).toBeNull();
    await act(async () => pending.resolve([A]));
    expect(screen.getByText(A.question)).toBeTruthy();
    expect(screen.queryByText(ERROR)).toBeNull();
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('still lets the visitor go back from the loader and from the error state', async () => {
    mockFetch.mockRejectedValue(new Error('offline'));
    const { navigation } = setup();
    fireEvent.press(screen.getByRole('button', { name: 'Back' }));
    expect(navigation.navigate).toHaveBeenCalledWith('NonLoggedInHome', undefined);
    await act(async () => undefined);
    expect(screen.getByText(ERROR)).toBeTruthy();
  });

  // Covers: FAQ_FUNC_TC_005 - empty response array displays empty message without crash
  it('shows the empty message with no dialog and no button for an empty answer', async () => {
    mockFetch.mockResolvedValue([]);
    setup();
    await act(async () => undefined);
    expect(screen.getByText('No FAQs are available right now.')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
    expect(screen.queryByTestId('faq-loader')).toBeNull();
  });

  // Covers: FAQ_FUNC_TC_011 - non-list response normalized safely to empty state without crash
  it('shows the empty message for a non-list answer without a crash', async () => {
    mockFetch.mockResolvedValue('not a list');
    setup();
    await act(async () => undefined);
    expect(screen.getByText('No FAQs are available right now.')).toBeTruthy();
  });

  // Covers: FAQ_FUNC_TC_006 - API refresh failure keeps stored list displayed
  it('shows nothing extra when a refresh fails and a list is stored', async () => {
    mockFetch.mockRejectedValue(new Error('offline'));
    setup([A, B]);
    await act(async () => undefined);
    expect(screen.getByText(A.question)).toBeTruthy();
    expect(screen.queryByText(ERROR)).toBeNull();
    expect(screen.queryByTestId('faq-loader')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Retry' })).toBeNull();
  });
});

describe('FaqScreen refresh on return (US3)', () => {
  // Covers: FAQ_FUNC_TC_008 - route revisit on focus requests fresh list and replaces old list
  it('requests the list again on return, replaces the old list, and closes all cards', async () => {
    mockFetch.mockResolvedValueOnce([A, B]);
    const { emit, store } = setup([A, B]);
    await act(async () => undefined);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    fireEvent.press(card(A.question));

    mockFetch.mockResolvedValueOnce([C]);
    emit('blur');
    emit('focus');
    await act(async () => undefined);
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(screen.getByText(C.question)).toBeTruthy();
    expect(screen.queryByText(A.question)).toBeNull();
    expect(isOpen(C.question)).toBe(false);
    expect(store.getState().faq.items).toEqual([C]);
  });

  it('makes no request other than the FAQ service', async () => {
    const fetchSpy = jest.fn();
    const original = global.fetch;
    global.fetch = fetchSpy as unknown as typeof fetch;
    try {
      mockFetch.mockResolvedValue([A]);
      const { emit } = setup([A]);
      await act(async () => undefined);
      emit('focus');
      await act(async () => undefined);
      expect(fetchSpy).not.toHaveBeenCalled();
      expect(mockFetch).toHaveBeenCalledTimes(2);
    } finally {
      global.fetch = original;
    }
  });
});

describe('FaqScreen formatted answers (US4)', () => {
  // Covers: FAQ_FUNC_TC_004 - formatted HTML content in answer renders with styles and list markers
  it('shows bold text, a list and a link, and opens the link through Linking', async () => {
    const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
    const rich = {
      question: 'Rich question',
      answer:
        'Visit <b>any branch</b> or <a href="https://example.com/apply">apply online</a>.<ul><li>PAN</li><li>Aadhaar</li></ul>',
    };
    mockFetch.mockResolvedValue([rich]);
    setup([rich]);
    await act(async () => undefined);
    fireEvent.press(card('Rich question'));
    const bold = StyleSheet.flatten(screen.getByText('any branch').props.style);
    expect(bold.fontWeight).toBe('bold');
    expect(screen.getByText('PAN')).toBeTruthy();
    expect(screen.getByText('Aadhaar')).toBeTruthy();
    expect(screen.getAllByText('•')).toHaveLength(2);
    fireEvent.press(screen.getByText('apply online'));
    expect(open).toHaveBeenCalledTimes(1);
    expect(open).toHaveBeenCalledWith('https://example.com/apply');
  });
});
