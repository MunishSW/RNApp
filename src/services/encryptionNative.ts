import { Buffer, createCipheriv, randomBytes } from 'react-native-quick-crypto';
import { ENV } from '../config/env';
import { createFieldEncryptor, decodeKeyMaterial, SealResult } from './encryption';

let encryptor: ((plain: string) => string) | null = null;

function seal(key: Uint8Array, aad: Uint8Array, iv: Uint8Array, plaintext: Uint8Array): SealResult {
  const cipher = createCipheriv('aes-128-gcm', Buffer.from(key), Buffer.from(iv));
  cipher.setAAD(Buffer.from(aad));
  const head = cipher.update(Buffer.from(plaintext));
  const tail = cipher.final();
  const ciphertext = new Uint8Array(head.length + tail.length);
  ciphertext.set(head, 0);
  ciphertext.set(tail, head.length);
  return { ciphertext, tag: new Uint8Array(cipher.getAuthTag()) };
}

function getEncryptor(): (plain: string) => string {
  if (!encryptor) {
    const key = decodeKeyMaterial(ENV.fieldEncryptionKey, 'FIELD_ENCRYPTION_KEY');
    const aad = decodeKeyMaterial(ENV.fieldEncryptionAad, 'FIELD_ENCRYPTION_AAD');
    encryptor = createFieldEncryptor({
      randomBytes: size => new Uint8Array(randomBytes(size)),
      sealer: { seal: (iv, pt) => seal(key, aad, iv, pt) },
    });
  }
  return encryptor;
}

/** Encrypts one field (username or password) for the token request. Key and AAD come from build config. */
export function encryptField(plain: string): string {
  return getEncryptor()(plain);
}
