import React from 'react';
import { act, render } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { post } from '../../../services/httpClient';
import { createAppStore } from '../../../store';
import FaqScreen from '../FaqScreen';

jest.mock('../../../services/httpClient', () => ({
  post: jest.fn(),
}));

const mockPost = post as jest.Mock;
type ScreenProps = React.ComponentProps<typeof FaqScreen>;

function setup() {
  const store = createAppStore();
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

beforeEach(() => {
  jest.useFakeTimers();
  mockPost.mockReset();
  mockPost.mockResolvedValue([
    { question: 'What is EMI?', answer: 'Equated monthly instalment' },
  ]);
});

afterEach(() => {
  act(() => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('FAQ endpoint isolation (BR-2, P-05)', () => {
  // Covers: FAQ_FUNC_TC_015 - only FAQ endpoint is requested and track application API is never called
  it('[FAQ_FUNC_TC_015] requests only the FAQ endpoint and never calls track application API', async () => {
    const { emit } = setup();
    await act(async () => undefined);

    expect(mockPost).toHaveBeenCalledTimes(1);
    expect(mockPost).toHaveBeenLastCalledWith(
      'FormBasedQuery/Services/v1/fetch-faq',
      {},
      expect.objectContaining({ baseURL: expect.any(String) }),
    );

    // Revisit screen
    emit('focus');
    await act(async () => undefined);

    expect(mockPost).toHaveBeenCalledTimes(2);
    expect(mockPost).toHaveBeenLastCalledWith(
      'FormBasedQuery/Services/v1/fetch-faq',
      {},
      expect.objectContaining({ baseURL: expect.any(String) }),
    );

    // Verify none of the calls were to a track URL
    const calledUrls = mockPost.mock.calls.map((call: unknown[]) => call[0] as string);
    expect(calledUrls).toEqual([
      'FormBasedQuery/Services/v1/fetch-faq',
      'FormBasedQuery/Services/v1/fetch-faq',
    ]);
    expect(calledUrls.some((url: string) => /track/i.test(url))).toBe(false);
  });
});
