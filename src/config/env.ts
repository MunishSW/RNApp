import Config from 'react-native-config';

/**
 * Typed per-environment build config (constitution IV). Values come from the
 * gitignored `.env` through react-native-config and are never logged.
 */
const DEFAULT_TIMEOUT_MS = 30000;

function toNumber(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export const ENV = {
  /** Default API client base (version service) */
  apiUrl: Config.API_URL ?? '',
  /** Auth service base (generatetoken) */
  authApiUrl: Config.AUTH_API_URL ?? '',
  /** Bare host, used by fetch-faq */
  apiBaseUrl: Config.API_BASE_URL ?? '',
  appName: Config.APP_NAME ?? '',
  portalBaseUrl: Config.PORTAL_BASE_URL ?? '',
  nonLoggedUsername: Config.NON_LOGGED_AUTH_USERNAME ?? '',
  nonLoggedPassword: Config.NON_LOGGED_AUTH_PASSWORD ?? '',
  /** AES-128-GCM shared key (hex, 32 chars) and 16-byte AAD, agreed with the backend */
  fieldEncryptionKey: Config.FIELD_ENCRYPTION_KEY ?? '',
  fieldEncryptionAad: Config.FIELD_ENCRYPTION_AAD ?? '',
  /** MMKV key (max 16 bytes). Empty means the token is never persisted */
  storageEncryptionKey: Config.STORAGE_ENCRYPTION_KEY ?? '',
  requestTimeoutMs: toNumber(Config.REQUEST_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
} as const;

export const TOKEN_TIMEOUT_MS = 10000;
