# Research: Non-Logged-In Home Page

Each item: **Decision**, **Rationale**, **Alternatives considered**. Items marked **Assumption** need an owner to confirm before `/speckit-tasks`. Nothing here adds scope beyond the BRD.

## 1. Duplicate, separate feature; shared infrastructure stays single

- **Decision** (owner, 2026-11-06): build `src/features/nonLoggedInHome/` as a duplicate of the Home feature with **separate files**: its own screen, components, hooks, constants, types, tests, icon copies and guarded-navigate hook. It imports nothing from `features/nonLoggedHome/`, and 001's files are not edited. Shared infrastructure (`src/services`, `src/store`, `src/theme`, `src/navigation`, `src/config`) is reused, with gaps fixed by new files plus a minimal hook-up.
- **Rationale**: owner instruction; constitution V (one HTTP client) is why the client and stores are not duplicated.
- **Alternatives**: import 001's components (rejected by owner); duplicate the HTTP client and stores too (rejected: breaks constitution V and splits token state).

## 2. One retry after token refresh belongs in the shared client (G-1)

- **Decision**: new file `src/services/authRetry.ts` holds the logic; `httpClient.ts` gets a minimal hook-up. On an auth failure (HTTP 401; HTTP 400 with body `statusCode` or `returnStatus.returnCode` "401" or "API_3000"; HTTP 200 with `returnStatus.returnCode` "401") and no logged-in token: request a fresh non-logged token via `requestNonLoggedToken()`, set the new Bearer header and replay the call **once**. If the replay fails, pass the original error or body on. Skip calls marked `skipAuth`. Mark a replayed request so it can never retry twice.
- **Rationale**: BRD 8.4.3; spec FR-4.4-09.
- **Alternatives**: retry in each hook (rejected: duplicates logic, violates V).

## 3. Error classification (G-2)

- **Decision**: new file `src/services/apiErrors.ts` returning `{ status, errorCategory: 'Network' | 'Auth' | 'Server' | 'Validation', retryable }`. `retryable` is true for network, timeout, 429 and 5xx (BRD 8.4.4). Used for debug logging and tests only; user-facing behaviour follows `contracts/error-behaviour.md`.
- **Rationale**: BRD 8.4.4.

## 4. No `X-BHFL-Auth` on any call (O-10, spec FR-4.4-08)

- **Decision** (owner, 2026-11-06): no request on this page carries `X-BHFL-Auth`; FAQ and version calls use the app token and the standard headers only. The shared client and services already behave this way; add tests asserting the header is absent.
- **Rationale**: clarification answer B for FAQ, extended by the owner to the version services. Closes the earlier open question.

## 5. Pay Now is a header and back button only; no WebView (O-05, G-4)

- **Decision** (owner, 2026-11-06): no WebView library. Tapping "Pay Now" opens a new route `NonLoggedInPayNow` rendering `PayNowScreen.tsx`: a header titled "Pay Now" and a back button that returns to Home. No web content, loader or error state.
- **Rationale**: owner instruction; overrides the BRD wording (4.2.6, 4.2.7, 7.3 WebView and host allow-list). A BRD change request is needed to keep the document aligned.
- **Consequence**: `PORTAL_BASE_URL` is no longer read by this feature; scenarios N-10 and N-11 in the spec were reworded.

## 6. Fonts (G-3)

- **Decision**: `Rubik-SemiBold.ttf` and `Rubik-Bold.ttf` were copied from the Downloads/Rubik folder into `src/assets/fonts/` (Regular and Medium already there; `react-native.config.js` already links that folder). Add `fontFamilySemiBold` and `fontFamilyBold` tokens. The Home page uses Regular (headline, tile labels) and Medium ("Login") only (spec FR-4.1-04).
- **Rationale**: owner supplied the files. After adding fonts the native app must be rebuilt for them to link.

## 7. Gradient

