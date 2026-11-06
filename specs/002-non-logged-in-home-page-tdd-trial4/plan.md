# Implementation Plan: Non-Logged-In (Pre-Login) Home Page

**Branch**: `002-non-logged-in-home-page` | **Date**: 2026-11-06 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-non-logged-in-home-page/spec.md`, BRD `BRD_NonLoggedIn_Home_Page.docx` sections 3, 7 and 8 (the file is not at `docs/`; it was read from `C:\Users\MunishVira\Downloads\`), Figma node `2:937`.

## Summary

Build the pre-login Home screen under `src/features/nonLoggedInHome/`: blue page, illustration, headline, six quick-link tiles, one "Login" button; plus the background non-logged token, the cache-first FAQ flow, the Customer Care popup, the force-update / maintenance gate, the Android exit confirmation and the focus reset (spec FR-001 to FR-065, FR-066 to FR-069).

The project already has shared infrastructure (HTTP client, auth, FAQ and version services, encrypted storage, Redux slices, theme tokens, route table) and an earlier Home implementation from spec 001 (`src/features/nonLoggedHome/`). **Owner decision (2026-11-06): build a duplicate, separate Home feature.** Everything Home-specific (screen, tile, grid, popups, dialogs, hooks, constants, types, tests) is written as **new files** under `src/features/nonLoggedInHome/`, with its own routes, and **imports nothing from `features/nonLoggedHome/`**. Spec 001's files are not edited. Only the shared infrastructure below the feature layer is reused (one HTTP client, one token store), and where it has gaps the fix is added as **new files** with a minimal hook-up. Remaining engineering gaps: the missing auth-failure retry and error classification (see "Gaps against the request").

**Owner decisions applied to this plan (2026-11-06)**: no WebView; Pay Now screen is a header and a back button only; a version-service 401 shows no popup; `X-BHFL-Auth` is not needed on any call; Rubik Regular, Medium, SemiBold and Bold are taken from `C:\Users\MunishVira\Downloads\Rubik` (copied into `src/assets/fonts/`).

## Technical Context

**Language/Version**: TypeScript (strict, from `@react-native/typescript-config`), React 19.3, React Native 0.88.1, Hermes

**Primary Dependencies** (already installed): `@react-navigation/native` + `native-stack`, `@reduxjs/toolkit` + `react-redux`, `axios` (behind the shared client only), `react-native-mmkv`, `react-native-quick-crypto`, `react-native-quick-base64`, `react-native-svg`, `react-native-safe-area-context`, `react-native-device-info`, `react-native-config`. No new dependency is added (no WebView).

**Storage**: non-logged token in memory (Redux `token` slice) mirrored to encrypted MMKV key `auth_token_Nonlogged`; no persistence when `STORAGE_ENCRYPTION_KEY` is empty. FAQ list in memory (Redux `faq` slice). Nothing else persisted.

**Testing**: Jest 29 with `@react-native/jest-preset`, React Native Testing Library 13; service tests stub the axios adapter; accessibility tests per screen (constitution III); manual checks documented in `quickstart.md`.

**Target Platform**: Android and iOS from one codebase. Reference frame 360 x 812; must scroll from 320 x 568 up to tablet.

**Project Type**: mobile app (single React Native project)

**Performance Goals**: Home draws without waiting on any background call (PERF-1 target number is open, O-14: **NEEDS CLARIFICATION**, owner Product / Engineering). Token call times out at 10 s (PERF-2). FAQ spinner always clears (PERF-3). No endless animation loops, no leaked listeners (PERF-5).

**Constraints**: Home renders fully offline (AVL-1). Background calls fail open and silent. Default look at text 1x, light theme equals Figma. No features beyond the BRD.

**Scale/Scope**: one screen, six tiles, three popups / dialogs, three service calls, four state slices (already present).

**Open spec markers carried into the plan** (not resolved here): O-01, O-02, O-04 (confirmations), O-09 (per-environment URLs, supplied by build config), O-11 (FAQ answer format), O-13 (tablet layout), O-14 (numeric targets), O-15 (Figma layer name), O-16 (static key rotation), O-03 (analytics link name only), O-06 (contact values only), O-08 (screen-view event), O-12 (Backend confirmation of the error shape). Closed by owner decision: O-05, O-10 (all calls).

## Constitution Check

*GATE: passed before Phase 0 with the notes below. Re-checked after Phase 1 design: see the end of this section.*

| Principle / Gate | Plan response | Status |
|---|---|---|
| I Requirements are the source of truth (G1) | Every task will cite an FR / BR / scenario ID. No item outside the BRD. All user-facing strings live in `nonLoggedInHomeConstants.ts`. Unknowns stay as spec markers | Pass |
| II Design fidelity (G2) | Raw hex only in `src/theme/tokens.ts`. Tokens map Figma values (table below). Dark / high-contrast sets still alias light because Design has not supplied remapped values | Pass with open item (Design) |
| III Accessibility (G2) | Roles, labels, states, announcements, 44 x 44 targets, stacking at scale >= 1.5, modal popup. Accessibility test file for the screen | Pass |
| IV Security (G3) | TLS only; field encryption for the token credentials; secrets from build config only, never logged; token in memory plus encrypted storage; root / jailbreak gates run at app root, not in this feature. Static shared key and fixed AAD accepted per BRD, flagged O-16 | Pass with accepted risk (O-16) |
| V API layer (G3) | All calls through the shared client. Retry and error classification are added to the **shared** client, never to the feature. Background failures fail open; FAQ failure shows the standard dialog; typed contracts; malformed responses treated as empty | Pass, after shared-client extension |
| VI Code quality (G3) | Strict TS, no `any`; logic in hooks / services / slices; components render only; explicit back targets; guarded navigation (no duplicate push). One existing violation to fix: the shared version service imports message text from a feature folder | Pass after fix |
| VII Quality gates (G4, G5) | Typecheck, lint and affected tests before merge; no previously passing test skipped; each test case mapped to an automated test or a documented manual check | Pass |
| VIII Performance and reliability (G3) | No awaiting of background calls at render; loaders cleared in `finally`; listeners and timers cleaned up; no animation loops | Pass |
| IX Change control | Scope = BRD sections 1-7 and 9 plus 8 contracts. Owner overrides of the BRD (no WebView, Pay Now header and back button only, no popup on version 401, no `X-BHFL-Auth`) are logged in the spec Clarifications and need a BRD change request to keep the BRD aligned | Pass with change request |

### Re-check after Phase 1 design

All gates still pass. The design adds no fields, endpoints or error codes beyond the BRD; the Pay Now screen is the one added destination, as the owner specified. One tension to note: constitution V asks for one shared HTTP client, so the duplicate feature does **not** duplicate the client or the token store; it duplicates the feature layer only. No unresolved decision blocks `/speckit-tasks`.

## Gaps against the request

| # | Request | Current repo | Plan |
|---|---|---|---|
| G-1 | One retry after token refresh on an auth failure | `src/services/httpClient.ts` has no retry and no response handling | New file `authRetry.ts` holds the logic; `httpClient.ts` gets a minimal hook-up (contracts/shared-http-client.md). Existing `httpClient.test.ts` must stay green |
| G-2 | Error behaviour of BRD 8.4 | No classification of `errorCategory` / `retryable` | New file `apiErrors.ts`; services and tests use it |
| G-3 | Rubik Regular, Medium, SemiBold, Bold | Only Regular and Medium were in `src/assets/fonts/` | **Closed**: `Rubik-SemiBold.ttf` and `Rubik-Bold.ttf` copied from `C:\Users\MunishVira\Downloads\Rubik`. Still to do: add the two font-family tokens. The Home page itself uses only Regular and Medium (spec FR-004) |
| G-4 | WebView for Pay Now | none installed | **Closed by owner**: no WebView. Pay Now is a screen with a header "Pay Now" and a back button only |
| G-5 | `forceUpdatev1/Secured` | Only `forceUpdate/Secured` is called | Contract documented. Home calls `forceUpdate/Secured`: v1 is "for two allow-listed test CIFs" and a visitor has no CIF. Selection rule: **NEEDS CLARIFICATION** (Backend / Product) |
| G-6 | Token, FAQ stores | `tokenSlice`, `faqSlice`, `offersSlice`, `sessionFlagsSlice` already exist | Reuse as is (shared state, one store) |
| G-7 | Existing Home feature | `src/features/nonLoggedHome/` (spec 001) implements the same BRD | **Owner: build a duplicate, separate feature.** New files only, no imports from 001, 001 untouched. See Complexity Tracking |
| G-8 | Version-service 401 | Shared `classifyVersionResponse` returns `sessionExpired` with a message | No shared change. The 002 hook maps `sessionExpired` to no popup and a silent clear of the logged-in token (FR-055) |
| G-9 | `X-BHFL-Auth` | Not sent by the shared client or services | No change; a test asserts it is absent on FAQ and version calls |

## Design tokens (Figma node 2:937 to `src/theme/tokens.ts`)

| Token | Value | Source node |
|---|---|---|
| `pageBackground` / `palette.brandBlue` | `#035795` | 2:937 |
| `textOnPage`, `ctaText` / `palette.white` | `#FFFFFF` | 2:942, 2:949, 2:967 |
| `palette.ctaStart` | `#FF512F` at 5.5578% | 2:967 |
| `palette.ctaEnd` | `#F09819` at 94.442% | 2:967 |
| `ctaGradient.angleDeg` | 133.8255 | 2:967 |
| Font families | `Rubik-Regular`, `Rubik-Medium`, `Rubik-SemiBold`, `Rubik-Bold` (SemiBold and Bold files now in `src/assets/fonts/`; tokens still to add) | file typography |
| Headline | 16 / line height 22, Regular, centred | 2:942 |
| Tile label | 11.889, Regular, centred, white | 2:949 |
| CTA label | 14, Medium, white | 2:967 |
| `layout.tileWidth` | 96 | 2:946 |
| `layout.iconHeight` | 40 | 2:947 |
| Tile padding | 12 horizontal, 16 vertical, gap 8, radius 4, transparent | 2:946 |
| Grid | width 331, row gap 18 | 2:944 |
| Illustration block | 311 x 310, padding top 22 / bottom 14, gap 28; art 172 x 140 | 2:940, 2:941 |
| CTA | 307 x 40, radius 82, padding 10 / 11.5, frame top y 588 | 2:966, 2:967 |

