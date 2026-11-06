# Contract: generatetoken (BRD 4.4, 8.1, 8.2, 8.2.1, 8.3)

Purpose: obtain the non-logged (app-level) token. Spec: FR-4.4-01 to FR-4.4-06, TV-1, BR-2, BR-3.

| Item | Value |
|---|---|
| Endpoint | `authservices/api/auth/v1/generatetoken` |
| Method | POST |
| Base | `ENV.authApiUrl` from build config. BRD default `https://customer-n2p.bajajhousingfinance.in/authservices/api/auth/` (confirm per environment, O-09) |
| Auth | None. App credentials are in the body, encrypted |
| Headers | `Content-Type: application/json`; `X-BHFL-Entity: mobileapp`. No Bearer, no `app-version` / `platform` / `device-details` (call is `skipAuth`) |
| Timeout | 10 s (PERF-2) |

## Request

| Field | Type | Description |
|---|---|---|
| `username` | string, field-encrypted | from `NON_LOGGED_AUTH_USERNAME` |
| `password` | string, field-encrypted | from `NON_LOGGED_AUTH_PASSWORD` |

Sample: `{ "username": "<encrypted>", "password": "<encrypted>" }`

## Field encryption (BRD 8.2.1)

The two values are encrypted separately, one at a time, before sending.

| Item | Requirement |
|---|---|
| Algorithm | AES-128 in GCM mode, no padding (`AES/GCM/NoPadding`) |
| Key | 128-bit (16 bytes) shared app key from build config (`FIELD_ENCRYPTION_KEY`). Value never written in docs or logs |
| IV (nonce) | 12 random bytes from a cryptographically secure generator, fresh for every encryption, never reused |
| Authentication tag | 128 bits, appended to the ciphertext |
| AAD | fixed 16-byte value agreed with the backend, from build config (`FIELD_ENCRYPTION_AAD`). Value not written in docs |
| Plaintext encoding | UTF-8 bytes, encrypted directly (no hex or other pre-encoding) |
| Output format | `base64url(IV) + ':' + base64url(ciphertext + tag)`, URL-safe base64, `=` padding removed |
| Response fields | any server field encrypted this way is decrypted with the same key and AAD; a failed tag check is an error and the value is discarded |
| Scope | the `generatetoken` credentials only; other endpoints send plain JSON over TLS |

Open: static shared key and fixed AAD, rotation plan or per-session exchange (O-16, Backend / InfoSec).

## Response

Success: `{ "token": "<jwt>" }`. Accepted only if `token` is a non-empty string (TV-1).

| Outcome | App behaviour |
|---|---|
| Success | token held in memory and mirrored to encrypted storage key `auth_token_Nonlogged` |
| Any failure (network, 10 s timeout, 4xx, 5xx, malformed body) | swallowed, no UI, Home stays usable; next app start or Home mount tries again (NLH-E01) |

No error body is parsed: there is no error contract for this call.

## Call pattern

- Once at app start (shared promise) and once more when Home mounts (BR-2, FR-4.4-01).
- Requests made while it is in flight wait for it (BR-3, FR-4.4-04).
- Credentials are never logged in release builds.

## Tests (contract level)

- Request body fields are encrypted in the `base64url:base64url` format, IV differs per call.
- Timeout fires at 10 s; failure produces no thrown error to the UI.
- Empty or non-string `token` is rejected.
- Headers contain no Authorization.
