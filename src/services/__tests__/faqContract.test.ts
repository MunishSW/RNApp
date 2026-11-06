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
  // Covers: HOME_TOKEN_TC_001 - Bearer plus standard headers, no X-BHFL-Auth (FR-034, FR-037, P-08)
  it('[HOME_TOKEN_TC_001] sends Bearer, app-version, platform and device-details and no X-BHFL-Auth', async () => {
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

  // Covers: HOME_FAQ_TC_002 - array kept, anything else is empty (FR-038, FR-039, TV-2)
  it('[HOME_FAQ_TC_002] returns the array and treats every non-array as empty', async () => {
    stub([], () => [{ question: 'q', answer: 'a' }]);
    await expect(fetchFaq()).resolves.toHaveLength(1);
    for (const body of [[], {}, 'x', null, 5]) {
      stub([], () => body);
      await expect(fetchFaq()).resolves.toEqual([]);
    }
  });

  // Covers: HOME_NEG_TC_001 - a failed request rejects so the caller can show the dialog (FR-040, N-02)
  it('[HOME_NEG_TC_001] rejects on a server error', async () => {
    stub([], () => new Error('Request failed with status code 500'));
    await expect(fetchFaq()).rejects.toThrow('500');
  });
});