- **Decision**: render the CTA gradient with `react-native-svg` (already installed) using the feature's own copy of the CSS-angle-to-line helper (`components/gradient.ts`). Stops: `#FF512F` at 5.5578%, `#F09819` at 94.442%, angle 133.8255 degrees, from `tokens.ts`.
- **Rationale**: no gradient library in the project; a local copy keeps the feature independent of 001.

## 8. Dark mode and high contrast

- **Decision**: keep dark and high-contrast sets aliased to light in `tokens.ts` until Design supplies values (spec FR-4.1-06). Illustration and CTA are exempt from remapping.
- **Rationale**: no remapped values exist in Figma node 2:937 or the BRD. **Open item for Design.**

## 9. Version-service 401 shows no popup (spec FR-4.7-08, N-08)

- **Decision** (owner, 2026-11-06): a 401 from the version service shows no popup and no dialog. The 002 hook maps the shared `sessionExpired` outcome to nothing and clears the logged-in token silently. The shared version service is not changed. The app-wide session-expired popup is also not shown after a failed retry (BRD 8.4.3), so the two rules now agree.
- **Rationale**: owner instruction; overrides BRD 4.7.4 and 8.4.2 ("show returnMessage, then Okay and logout").
- **Note**: "logged-in token cleared silently" keeps the logout intent of the BRD without a popup; tell me if logout should also be dropped.

## 10. `forceUpdatev1/Secured` (G-5)

- **Decision**: document the contract. Home calls `forceUpdate/Secured`. BRD 4.7.7 says v1 is for "two allow-listed test CIFs"; a visitor has no CIF and the list is not in the BRD.
- **Rationale**: not inventing a selection rule.
- **Open**: who selects v1 and how. **NEEDS CLARIFICATION** (Backend / Product).

## 11. Base URLs per environment (O-09)

- **Decision**: read all hosts from build config (`AUTH_API_URL`, `API_BASE_URL`, `API_URL`); document the BRD default auth base in the contract with "confirm per environment". No value is committed.
- **Rationale**: constitution IV and BRD 2.6, 8.1.1.

## 12. Navigation

- **Decision**: add routes `NonLoggedInHome` and `NonLoggedInPayNow` (so 001's routes are untouched) and use the feature's own guarded-navigate hook; all other destinations reuse existing routes. Track Application opens the `TrackApplication` route (own BRD, spec FR-4.2-07); Find Us opens `BranchLocator`; destinations are stubs owned by other modules.
- **Rationale**: spec clarifications 2026-11-06.

## 13. Version message constants live in a feature folder

- **Observation**: the shared `src/services/versionService.ts` imports `SERVER_ERROR_MESSAGE` from `features/nonLoggedHome/nonLoggedHomeConstants` (spec 001's folder).
- **Decision**: leave it untouched so 001 keeps working; the new feature never imports from 001 and keeps its own copy of the text in `nonLoggedInHome/nonLoggedInHomeConstants.ts`. Follow-up when one Home feature is retired: move the shared text to a shared constants file (constitution VI).
- **Rationale**: owner asked for separate files; editing the shared service would touch 001's behaviour.

## 14. Numeric targets (O-14)

- **Decision**: PERF-1, PERF-4, AVL-2, log retention and minimum OS versions stay open. Tests for them are written as manual checks with a placeholder target until Product supplies numbers.
- **Rationale**: do not guess (spec rule).

## Items that still need an owner before tasks

| Item | Owner |
|---|---|
| Item 10: `forceUpdatev1` selection rule | Backend / Product |
| BRD change request for the owner overrides (no WebView, Pay Now header and back only, no popup on 401, no `X-BHFL-Auth`) | Product |
| O-09, O-11, O-13, O-14, O-16 and the narrowed O-03, O-06, O-12 items | per spec "Open Clarifications" |

Closed by the owner on 2026-11-06: WebView dependency, font files, version-service 401, `X-BHFL-Auth`, Pay Now view.
