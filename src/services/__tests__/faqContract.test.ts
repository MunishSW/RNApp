import type { InternalAxiosRequestConfig } from 'axios';
import { restorePlatformOS, setPlatformOS } from '../../testUtils/platform';
import { fetchFaq } from '../faqService';
import { apiClient, setTokenProvider } from '../httpClient';

type Captured = InternalAxiosRequestConfig;

function stub(captured: Captured[], respond: () => unknown) {
  apiClient.defaults.adapter = async config => {
    captured.push(config);
    const data = respond();
    if (data instanceof Error) {
      throw data;
    }
    return { data, status: 200, statusText: 'OK', headers: {}, config };
  };
}

afterEach(() => {
  setTokenProvider(null);
  restorePlatformOS();
});

describe('fetch-faq contract (contracts/fetch-faq.md)', () => {
  // Covers: FR-4.4-08, FR-4.5-03, P-08, TC-302 - Bearer plus standard headers, no X-BHFL-Auth
  it('[TC-302] sends Bearer, app-version, platform and device-details and no X-BHFL-Auth', async () => {
    setPlatformOS('ios');
    setTokenProvider(async () => 'faq-token');
    const captured: Captured[] = [];
    stub(captured, () => [{ question: 'q', answer: 'a' }]);
    await fetchFaq();
    const h = captured[0].headers;
    expect(captured[0].method).toBe('post');
    expect(captured[0].url).toBe('FormBasedQuery/Services/v1/fetch-faq');
    expect(JSON.parse(String(captured[0].data))).toEqual({});
    expect(h.get('Authorization')).toBe('Bearer faq-token');
    expect(h.get('app-version')).toBe('1.8.9');
    expect(h.get('platform')).toBe('ios');
    expect(h.get('device-details')).toBeDefined();
    expect(h.has('X-BHFL-Auth')).toBe(false);
  });

  // Covers: FR-4.5-04, FR-4.5-05, TV-2, TC-304, TC-305 - array kept, anything else is empty
  it('[TC-305] returns the array and treats every non-array as empty', async () => {
    stub([], () => [{ question: 'q', answer: 'a' }]);
    await expect(fetchFaq()).resolves.toHaveLength(1);
    for (const body of [[], {}, 'x', null, 5]) {
      stub([], () => body);
      await expect(fetchFaq()).resolves.toEqual([]);
    }
  });

  // Covers: FR-4.5-06, N-02, TC-303 - a failed request rejects so the caller can show the dialog
  it('[TC-303] rejects on a server error', async () => {
    stub([], () => new Error('Request failed with status code 500'));
    await expect(fetchFaq()).rejects.toThrow('500');
  });
});
