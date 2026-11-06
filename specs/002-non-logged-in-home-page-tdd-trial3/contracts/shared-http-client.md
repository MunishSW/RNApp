# Contract: Shared HTTP client (BRD 3.1, 4.4.7, 8.1.1, 8.4.3)

Single entry point for all network calls (constitution V). Features and services call `post()`; nothing in `src/features/` imports the HTTP library directly. Spec: FR-028, FR-029, FR-032, BR-3.

## Request side (exists today)

| Behaviour | Rule |
|---|---|
| Authorization | if the request has no `Authorization` header, wait for the registered token provider (which waits for any in-flight token request) and add `Authorization: Bearer <token>` |
| Standard headers | `app-version` (installed version), `platform` (`android` / `ios`), `device-details` (JSON: platform, brand, model, system version; no unique ids, no personal data) |
| `skipAuth` | token call only: no Authorization and none of the standard headers |
| Base URL and timeout | default base `ENV.apiUrl`, default timeout `ENV.requestTimeoutMs`; per-call override for the auth host (10 s) and the bare host (FAQ) |
| Token source | only the non-logged token slot; a logged-in token is never reused as the non-logged token |

## Response side (to add, gap G-1)

On a response that matches an auth-failure signal (see error-behaviour.md):

1. Skip if the call is `skipAuth`, if it is already a replay, or if a logged-in token exists.
2. Request a fresh non-logged token (`requestNonLoggedToken`, shared in-flight promise).
3. If a token came back, replay the **same** request once with the new Bearer header; mark it as a replay.
4. If the replay succeeds, return its result.
5. If there is no new token or the replay fails, return or throw the **original** error or body. No session-expired popup is raised here.

HTTP 200 with `returnStatus.returnCode` `401` is detected from the body, so the check runs on successful HTTP responses as well as failures. Non-auth failures pass through untouched.

## Error shaping (to add, gap G-2)

Failures expose `status`, `errorCategory` and `retryable` (error-behaviour.md). Used for debug logging and tests; release logs carry status codes only.

## Logging

Debug builds: status and latency per call. Release: status codes only. Never log credentials, tokens, headers or bodies.

## Tests (contract level)

- Bearer and the three standard headers on a normal call; absent on `skipAuth`.
- A call made while the token request is in flight waits and does not 401.
- Each of the three auth-failure signals triggers exactly one token refresh and one replay.
- A second auth failure on the replay does not trigger a third call; the original error passes on.
- A logged-in token present: no retry.
- Non-auth failures (500, network) are not replayed.
- Existing `httpClient.test.ts` cases still pass unchanged.
