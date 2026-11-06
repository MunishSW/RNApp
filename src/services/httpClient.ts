import axios, { AxiosRequestConfig } from 'axios';
import { ENV } from '../config/env';
import { getAppVersion, getDeviceDetails, getPlatform } from './deviceInfo';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Token call only: no Authorization and no standard headers (BRD 8.1.1) */
    skipAuth?: boolean;
  }
}

type TokenProvider = () => Promise<string | undefined>;

let tokenProvider: TokenProvider | null = null;

/** The auth layer registers how to obtain the current non-logged token (waits for in-flight requests). */
export function setTokenProvider(provider: TokenProvider | null): void {
  tokenProvider = provider;
}

export const apiClient = axios.create({
  baseURL: ENV.apiUrl,
  timeout: ENV.requestTimeoutMs,
});

apiClient.interceptors.request.use(async config => {
  if (config.skipAuth) {
    return config;
  }
  if (!config.headers.has('Authorization') && tokenProvider) {
    const token = await tokenProvider();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
  }
  config.headers.set('app-version', getAppVersion());
  config.headers.set('platform', getPlatform());
  config.headers.set('device-details', getDeviceDetails());
  return config;
});

export interface PostOptions {
  baseURL?: string;
  timeout?: number;
  headers?: Record<string, string>;
  skipAuth?: boolean;
}

/** The single entry point features and services use for network calls. */
export async function post<TResponse>(
  path: string,
  body: unknown,
  options: PostOptions = {},
): Promise<TResponse> {
  const config: AxiosRequestConfig = {
    baseURL: options.baseURL,
    timeout: options.timeout,
    headers: options.headers,
    skipAuth: options.skipAuth,
  };
  const response = await apiClient.post<TResponse>(path, body, config);
  return response.data;
}
