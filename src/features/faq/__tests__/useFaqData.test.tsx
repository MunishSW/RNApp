import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { fetchFaq } from '../../../services/faqService';
import { createAppStore } from '../../../store';
import { clearFaq, setFaqItems } from '../../../store/faqSlice';
import { useFaqData } from '../hooks/useFaqData';

jest.mock('../../../services/faqService', () => ({ fetchFaq: jest.fn() }));

const mockFetch = fetchFaq as jest.Mock;

const A = { question: 'Q A', answer: 'A A' };
const B = { question: 'Q B', answer: 'A B' };
const C = { question: 'Q C', answer: 'A C' };

function setup(stored?: Array<{ question: string; answer: string }>) {
  const store = createAppStore();
  if (stored) {
    store.dispatch(setFaqItems(stored));
  }
  const listeners: Record<string, Array<() => void>> = {};
  const unsubscribe = jest.fn();
  const navigation = {
    navigate: jest.fn(),
    addListener: jest.fn((type: string, cb: () => void) => {
      (listeners[type] = listeners[type] || []).push(cb);
      return unsubscribe;
    }),
  };
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );
  const hook = renderHook(() => useFaqData(navigation), { wrapper });
  const focus = () => act(() => (listeners.focus || []).forEach(cb => cb()));
  return { ...hook, store, navigation, focus, unsubscribe };
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('useFaqData', () => {
  it('shows a stored list at once, with no loader and without waiting for the request', () => {
    const pending = deferred<never[]>();
    mockFetch.mockReturnValue(pending.promise);
    const { result } = setup([A, B]);
    expect(result.current.state).toBe('list');
    expect(result.current.items).toEqual([A, B]);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('replaces the stored list on screen and in the store with a non-empty answer', async () => {
    mockFetch.mockResolvedValue([C]);
    const { result, store } = setup([A, B]);
    await act(async () => undefined);
    expect(result.current.state).toBe('list');
    expect(result.current.items).toEqual([C]);
    expect(store.getState().faq.items).toEqual([C]);
  });

  it('shows loading and then the list when nothing is stored', async () => {
    const pending = deferred<typeof A[]>();
    mockFetch.mockReturnValue(pending.promise);
    const { result, store } = setup();
    expect(result.current.state).toBe('loading');
    await act(async () => pending.resolve([A, B]));
    expect(result.current.state).toBe('list');
    expect(result.current.items).toEqual([A, B]);
    expect(store.getState().faq.items).toEqual([A, B]);
  });

  it('shows the error state when the request fails and nothing is stored', async () => {
    mockFetch.mockRejectedValue(new Error('offline'));
    const { result } = setup();
    await act(async () => undefined);
    expect(result.current.state).toBe('error');
    expect(result.current.items).toEqual([]);
  });

  it('keeps the stored list and shows nothing when a refresh fails', async () => {
    mockFetch.mockRejectedValue(new Error('offline'));
    const { result, store } = setup([A]);
    await act(async () => undefined);
    expect(result.current.state).toBe('list');
    expect(result.current.items).toEqual([A]);
    expect(store.getState().faq.items).toEqual([A]);
  });

  it('keeps the stored list when the refresh answers with an empty list', async () => {
    mockFetch.mockResolvedValue([]);
    const { result, store } = setup([A]);
    await act(async () => undefined);
    expect(result.current.state).toBe('list');
    expect(store.getState().faq.items).toEqual([A]);
  });

  it('gives the empty state for an empty array when nothing is stored', async () => {
    mockFetch.mockResolvedValue([]);
    const { result } = setup();
    await act(async () => undefined);
    expect(result.current.state).toBe('empty');
  });

  it('gives the empty state for a non-array answer when nothing is stored', async () => {
    mockFetch.mockResolvedValue({ unexpected: true });
    const { result } = setup();
    await act(async () => undefined);
    expect(result.current.state).toBe('empty');
    expect(result.current.items).toEqual([]);
  });

  it('drops items without a question and keeps the others', async () => {
    mockFetch.mockResolvedValue([
      A,
      { question: '', answer: 'x' },
      { question: '   ', answer: 'x' },
      { answer: 'no question' },
      { question: 'No answer' },
      null,
    ]);
    const { result } = setup();
    await act(async () => undefined);
    expect(result.current.state).toBe('list');
    expect(result.current.items).toEqual([A, { question: 'No answer', answer: '' }]);
  });

  it('gives the empty state when every item lacks a question', async () => {
    mockFetch.mockResolvedValue([{ question: '', answer: 'x' }]);
    const { result } = setup();
    await act(async () => undefined);
    expect(result.current.state).toBe('empty');
  });

  it('retry repeats the request with the loader and then shows the list', async () => {
    mockFetch.mockRejectedValueOnce(new Error('offline'));
    const { result } = setup();
    await act(async () => undefined);
    expect(result.current.state).toBe('error');

    const pending = deferred<typeof A[]>();
    mockFetch.mockReturnValueOnce(pending.promise);
    act(() => result.current.retry());
    expect(result.current.state).toBe('loading');
    expect(mockFetch).toHaveBeenCalledTimes(2);
    await act(async () => pending.resolve([A]));
    expect(result.current.state).toBe('list');
    expect(result.current.items).toEqual([A]);
  });

  it('retry that fails again returns to the error state', async () => {
    mockFetch.mockRejectedValue(new Error('offline'));
    const { result } = setup();
    await act(async () => undefined);
    act(() => result.current.retry());
    expect(result.current.state).toBe('loading');
    await act(async () => undefined);
    expect(result.current.state).toBe('error');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('refreshes once on every focus and a non-empty answer replaces the stored list', async () => {
    mockFetch.mockResolvedValueOnce([A]);
    const { result, focus, store } = setup([A]);
    await act(async () => undefined);
    expect(mockFetch).toHaveBeenCalledTimes(1);

    mockFetch.mockResolvedValueOnce([B, C]);
    focus();
    await act(async () => undefined);
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(result.current.items).toEqual([B, C]);
    expect(store.getState().faq.items).toEqual([B, C]);
  });

  it('does not start a second request while one is still pending', async () => {
    const pending = deferred<typeof A[]>();
    mockFetch.mockReturnValue(pending.promise);
    const { focus } = setup([A]);
    focus();
    expect(mockFetch).toHaveBeenCalledTimes(1);
    await act(async () => pending.resolve([A]));
  });

  it('does not request again on re-render', async () => {
    mockFetch.mockResolvedValue([A]);
    const { rerender } = setup([A]);
    await act(async () => undefined);
    rerender({});
    rerender({});
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('loads a new list on the next open after the stored list was cleared', async () => {
    mockFetch.mockResolvedValueOnce([A]);
    const { result, store, focus } = setup([A]);
    await act(async () => undefined);
    act(() => {
      store.dispatch(clearFaq());
    });
    expect(result.current.state).toBe('loading');

    mockFetch.mockResolvedValueOnce([B]);
    focus();
    expect(result.current.state).toBe('loading');
    await act(async () => undefined);
    expect(result.current.state).toBe('list');
    expect(result.current.items).toEqual([B]);
  });

  it('removes its focus listener on unmount and ignores a late answer', async () => {
    const pending = deferred<typeof A[]>();
    mockFetch.mockReturnValue(pending.promise);
    const { unmount, unsubscribe, store } = setup();
    unmount();
    expect(unsubscribe).toHaveBeenCalled();
    await act(async () => pending.resolve([A]));
    expect(store.getState().faq.items).toBeNull();
  });
});
