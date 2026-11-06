import type { InternalAxiosRequestConfig } from 'axios';
import { apiClient } from '../httpClient';
import { fetchFaq } from '../faqService';

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

describe('faqService', () => {
  // Covers: HOME_ACTION_TC_008 - empty POST to fetch-faq on the bare host
  it('[HOME_ACTION_TC_008] posts {} to fetch-faq on the bare host and returns the list', async () => {
    const captured: Captured[] = [];
    stub(captured, () => [{ question: 'How do I pay my EMI?', answer: '...' }]);
    const items = await fetchFaq();
    expect(items).toEqual([{ question: 'How do I pay my EMI?', answer: '...' }]);
    expect(captured[0].url).toBe('FormBasedQuery/Services/v1/fetch-faq');
    expect(captured[0].baseURL).toBe('https://host.example.test/');
    expect(JSON.parse(String(captured[0].data))).toEqual({});
  });

  // Covers: HOME_FAQ_TC_001 - empty array stays empty
  it('[HOME_FAQ_TC_001] returns an empty list for an empty array', async () => {
    stub([], () => []);
    await expect(fetchFaq()).resolves.toEqual([]);
  });

  // Covers: HOME_FAQ_TC_002 - non-array response treated as empty
  it('[HOME_FAQ_TC_002] treats a non-array response as empty', async () => {
    for (const body of [{ a: 1 }, 'text', null, 7]) {
      stub([], () => body);
      await expect(fetchFaq()).resolves.toEqual([]);
    }
  });

  // Covers: HOME_NEG_TC_001 - 500 rejects so the caller shows the dialog
  it('[HOME_NEG_TC_001] rejects on a failed request', async () => {
    stub([], () => new Error('Request failed with status code 500'));
    await expect(fetchFaq()).rejects.toThrow('500');
  });
});