All of these except SemiBold and Bold already exist in `tokens.ts`. Components read tokens through `useTheme()`; no component holds a raw colour.

## Requirement -> File allocation

| FR | Files |
|---|---|
| FR-001 | `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx`, `src/features/nonLoggedInHome/nonLoggedInHomeConstants.ts`, `src/theme/tokens.ts`, `src/assets/nonLoggedInHome/index.ts` |
| FR-002 | `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx`, `src/features/nonLoggedInHome/nonLoggedInHomeConstants.ts`, `src/theme/tokens.ts`, `src/assets/nonLoggedInHome/index.ts` |
| FR-003 | `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx`, `src/features/nonLoggedInHome/nonLoggedInHomeConstants.ts`, `src/theme/tokens.ts`, `src/assets/nonLoggedInHome/index.ts` |
| FR-004 | `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx`, `src/features/nonLoggedInHome/nonLoggedInHomeConstants.ts`, `src/theme/tokens.ts`, `src/assets/nonLoggedInHome/index.ts` |
| FR-005 | `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx`, `src/features/nonLoggedInHome/nonLoggedInHomeConstants.ts`, `src/theme/tokens.ts`, `src/assets/nonLoggedInHome/index.ts` |
| FR-006 | `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx`, `src/features/nonLoggedInHome/nonLoggedInHomeConstants.ts`, `src/theme/tokens.ts`, `src/assets/nonLoggedInHome/index.ts` |
| FR-007 | `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx`, `src/features/nonLoggedInHome/nonLoggedInHomeConstants.ts`, `src/theme/tokens.ts`, `src/assets/nonLoggedInHome/index.ts` |
| FR-008 | `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx`, `src/features/nonLoggedInHome/nonLoggedInHomeConstants.ts`, `src/theme/tokens.ts`, `src/assets/nonLoggedInHome/index.ts` |
| FR-009 | `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx`, `src/features/nonLoggedInHome/nonLoggedInHomeConstants.ts`, `src/theme/tokens.ts`, `src/assets/nonLoggedInHome/index.ts` |
| FR-010 | `src/features/nonLoggedInHome/components/QuickLinkTile.tsx`, `src/features/nonLoggedInHome/components/QuickLinkGrid.tsx`, `src/features/nonLoggedInHome/hooks/useTextScaleLayout.ts` |
| FR-011 | `src/features/nonLoggedInHome/components/QuickLinkTile.tsx`, `src/features/nonLoggedInHome/components/QuickLinkGrid.tsx`, `src/features/nonLoggedInHome/hooks/useTextScaleLayout.ts` |
| FR-012 | `src/features/nonLoggedInHome/components/QuickLinkTile.tsx`, `src/features/nonLoggedInHome/components/QuickLinkGrid.tsx`, `src/features/nonLoggedInHome/hooks/useTextScaleLayout.ts` |
| FR-013 | `src/features/nonLoggedInHome/components/QuickLinkTile.tsx`, `src/features/nonLoggedInHome/components/QuickLinkGrid.tsx`, `src/features/nonLoggedInHome/hooks/useTextScaleLayout.ts` |
| FR-014 | `src/features/nonLoggedInHome/PayNowScreen.tsx`, `src/features/nonLoggedInHome/hooks/useHomeActions.ts`, `src/navigation/routes.ts`, `src/navigation/RootNavigator.tsx` |
| FR-015 | `src/features/nonLoggedInHome/hooks/useHomeActions.ts`, `src/features/nonLoggedInHome/hooks/useGuardedNavigate.ts` |
| FR-016 | `src/features/nonLoggedInHome/hooks/useHomeActions.ts`, `src/features/nonLoggedInHome/hooks/useGuardedNavigate.ts` |
| FR-017 | `src/features/nonLoggedInHome/hooks/useHomeActions.ts`, `src/features/nonLoggedInHome/hooks/useCustomerCare.ts`, `src/store/sessionFlagsSlice.ts` |
| FR-018 | `src/features/nonLoggedInHome/hooks/useHomeActions.ts`, `src/features/nonLoggedInHome/hooks/useGuardedNavigate.ts` |
| FR-019 | `src/features/nonLoggedInHome/hooks/useGuardedNavigate.ts` |
| FR-020 | `src/features/nonLoggedInHome/components/LoginButton.tsx`, `src/features/nonLoggedInHome/components/gradient.ts`, `src/features/nonLoggedInHome/hooks/useHomeActions.ts` |
| FR-021 | `src/features/nonLoggedInHome/components/LoginButton.tsx`, `src/features/nonLoggedInHome/components/gradient.ts`, `src/features/nonLoggedInHome/hooks/useHomeActions.ts` |
| FR-022 | `src/features/nonLoggedInHome/components/LoginButton.tsx`, `src/features/nonLoggedInHome/components/gradient.ts`, `src/features/nonLoggedInHome/hooks/useHomeActions.ts` |
| FR-023 | `src/features/nonLoggedInHome/components/LoginButton.tsx`, `src/features/nonLoggedInHome/components/gradient.ts`, `src/features/nonLoggedInHome/hooks/useHomeActions.ts` |
| FR-024 | `src/features/nonLoggedInHome/components/LoginButton.tsx`, `src/features/nonLoggedInHome/components/gradient.ts`, `src/features/nonLoggedInHome/hooks/useHomeActions.ts` |
| FR-025 | `src/services/authService.ts`, `src/services/httpClient.ts`, `src/services/authRetry.ts`, `src/services/apiErrors.ts`, `src/services/secureStorage.ts`, `src/services/encryption.ts`, `src/store/tokenSlice.ts`, `src/features/nonLoggedInHome/hooks/useHomeBootstrap.ts` |
| FR-026 | `src/services/authService.ts`, `src/services/httpClient.ts`, `src/services/authRetry.ts`, `src/services/apiErrors.ts`, `src/services/secureStorage.ts`, `src/services/encryption.ts`, `src/store/tokenSlice.ts`, `src/features/nonLoggedInHome/hooks/useHomeBootstrap.ts` |
| FR-027 | `src/services/authService.ts`, `src/services/httpClient.ts`, `src/services/authRetry.ts`, `src/services/apiErrors.ts`, `src/services/secureStorage.ts`, `src/services/encryption.ts`, `src/store/tokenSlice.ts`, `src/features/nonLoggedInHome/hooks/useHomeBootstrap.ts` |
| FR-028 | `src/services/authService.ts`, `src/services/httpClient.ts`, `src/services/authRetry.ts`, `src/services/apiErrors.ts`, `src/services/secureStorage.ts`, `src/services/encryption.ts`, `src/store/tokenSlice.ts`, `src/features/nonLoggedInHome/hooks/useHomeBootstrap.ts` |
| FR-029 | `src/services/authService.ts`, `src/services/httpClient.ts`, `src/services/authRetry.ts`, `src/services/apiErrors.ts`, `src/services/secureStorage.ts`, `src/services/encryption.ts`, `src/store/tokenSlice.ts`, `src/features/nonLoggedInHome/hooks/useHomeBootstrap.ts` |
| FR-030 | `src/services/authService.ts`, `src/services/httpClient.ts`, `src/services/authRetry.ts`, `src/services/apiErrors.ts`, `src/services/secureStorage.ts`, `src/services/encryption.ts`, `src/store/tokenSlice.ts`, `src/features/nonLoggedInHome/hooks/useHomeBootstrap.ts` |
| FR-031 | `src/services/authService.ts`, `src/services/httpClient.ts`, `src/services/authRetry.ts`, `src/services/apiErrors.ts`, `src/services/secureStorage.ts`, `src/services/encryption.ts`, `src/store/tokenSlice.ts`, `src/features/nonLoggedInHome/hooks/useHomeBootstrap.ts` |
| FR-032 | `src/services/authService.ts`, `src/services/httpClient.ts`, `src/services/authRetry.ts`, `src/services/apiErrors.ts`, `src/services/secureStorage.ts`, `src/services/encryption.ts`, `src/store/tokenSlice.ts`, `src/features/nonLoggedInHome/hooks/useHomeBootstrap.ts` |
| FR-033 | `src/services/authService.ts`, `src/services/httpClient.ts`, `src/services/authRetry.ts`, `src/services/apiErrors.ts`, `src/services/secureStorage.ts`, `src/services/encryption.ts`, `src/store/tokenSlice.ts`, `src/features/nonLoggedInHome/hooks/useHomeBootstrap.ts` |
| FR-034 | `src/services/authService.ts`, `src/services/httpClient.ts`, `src/services/authRetry.ts`, `src/services/apiErrors.ts`, `src/services/secureStorage.ts`, `src/services/encryption.ts`, `src/store/tokenSlice.ts`, `src/features/nonLoggedInHome/hooks/useHomeBootstrap.ts` |
| FR-035 | `src/features/nonLoggedInHome/hooks/useFaqFlow.ts`, `src/services/faqService.ts`, `src/store/faqSlice.ts`, `src/features/nonLoggedInHome/components/LoadingOverlay.tsx`, `src/features/nonLoggedInHome/components/CommonMessageDialog.tsx` |
| FR-036 | `src/features/nonLoggedInHome/hooks/useFaqFlow.ts`, `src/services/faqService.ts`, `src/store/faqSlice.ts`, `src/features/nonLoggedInHome/components/LoadingOverlay.tsx`, `src/features/nonLoggedInHome/components/CommonMessageDialog.tsx` |
| FR-037 | `src/features/nonLoggedInHome/hooks/useFaqFlow.ts`, `src/services/faqService.ts`, `src/store/faqSlice.ts`, `src/features/nonLoggedInHome/components/LoadingOverlay.tsx`, `src/features/nonLoggedInHome/components/CommonMessageDialog.tsx` |
| FR-038 | `src/features/nonLoggedInHome/hooks/useFaqFlow.ts`, `src/services/faqService.ts`, `src/store/faqSlice.ts`, `src/features/nonLoggedInHome/components/LoadingOverlay.tsx`, `src/features/nonLoggedInHome/components/CommonMessageDialog.tsx` |
| FR-039 | `src/features/nonLoggedInHome/hooks/useFaqFlow.ts`, `src/services/faqService.ts`, `src/store/faqSlice.ts`, `src/features/nonLoggedInHome/components/LoadingOverlay.tsx`, `src/features/nonLoggedInHome/components/CommonMessageDialog.tsx` |
| FR-040 | `src/features/nonLoggedInHome/hooks/useFaqFlow.ts`, `src/services/faqService.ts`, `src/store/faqSlice.ts`, `src/features/nonLoggedInHome/components/LoadingOverlay.tsx`, `src/features/nonLoggedInHome/components/CommonMessageDialog.tsx` |
| FR-041 | `src/features/nonLoggedInHome/hooks/useFaqFlow.ts`, `src/services/faqService.ts`, `src/store/faqSlice.ts`, `src/features/nonLoggedInHome/components/LoadingOverlay.tsx`, `src/features/nonLoggedInHome/components/CommonMessageDialog.tsx` |
| FR-042 | `src/features/nonLoggedInHome/hooks/useFaqFlow.ts`, `src/services/faqService.ts`, `src/store/faqSlice.ts`, `src/features/nonLoggedInHome/components/LoadingOverlay.tsx`, `src/features/nonLoggedInHome/components/CommonMessageDialog.tsx` |
| FR-043 | `src/features/nonLoggedInHome/components/CustomerCarePopup.tsx`, `src/features/nonLoggedInHome/hooks/useCustomerCare.ts` |
| FR-044 | `src/features/nonLoggedInHome/components/CustomerCarePopup.tsx`, `src/features/nonLoggedInHome/hooks/useCustomerCare.ts` |
| FR-045 | `src/features/nonLoggedInHome/components/CustomerCarePopup.tsx`, `src/features/nonLoggedInHome/hooks/useCustomerCare.ts` |
| FR-046 | `src/features/nonLoggedInHome/components/CustomerCarePopup.tsx`, `src/features/nonLoggedInHome/hooks/useCustomerCare.ts` |
| FR-047 | `src/features/nonLoggedInHome/components/CustomerCarePopup.tsx`, `src/features/nonLoggedInHome/hooks/useCustomerCare.ts` |
| FR-048 | `src/services/versionService.ts`, `src/services/deviceInfo.ts`, `src/features/nonLoggedInHome/hooks/useHomeBootstrap.ts`, `src/features/nonLoggedInHome/components/VersionDialog.tsx` |
| FR-049 | `src/services/versionService.ts`, `src/services/deviceInfo.ts`, `src/features/nonLoggedInHome/hooks/useHomeBootstrap.ts`, `src/features/nonLoggedInHome/components/VersionDialog.tsx` |
| FR-050 | `src/services/versionService.ts`, `src/services/deviceInfo.ts`, `src/features/nonLoggedInHome/hooks/useHomeBootstrap.ts`, `src/features/nonLoggedInHome/components/VersionDialog.tsx` |
| FR-051 | `src/services/versionService.ts`, `src/services/deviceInfo.ts`, `src/features/nonLoggedInHome/hooks/useHomeBootstrap.ts`, `src/features/nonLoggedInHome/components/VersionDialog.tsx` |
| FR-052 | `src/services/versionService.ts`, `src/services/deviceInfo.ts`, `src/features/nonLoggedInHome/hooks/useHomeBootstrap.ts`, `src/features/nonLoggedInHome/components/VersionDialog.tsx` |
| FR-053 | `src/services/versionService.ts`, `src/services/deviceInfo.ts`, `src/features/nonLoggedInHome/hooks/useHomeBootstrap.ts`, `src/features/nonLoggedInHome/components/VersionDialog.tsx` |
| FR-054 | `src/services/versionService.ts`, `src/services/deviceInfo.ts`, `src/features/nonLoggedInHome/hooks/useHomeBootstrap.ts`, `src/features/nonLoggedInHome/components/VersionDialog.tsx` |
| FR-055 | `src/services/versionService.ts`, `src/services/deviceInfo.ts`, `src/features/nonLoggedInHome/hooks/useHomeBootstrap.ts`, `src/features/nonLoggedInHome/components/VersionDialog.tsx` |
| FR-056 | `src/services/versionService.ts`, `src/services/deviceInfo.ts`, `src/features/nonLoggedInHome/hooks/useHomeBootstrap.ts`, `src/features/nonLoggedInHome/components/VersionDialog.tsx` |
| FR-057 | `src/services/versionService.ts`, `src/services/deviceInfo.ts`, `src/features/nonLoggedInHome/hooks/useHomeBootstrap.ts`, `src/features/nonLoggedInHome/components/VersionDialog.tsx` |
| FR-058 | `src/features/nonLoggedInHome/hooks/useExitConfirm.ts`, `src/features/nonLoggedInHome/components/ExitConfirmDialog.tsx` |
| FR-059 | `src/features/nonLoggedInHome/hooks/useExitConfirm.ts`, `src/features/nonLoggedInHome/components/ExitConfirmDialog.tsx` |
| FR-060 | `src/features/nonLoggedInHome/hooks/useExitConfirm.ts`, `src/features/nonLoggedInHome/components/ExitConfirmDialog.tsx` |
| FR-061 | `src/features/nonLoggedInHome/hooks/useExitConfirm.ts`, `src/features/nonLoggedInHome/components/ExitConfirmDialog.tsx` |
| FR-062 | `src/features/nonLoggedInHome/hooks/useFocusReset.ts`, `src/store/offersSlice.ts`, `src/store/sessionFlagsSlice.ts` |
| FR-063 | `src/features/nonLoggedInHome/hooks/useFocusReset.ts`, `src/store/offersSlice.ts`, `src/store/sessionFlagsSlice.ts` |
| FR-064 | `src/features/nonLoggedInHome/hooks/useFocusReset.ts`, `src/store/offersSlice.ts`, `src/store/sessionFlagsSlice.ts` |
| FR-065 | `src/features/nonLoggedInHome/hooks/useFocusReset.ts`, `src/store/offersSlice.ts`, `src/store/sessionFlagsSlice.ts` |
| FR-066 | `src/features/nonLoggedInHome/components/`, `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx`, `src/theme/tokens.ts` |
| FR-067 | `src/features/nonLoggedInHome/components/`, `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx`, `src/theme/tokens.ts` |
| FR-068 | `src/features/nonLoggedInHome/components/`, `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx`, `src/theme/tokens.ts` |
| FR-069 | `src/features/nonLoggedInHome/components/`, `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx`, `src/theme/tokens.ts` |

