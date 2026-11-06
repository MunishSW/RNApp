import { createMMKV } from 'react-native-mmkv';
import { ENV } from '../config/env';

/** Encrypted key of the non-logged token (BRD 4.4.3). */
export const NON_LOGGED_TOKEN_KEY = 'auth_token_Nonlogged';

export interface SecureStorage {
  set(key: string, value: string): void;
  get(key: string): string | undefined;
  remove(key: string): void;
}

let override: SecureStorage | null | undefined;
let mmkvInstance: SecureStorage | null | undefined;

function createMmkvStorage(): SecureStorage | null {
  // No key configured: never persist (constitution IV: tokens only in memory plus encrypted storage).
  if (!ENV.storageEncryptionKey) {
    return null;
  }
  const mmkv = createMMKV({ id: 'bhfl-secure', encryptionKey: ENV.storageEncryptionKey });
  return {
    set: (key, value) => mmkv.set(key, value),
    get: key => mmkv.getString(key),
    remove: key => {
      mmkv.remove(key);
    },
  };
}

function resolve(): SecureStorage | null {
  if (override !== undefined) {
    return override;
  }
  if (mmkvInstance === undefined) {
    mmkvInstance = createMmkvStorage();
  }
  return mmkvInstance;
}

export const secureStorage: SecureStorage = {
  set: (key, value) => resolve()?.set(key, value),
  get: key => resolve()?.get(key),
  remove: key => resolve()?.remove(key),
};

/** Test seam. Pass undefined to restore the real storage. */
export function setSecureStorageForTests(storage: SecureStorage | null | undefined): void {
  override = storage;
}
