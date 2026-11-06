import React from 'react';
import { AccessibilityInfo } from 'react-native';
import { act, renderHook } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { setAnalyticsSink } from '../../../services/analytics';
import { fetchFaq } from '../../../services/faqService';
import { createAppStore } from '../../../store';
import { setFaqItems } from '../../../store/faqSlice';
import { useFaqFlow } from '../hooks/useFaqFlow';

jest.mock('../../../services/faqService', () => ({ fetchFaq: jest.fn() }));

const sink = jest.fn();
const mockFetch = fetchFaq as jest.Mock;

function setup(withCache = false) {
  const store = createAppStore();
  if (withCache) {
    store.dispatch(setFaqItems([{ question: 'q', answer: 'a' }]));
  }
  const navigate = jest.fn();
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  const hook = renderHook(() => useFaqFlow(navigate), { wrapper });
  return { store, navigate, ...hook };
}

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

beforeEach(() => {
  mockFetch.mockReset();
  sink.mockClear();
  setAnalyticsSink(sink);
  jest.spyOn(AccessibilityInfo, 'announceForAccessibility').mockImplementation(() => undefined);
});

afterEach(() => {
  jest.restoreAllMocks();
  setAnalyticsSink(() => undefined);
});

describe('useFaqFlow', () => {
  // Covers: HOME_ACTION_TC_009, HOME_BACK_TC_005 - cached list opens at once with no request or spinner (FR-035, FR-036, BR-6, P-07)
  it('[HOME_ACTION_TC_009] opens the FAQ screen at once from the cache and sets the back flag', async () => {
    const { result, navigate, store } = setup(true);
    await act(async () => {
      await result.current.onFaqPress();
    });
    expect(navigate).toHaveBeenCalledWith('Faq');
    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
    expect(store.getState().sessionFlags.faqsFromNonLogin).toBe(true);
  });

  // Covers: HOME_BACK_TC_005 - the FAQ back flag is also set on the fetch path, so FAQ back returns to Home (FAQ screen is another module)
  it('[HOME_BACK_TC_005] sets the FAQ back flag when the list is fetched', async () => {
    mockFetch.mockResolvedValue([{ question: 'q', answer: 'a' }]);
    const { result, store } = setup();
    expect(store.getState().sessionFlags.faqsFromNonLogin).toBe(false);
    await act(async () => {
      await result.current.onFaqPress();
    });
    expect(store.getState().sessionFlags.faqsFromNonLogin).toBe(true);
  });

  // Covers: HOME_ACTION_TC_004, HOME_ACTION_TC_008 - spinner, one request, store and open (FR-037, FR-038, P-08)
  it('[HOME_ACTION_TC_004] shows the spinner, requests once, stores the list and opens the FAQ screen', async () => {
    const d = deferred<Array<{ question: string; answer: string }>>();
    mockFetch.mockReturnValue(d.promise);
    const { result, navigate, store } = setup();
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.onFaqPress();
    });
    expect(result.current.loading).toBe(true);
    await act(async () => {
      d.resolve([{ question: 'How do I pay my EMI?', answer: '...' }]);
      await pending;
    });
    expect(result.current.loading).toBe(false);
    expect(navigate).toHaveBeenCalledWith('Faq');
    expect(store.getState().faq.items).toEqual([{ question: 'How do I pay my EMI?', answer: '...' }]);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  // Covers: HOME_FAQ_TC_003 - taps while loading send one request but still set the flag (FR-037, N-05)
  it('[HOME_FAQ_TC_003] ignores taps while loading and sends one request', async () => {
    const d = deferred<unknown[]>();
    mockFetch.mockReturnValue(d.promise);
    const { result } = setup();
    let first!: Promise<void>;
    act(() => {
      first = result.current.onFaqPress();
      result.current.onFaqPress();
      result.current.onFaqPress();
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
    await act(async () => {
      d.resolve([]);
      await first;
    });
    expect(result.current.loading).toBe(false);
  });

  // Covers: HOME_FAQ_TC_001 - empty (the service maps a non-list to empty) stays on Home without a dialog (FR-039, N-03, N-04)
  it('[HOME_FAQ_TC_001] stays on Home with no dialog for an empty list', async () => {
    mockFetch.mockResolvedValue([]);
    const { result, navigate, store } = setup();
    await act(async () => {
      await result.current.onFaqPress();
    });
    expect(navigate).not.toHaveBeenCalled();
    expect(result.current.errorVisible).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(store.getState().faq.items).toBeNull();
    expect(sink).not.toHaveBeenCalled();
  });

  // Covers: HOME_NEG_TC_001, HOME_FAQ_TC_007 - failure: spinner clears, dialog, dialog_shown (FR-040, N-02)
  it('[HOME_NEG_TC_001] clears the spinner, shows the dialog and records dialog_shown on failure', async () => {
    mockFetch.mockRejectedValue(new Error('Request failed with status code 500'));
    const { result, navigate } = setup();
    await act(async () => {
      await result.current.onFaqPress();
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.errorVisible).toBe(true);
    expect(navigate).not.toHaveBeenCalled();
    expect(sink).toHaveBeenCalledWith({
      name: 'dialog_shown',
      properties: { dialog_name: 'faq_error', screen: 'non_logged_home', kind: 'error' },
    });
    expect(AccessibilityInfo.announceForAccessibility).toHaveBeenCalledWith(
      'Your request could not be processed at this moment. Request you to try again after sometime.',
    );
  });

  // Covers: HOME_FAQ_TC_005 - "Okay" closes the dialog and a retry succeeds (FR-040, FR-041)
  it('[HOME_FAQ_TC_005] closes the dialog on "Okay" and a retry opens the FAQ screen', async () => {
    mockFetch.mockRejectedValueOnce(new Error('500')).mockResolvedValueOnce([{ question: 'q', answer: 'a' }]);
    const { result, navigate } = setup();
    await act(async () => {
      await result.current.onFaqPress();
    });
    expect(result.current.errorVisible).toBe(true);
    act(() => result.current.onErrorOkay());
    expect(result.current.errorVisible).toBe(false);
    await act(async () => {
      await result.current.onFaqPress();
    });
    expect(navigate).toHaveBeenCalledWith('Faq');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  // the failed request is not retried automatically (FR-041)
  it('does not retry automatically after a failure', async () => {
    mockFetch.mockRejectedValue(new Error('500'));
    const { result } = setup();
    await act(async () => {
      await result.current.onFaqPress();
    });
    await act(async () => undefined);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  // no state update after unmount, spinner state safe (PERF-5, PERF-3)
  it('does not update state after unmount', async () => {
    const d = deferred<unknown[]>();
    mockFetch.mockReturnValue(d.promise);
    const { result, unmount } = setup();
    let pending!: Promise<void>;
    act(() => {
      pending = result.current.onFaqPress();
    });
    unmount();
    await act(async () => {
      d.reject(new Error('late'));
      await pending;
    });
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
