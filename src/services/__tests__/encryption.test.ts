/// <reference types="node" />
import * as nodeCrypto from 'crypto';
import {
  AesGcmSealer,
  createFieldEncryptor,
  decodeKeyMaterial,
  toBase64Url,
} from '../encryption';

const KEY = Uint8Array.from({ length: 16 }, (_, i) => i);
const AAD = Uint8Array.from({ length: 16 }, (_, i) => 15 - i);

const nodeSealer: AesGcmSealer = {
  seal(iv, plaintext) {
    const cipher = nodeCrypto.createCipheriv('aes-128-gcm', KEY, iv);
    cipher.setAAD(AAD);
    const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
    return { ciphertext: new Uint8Array(ciphertext), tag: new Uint8Array(cipher.getAuthTag()) };
  },
};

function decrypt(output: string): string {
  const [ivPart, bodyPart] = output.split(':');
  const iv = Buffer.from(ivPart, 'base64url');
  const body = Buffer.from(bodyPart, 'base64url');
  const tag = body.subarray(body.length - 16);
  const ciphertext = body.subarray(0, body.length - 16);
  const decipher = nodeCrypto.createDecipheriv('aes-128-gcm', KEY, iv);
  decipher.setAAD(AAD);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString('utf8');
}

describe('field encryption (AES-128-GCM)', () => {
  // Covers: HOME_TOKEN_TC_006 - fields are encrypted, not plain text, in the agreed format
  it('[HOME_TOKEN_TC_006] outputs base64url(IV):base64url(ciphertext+tag) and round-trips', () => {
    const iv = Uint8Array.from({ length: 12 }, (_, i) => i + 1);
    const encrypt = createFieldEncryptor({ randomBytes: () => iv, sealer: nodeSealer });
    const out = encrypt('MOBILE_APP_N2P');
    expect(out).toMatch(/^[A-Za-z0-9_-]+:[A-Za-z0-9_-]+$/);
    expect(out).not.toContain('=');
    expect(out).not.toContain('MOBILE_APP_N2P');
    expect(out.split(':')[0]).toBe(Buffer.from(iv).toString('base64url'));
    // ciphertext (same length as UTF-8 plaintext) plus a 16-byte tag
    expect(Buffer.from(out.split(':')[1], 'base64url').length).toBe(14 + 16);
    expect(decrypt(out)).toBe('MOBILE_APP_N2P');
  });

  // Covers: HOME_TOKEN_TC_006 - a fresh 12-byte IV for every encryption
  it('uses a fresh random 12-byte IV each time', () => {
    let counter = 0;
    const sizes: number[] = [];
    const encrypt = createFieldEncryptor({
      randomBytes: size => {
        sizes.push(size);
        counter += 1;
        return new Uint8Array(size).fill(counter);
      },
      sealer: nodeSealer,
    });
    const a = encrypt('same');
    const b = encrypt('same');
    expect(sizes).toEqual([12, 12]);
    expect(a.split(':')[0]).not.toBe(b.split(':')[0]);
    expect(a).not.toBe(b);
  });

  it('encrypts UTF-8 text directly', () => {
    const iv = new Uint8Array(12).fill(9);
    const encrypt = createFieldEncryptor({ randomBytes: () => iv, sealer: nodeSealer });
    expect(decrypt(encrypt('pässwörd$1'))).toBe('pässwörd$1');
  });

  it('base64url has no padding and uses - and _', () => {
    expect(toBase64Url(Uint8Array.from([251, 255, 254]))).toBe('-__-');
    expect(toBase64Url(Uint8Array.from([1]))).toBe('AQ');
    expect(toBase64Url(Uint8Array.from([1, 2]))).toBe('AQI');
  });

  it('decodes key material from hex, 16-char text and base64', () => {
    expect(Array.from(decodeKeyMaterial('000102030405060708090a0b0c0d0e0f', 'k'))).toEqual(
      Array.from(KEY),
    );
    expect(decodeKeyMaterial('abcdefghijklmnop', 'k')).toHaveLength(16);
    expect(
      Array.from(decodeKeyMaterial(Buffer.from(KEY).toString('base64'), 'k')),
    ).toEqual(Array.from(KEY));
    expect(() => decodeKeyMaterial('short', 'FIELD_ENCRYPTION_KEY')).toThrow(
      'FIELD_ENCRYPTION_KEY',
    );
  });
});
