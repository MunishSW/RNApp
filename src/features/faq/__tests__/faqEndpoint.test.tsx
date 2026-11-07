import React from 'react';
import { BackHandler } from 'react-native';
import type { InternalAxiosRequestConfig } from 'axios';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { apiClient } from '../../../services/httpClient';
import { createAppStore } from '../../../store';
import FaqScreen from '../FaqScreen';

type ScreenProps = React.ComponentProps<typeof FaqScreen>;

const FAQ_URL = 'FormBasedQuery/Services/v1/fetch-faq';
const original = apiClient.defaults.adapter;

function stubNetwork(urls: string[]) {
  apiClient.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    urls.push(String(config.url));
    return {
      data: [{ question: 'What is EMI?', answer: 'Equated monthly instalment' }],
      status: 200,
      statusText: 'OK',
      headers: {},
      config,
    };
  };
}

beforeEach(() => {
  jest.useFakeTimers();
  jest.spyOn(BackHandler, 'addEventListener').mockImplementation(() => ({ remove: () => undefined }));
});

afterEach(() => {
  act(() => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
  apiClient.defaults.adapter = original;
  jest.restoreAllMocks();
});

describe('FAQ screen network use (real FAQ service, stubbed transport)', () => {
  // Covers: FAQ_FUNC_TC_015 - every HTTP call made by the screen goes to the FAQ endpoint, none to Track Application (FR-019, BR-2, P-05)
  it('[FAQ_FUNC_TC_015] sends only the fetch-faq request on open and on return, and nothing to Track Application', async () => {
    const urls: string[] = [];
    stubNetwork(urls);
    const listeners: Array<() => void> = [];
    const navigation = {
      navigate: jest.fn(),
      addListener: jest.fn((type: string, cb: () => void) => {
        if (type === 'focus') {
          listeners.push(cb);
        }
        return () => undefined;
      }),
    };
    const props = { navigation, route: { key: 'faq', name: 'Faq' } } as unknown as ScreenProps;
    render(
      <Provider store={createAppStore()}>
        <FaqScreen {...props} />
      </Provider>,
    );
    await act(async () => undefined);
    expect(screen.getByText('What is EMI?')).toBeTruthy();
    fireEvent.press(screen.getByRole('button', { name: 'What is EMI?' }));
    act(() => listeners.slice().forEach(cb => cb()));
    await act(async () => undefined);

    expect(urls).toEqual([FAQ_URL, FAQ_URL]);
    expect(urls.some(url => /track/i.test(url))).toBe(false);
  });
});