## Dependency / Mock Strategy

Built from what the existing tests do. Only external boundaries are mocked; the unit under test is always real.

| Boundary | How the tests handle it |
|---|---|
| Network (axios) | Service tests stub `apiClient.defaults.adapter` and capture the request config; feature tests mock `authService`, `faqService`, `versionService` and `sessionService` with `jest.mock` |
| Native encryption | `jest.mock('../encryptionNative')` returns `enc(<plain>)` in `authService.test.ts` and `generatetokenContract.test.ts` |
| Secure storage | `setSecureStorageForTests` swaps in an in-memory map |
| Redux store | The real store from `createAppStore()` with the real slices |
| Navigation | A fake object with `navigate` and `addListener` (focus and blur emitted by the test) |
| Hardware back, linking, accessibility | `jest.spyOn` on `BackHandler.addEventListener` and `exitApp`, `Linking.openURL` and `AccessibilityInfo` |
| Platform and window | `setPlatformOS` from `src/testUtils/platform.ts`; `Dimensions.set` for font scale and 320 x 568 |
| Analytics | `setAnalyticsSink` with a jest function |
| Timers | `jest.useFakeTimers()` where a lock timer matters (`useGuardedNavigate`, `useHomeActions`) |

## Project Structure

### Documentation (this feature)

