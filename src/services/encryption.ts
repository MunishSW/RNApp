/* eslint-disable no-bitwise -- base64 and UTF-8 encoding need bit operations */
/**
 * AES-128-GCM field encryption, pure part (no native imports so it is unit-testable).
 *
 * Output format (FR-012): base64url(IV) + ":" + base64url(ciphertext + tag), no "=" padding.
 * IV: 12 random bytes per encryption. Tag: 128 bit, appended to the ciphertext.
 * Plaintext: UTF-8, encrypted directly (no hex step).
 */

export interface SealResult {
  ciphertext: Uint8Array;
  tag: Uint8Array;
}

export interface AesGcmSealer {
  seal(iv: Uint8Array, plaintext: Uint8Array): SealResult;
}

export interface FieldEncryptorDeps {
  randomBytes: (size: number) => Uint8Array;
  sealer: AesGcmSealer;
}

export const GCM_IV_BYTES = 12;
export const KEY_BYTES = 16;

const B64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

/** base64url without padding. Own implementation: no reliance on btoa or Buffer under Hermes. */
export function toBase64Url(bytes: Uint8Array): string {
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < bytes.length ? bytes[i + 1] : 0;
    const b2 = i + 2 < bytes.length ? bytes[i + 2] : 0;
    out += B64[b0 >> 2];
    out += B64[((b0 & 3) << 4) | (b1 >> 4)];
    if (i + 1 < bytes.length) {
      out += B64[((b1 & 15) << 2) | (b2 >> 6)];
    }
    if (i + 2 < bytes.length) {
      out += B64[b2 & 63];
    }
  }
  return out;
}

/** UTF-8 encoding without TextEncoder (keeps the helper independent of the runtime). */
export function utf8Encode(value: string): Uint8Array {
  const out: number[] = [];
  for (const ch of value) {
    const cp = ch.codePointAt(0) as number;
    if (cp < 0x80) {
      out.push(cp);
    } else if (cp < 0x800) {
      out.push(0xc0 | (cp >> 6), 0x80 | (cp & 0x3f));
    } else if (cp < 0x10000) {
      out.push(0xe0 | (cp >> 12), 0x80 | ((cp >> 6) & 0x3f), 0x80 | (cp & 0x3f));
    } else {
      out.push(
        0xf0 | (cp >> 18),
        0x80 | ((cp >> 12) & 0x3f),
        0x80 | ((cp >> 6) & 0x3f),
        0x80 | (cp & 0x3f),
      );
    }
  }
  return new Uint8Array(out);
}

function concat(a: Uint8Array, b: Uint8Array): Uint8Array {
  const out = new Uint8Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}

export function createFieldEncryptor(
  deps: FieldEncryptorDeps,
): (plain: string) => string {
  return plain => {
    const iv = deps.randomBytes(GCM_IV_BYTES);
    const { ciphertext, tag } = deps.sealer.seal(iv, utf8Encode(plain));
    return `${toBase64Url(iv)}:${toBase64Url(concat(ciphertext, tag))}`;
  };
}

/**
 * Decodes 16 bytes of key material from build config: 32 hex chars, else a
 * 16-character string taken as UTF-8, else base64/base64url of 16 bytes.
 */
export function decodeKeyMaterial(value: string, label: string): Uint8Array {
  const v = value.trim();
  if (/^[0-9a-fA-F]{32}$/.test(v)) {
    const out = new Uint8Array(KEY_BYTES);
    for (let i = 0; i < KEY_BYTES; i++) {
      out[i] = parseInt(v.slice(i * 2, i * 2 + 2), 16);
    }
    return out;
  }
  const utf8 = utf8Encode(v);
  if (utf8.length === KEY_BYTES) {
    return utf8;
  }
  const b64 = fromBase64(v);
  if (b64 && b64.length === KEY_BYTES) {
    return b64;
  }
  throw new Error(`${label} must be 16 bytes (32 hex chars, 16 chars, or base64)`);
}

function fromBase64(value: string): Uint8Array | null {
  const clean = value.replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, '');
  if (!/^[A-Za-z0-9+/]*$/.test(clean) || clean.length === 0) {
    return null;
  }
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const out: number[] = [];
  let buffer = 0;
  let bits = 0;
  for (const ch of clean) {
    buffer = (buffer << 6) | alphabet.indexOf(ch);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out.push((buffer >> bits) & 255);
    }
  }
  return new Uint8Array(out);
}
