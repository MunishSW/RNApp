# Contract: Error behaviour (BRD 8.4, 8.5, 10)

The BRD says no separate backend error specification has been issued for the three services. This is the shape the app is built to read; Backend must confirm it (O-12, spec FR-4.4-09 and FR-4.4-10).

## Shared backend envelope (8.4.1)

| Field | Type | Meaning |
|---|---|---|
| `returnStatus.returnCode` | string | `0000` generic success; `401` session or token expired; `API_3000` also an auth failure; `9999` backend had difficulty processing |
| `returnStatus.returnMessage` | string | human-readable; shown to the user only where the table below says so |
| `statusCode` | string or number | optional; read on HTTP 400 responses; `401` or `API_3000` is an auth failure |
| `message` | string | optional; read on HTTP 400 responses as error text |

## Auth-failure signals, all calls (8.4.3)

| Case | Signal |
|---|---|
| HTTP 401 | status code only |
| HTTP 400 with auth code | body `statusCode` or `returnStatus.returnCode` equal to `401` or `API_3000` |
| HTTP 200 with session expiry | body `returnStatus.returnCode` equal to `401` |

With no logged-in session, an auth failure regenerates the non-logged token and retries the call **once**. If the retry fails, the original error is passed on and no session-expired popup is shown. This applies to every call, including the version service: no session-expired popup anywhere on this page.

## Per-call behaviour (8.4.2)

| Call | Signals read | App behaviour |
|---|---|---|
| generatetoken | none; only a non-empty `token` on success | every failure swallowed; no UI; Home usable |
| fetch-faq | HTTP failure of any kind; body not read except auth-failure rules | generic server-error dialog; an auth failure first triggers one token refresh and one retry |
| forceUpdate/Secured, forceUpdatev1/Secured | `returnStatus.returnMessage` equal to `success` is success; `returnStatus.returnCode` `401` is session expired; anything else is an error | 401: **no popup** (owner decision 2026-11-06; BRD 8.4.2 said show `returnMessage`, then "Okay" and logout); the logged-in token is cleared silently. Other errors: show `returnMessage`, or the generic server-error text if empty. Null or empty body: no dialog (fail open) |

## Client-derived error fields (8.4.4)

| Field | Type | Rule |
|---|---|---|
| `status` | number | HTTP status of the failed call |
| `errorCategory` | `Network` \| `Auth` \| `Server` \| `Validation` | derived by the client |
| `retryable` | boolean | true for network, timeout, 429 and 5xx |

## Client-side condition codes (8.5)

| Code | Meaning | User sees |
|---|---|---|
| NLH-E01 | generatetoken failed or timed out | nothing |
| NLH-E02 | fetch-faq failed (network, timeout, 4xx, 5xx) | "Your request could not be processed at this moment. Request you to try again after sometime." |
| NLH-E03 | fetch-faq returned empty or non-array | nothing (stays on Home) |
| NLH-E04 | forceUpdate returned null or failed | nothing (fail open) |
| NLH-E05 | forceUpdate `returnCode` 401 | nothing (no popup; owner decision) |
| AUTH-2002 | session or token expired | "Your session expired. Please sign in again." |
| SYS-9001 | backend timeout | "Service temporarily unavailable." |
| SYS-9002 | network error | "Check your connection and retry." |

`NLH-E…` are client IDs, not backend codes. Backend codes for these services are not documented (O-12). Where AUTH-2002, SYS-9001 and SYS-9002 appear on this page is not defined in the BRD: no Home surface is added for them.

## Strategy (BRD 10)

| Category | Handling |
|---|---|
| Silent background | swallow, keep UI usable, fail open (token, version) |
| User-initiated API failure | blocking spinner clears; common error dialog with "Okay" (FAQ) |
| Empty but successful | no dialog; stay (FAQ empty) |
| Blocking policy | non-dismissable dialog (maintenance, mandatory update) |
| Navigation | Pay Now is a header and back button only; no network content, so no error state |

Messages are plain language; no codes, stack traces or raw server text except the version-service message designed for display. Every error gives a next action. Errors are logged without personal data. No automatic retry on FAQ beyond the auth retry; the token call is retried by the next app start or Home mount.