```text
specs/002-non-logged-in-home-page/
├── plan.md              # This file
├── research.md          # Phase 0: decisions and the assumptions that need owner confirmation
├── data-model.md        # Phase 1: entities, state shape, transitions
├── quickstart.md        # Phase 1: run and validate guide
├── contracts/
│   ├── generatetoken.md
│   ├── fetch-faq.md
│   ├── force-update.md
│   ├── error-behaviour.md
│   ├── shared-http-client.md
│   └── ui-and-navigation.md
└── tasks.md             # Created later by /speckit-tasks
```

### Source code

```text
src/
├── features/nonLoggedInHome/                 # NEW: every file below is new; nothing imported from features/nonLoggedHome
│   ├── NonLoggedInHomeScreen.tsx             # screen: composes parts, no business logic
│   ├── PayNowScreen.tsx                      # header "Pay Now" + back button only
│   ├── nonLoggedInHomeConstants.ts           # label file: every on-screen string, analytics names, tile table
│   ├── types.ts                              # TileConfig, HomeDialogState, version outcome types
│   ├── components/
│   │   ├── QuickLinkTile.tsx                 # one tile: icon, label, press, a11y
│   │   ├── QuickLinkGrid.tsx                 # 3 + 3 layout, stacks at scale >= 1.5
│   │   ├── LoginButton.tsx                   # gradient pill
│   │   ├── CustomerCarePopup.tsx             # modal popup
│   │   ├── CommonMessageDialog.tsx           # message + one button
│   │   ├── VersionDialog.tsx                 # maintenance / mandatory / optional
│   │   ├── ExitConfirmDialog.tsx             # "Are you sure you want to exit!"
│   │   ├── LoadingOverlay.tsx                # blocking spinner
│   │   └── gradient.ts                       # CSS angle to gradient line (own copy)
│   ├── hooks/
│   │   ├── useHomeBootstrap.ts               # token request + version check, once per mount
│   │   ├── useHomeActions.ts                 # tile and Login handlers: analytics first, then guarded navigate
│   │   ├── useFaqFlow.ts                     # cache-first FAQ fetch, double-tap guard, error dialog
│   │   ├── useExitConfirm.ts                 # Android back precedence
│   │   ├── useFocusReset.ts                  # BR-11 reset on every focus
│   │   ├── useGuardedNavigate.ts             # own copy: one destination per tap burst
│   │   └── useTextScaleLayout.ts             # stacked flag at font scale >= 1.5
│   └── __tests__/                            # screen, components, hooks, accessibility, constants
├── assets/nonLoggedInHome/                   # NEW: own copies of the six tile icons and the illustration, plus index.ts
├── assets/fonts/                             # Rubik Regular, Medium, SemiBold, Bold (SemiBold and Bold now present)
├── services/                                 # SHARED infrastructure
│   ├── authRetry.ts                          # NEW: auth-failure detect + one retry after token refresh (G-1)
│   ├── apiErrors.ts                          # NEW: errorCategory / retryable classifier (G-2)
│   ├── httpClient.ts                         # minimal hook-up of authRetry (only edit to an existing service file)
│   ├── authService.ts, encryption.ts, encryptionNative.ts, secureStorage.ts   # reuse unchanged
│   ├── faqService.ts, versionService.ts      # reuse unchanged
│   └── sessionService.ts, analytics.ts, deviceInfo.ts                           # reuse unchanged
├── store/                                    # SHARED, reuse unchanged: token, faq, offers, sessionFlags
├── theme/tokens.ts                           # additive: Rubik SemiBold / Bold family tokens
├── navigation/routes.ts, RootNavigator.tsx   # additive: routes NonLoggedInHome and NonLoggedInPayNow
└── config/env.ts                             # reuse unchanged
```

