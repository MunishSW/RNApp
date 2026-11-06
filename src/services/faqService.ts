import { ENV } from '../config/env';
import { FaqItem } from '../store/faqSlice';
import { post } from './httpClient';

/**
 * Fetches the FAQ list (empty POST body, Bearer token via the shared client, bare host base URL).
 * A non-array response is treated as empty (TV-2, NLH-E03). Request failures reject so the caller
 * can show the standard error dialog (NLH-E02). The error body is never parsed.
 */
export async function fetchFaq(): Promise<FaqItem[]> {
  const data = await post<unknown>('FormBasedQuery/Services/v1/fetch-faq', {}, {
    baseURL: ENV.apiBaseUrl,
  });
  return Array.isArray(data) ? (data as FaqItem[]) : [];
}
