# Contract: fetch-faq (BRD 4.5, 8.1, 8.3.1, 8.4.2)

Purpose: fetch the FAQ list when nothing is cached. Spec: FR-4.5-01 to FR-4.5-08, FR-4.4-08, TV-2, BR-6.

| Item | Value |
|---|---|
| Endpoint | `FormBasedQuery/Services/v1/fetch-faq` |
| Method | POST |
| Base | `ENV.apiBaseUrl`, the bare host, **not** the `MobileAppWrapper/Services` wrapper path (BRD 8.1.1). Confirm per environment (O-09) |
| Auth | Bearer non-logged token, added by the shared client |
| Headers | `Authorization: Bearer <token>`; `app-version`; `platform` (`android` / `ios`); `device-details` (JSON). **No `X-BHFL-Auth`** (clarification O-10 answer B). Owner: not needed |
| Timeout | `ENV.requestTimeoutMs` (PERF-3) |

## Request

Body: empty object `{}`.

## Response

Success: JSON array.

```json
[ { "question": "How do I pay my EMI?", "answer": "..." } ]
```

| Field | Type | Note |
|---|---|---|
| `[].question` | string | FAQ heading |
| `[].answer` | string | FAQ body; may contain markup, display rules open (O-11) |

## Behaviour

| Result | App behaviour | Spec |
|---|---|---|
| Cached list exists | no request, open FAQ at once | FR-4.5-02, P-07 |
| Non-empty array | store, close spinner, open FAQ | FR-4.5-04, P-08 |
| Empty array | close spinner, stay on Home, no dialog (NLH-E03) | FR-4.5-05, N-03 |
| Non-array body | treated as empty (TV-2), no crash | FR-4.5-05, N-04 |
| HTTP failure of any kind | close spinner, error dialog "Your request could not be processed at this moment. Request you to try again after sometime.", "Okay", `dialog_shown` (NLH-E02) | FR-4.5-06, N-02 |
| Auth failure (see error-behaviour.md) | one token refresh and one retry; if that fails, the error dialog above | FR-4.4-09 |

The failure body is not read, except to detect an auth failure. No automatic retry beyond the one auth retry; the user retries by tapping "FAQs" (FR-4.5-07). Calls are safe to repeat.

## Tests (contract level)

- Empty POST body.
- Header set equals the list above and has no `X-BHFL-Auth`.
- Array, empty array, object body and 500 each give the outcome in the table.
- Double tap while loading sends one request.