**Structure Decision**: a self-contained feature folder (constitution VI) written as new files, with its own copies of the guarded-navigate hook, gradient helper, icons and label file, so spec 001 and the new feature can be changed or retired independently. Only the infrastructure that must stay single (one HTTP client, one token and FAQ store, one set of theme tokens) is shared. Routes `NonLoggedInHome` and `NonLoggedInPayNow` are added so 001's routes are untouched; the other destinations (Login, Products, Offers, FAQ, Track Application, Branch locator) are existing routes owned by their own modules.

## Phase 0 and Phase 1 output

- Research and decisions: [research.md](research.md)
- Entities and state: [data-model.md](data-model.md)
- Contracts: [contracts/](contracts/)
- Run and validation guide: [quickstart.md](quickstart.md)

## Key design notes

**Home bootstrap (FR-025, FR-048, FR-007).** On mount, `useHomeBootstrap` starts the token request and then the version check without awaiting either for rendering. The version call goes through the shared client, which already waits for an in-flight token, so an early call cannot fail for lack of a token. The version check runs once per fresh mount (a ref guard), never on focus.

**Tile handlers (FR-010 to FR-019).** `useHomeActions` records `quick_link_clicked` first, then navigates through `useGuardedNavigate` (800 ms burst lock, released on focus). Targets are in `contracts/ui-and-navigation.md`. FAQs does not navigate directly; it runs `useFaqFlow`.

**FAQ flow (FR-035 to FR-042).** Set `faqsFromNonLogin` true; if the cache has items, navigate; else show the overlay, call `fetchFaq()`, and in `finally` clear the overlay. Non-empty: store and navigate. Empty or non-list: stay, no dialog. Rejection: dialog "Your request could not be processed at this moment. Request you to try again after sometime." with "Okay", plus `dialog_shown`. A `loading` ref ignores taps while a request is in flight.

**Exit confirmation (FR-058 to FR-061).** `useExitConfirm` registers a hardware-back handler only while Home is focused (Android). Order: close open popup or dialog first; otherwise show the exit dialog. "Okay" calls the platform exit; "CANCEL" closes the dialog.

**Focus reset (FR-062 to FR-065).** One focus effect dispatches `resetOffersForm`, `clearSelectedOffer` and `setRegisterNowReturnScreen(null)`. It never touches the FAQ cache or token and calls no service.

**Layout and stacking (FR-012).** `useTextScaleLayout` reads the font scale; at >= 1.5 the grid becomes one full-width column with the icon aligned to the first text line, and the page is a scroll view. At default settings the grid is the exact Figma layout. Tiles have `minHeight` / `minWidth` 44 and no fixed text heights.

**Accessibility (FR-066 to FR-069).** Tiles and Login: role `button`, label from the label file. Illustration and icons: hidden from the accessibility tree. Reading order: headline, tiles row-wise, Login. Popup: modal for screen readers, focus moved in, returned to the Contact Us tile on close. Overlay and failure dialog announced. Tests assert roles, labels, order, hidden elements and touch-target sizes.

## Complexity Tracking

| Item | Why needed | Simpler alternative rejected because |
|---|---|---|
| Duplicate Home feature (`nonLoggedInHome/`) beside spec 001's `nonLoggedHome/` | Owner decision 2026-11-06: build a duplicate, separate feature with separate files | Reusing 001's files was rejected by the owner. Cost: two implementations of one BRD to maintain until one is retired |
| Minimal edit to shared `httpClient.ts`, additive edit to `tokens.ts` and `routes.ts` / `RootNavigator.tsx` | Retry must live in the one HTTP client (constitution V); font tokens and routes are shared registries | A second HTTP client would break constitution V. Zero-regression gate: every existing test must pass unchanged |
| Shared `versionService.ts` still imports message text from 001's constants | Left untouched so 001 keeps working | Moving it would edit a shared file used by 001; follow-up when one Home feature is retired |
