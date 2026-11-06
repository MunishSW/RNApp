# Implementation Plan: Non-Logged-In Home Page

**Branch**: `001-nonlogged-home-screen` | **Date**: 2026-11-06 | **Spec**: [spec.md](spec.md) | **Story**: BHFL-001

## Summary

Replace the template `App.tsx` with a navigator whose first route `NonLoggedHome` renders the Figma `BHFL_prelogin` frame: illustration, headline, six quick-link tiles, Login CTA. Add the background non-logged token, cache-first FAQ flow, Contact Us popup, force-update gate, Android exit confirmation and focus reset, on a shared HTTP client. Assets (illustration, six icons, gradient) come from the Figma MCP. Composition order: compose existing RN primitives and `react-native-svg` → add minimal new modules → wire behaviour → polish and verify.

## Technical Context

**Language/Version**: TypeScript (strict, `@react-native/typescript-config`), React 19.3, React Native 0.88.1 on Hermes
**Primary Dependencies (declared)**: `@react-navigation/native` + `native-stack`, `@reduxjs/toolkit` + `react-redux`, `axios`, `react-native-svg`, `react-native-safe-area-context`, `react-native-reanimated` (not needed here)
**Storage**: encrypted key-value behind a `secureStorage` interface (see Gaps)
**Testing**: Jest 29 with `@react-native/jest-preset` and `react-test-renderer`; test command `npm test` (`jest`)
**Target Platform**: Android and iOS
**Constraints**: Hermes-safe; no raw hex outside `src/theme`; no literal user-facing strings in components; no direct axios/fetch in features; no endless animations

## Constitution Check

| Gate / Principle | How this plan complies |
|---|---|
| I Requirements are source of truth | Every task cites FR ids; unknowns (O-01…O-13) stay open items, not code; labels in `nonLoggedHomeConstants.ts` |
| II Design fidelity | Figma node 2:937 numbers copied into tokens and styles; tokens-only colours; gradient from node 2:967 |
| III Accessibility | role/label/state on all interactives; 44 x 44 targets; spinner and error dialog announced; popup `accessibilityViewIsModal`; a11y test task T090 |
| IV Security | token call body fields encrypted via `encryption` seam; creds from build config, never logged; token memory + encrypted storage; TLS only |
| V API layer | one `httpClient`; background failures fail open and silent; FAQ failure shows standard dialog; typed contracts; malformed response treated as empty |
| VI Code quality | feature-folder module; logic in hooks/services/stores; explicit back targets; no duplicate push |
| VII Quality gates | typecheck + lint + affected tests in T091; each TC mapped to test or documented manual check |
| VIII Performance | screen never awaits calls; loaders cleared in `finally`; listeners cleaned up |
| IX Change control | Conventional Commits; PR cites FR/TC ids |

No violations; Complexity Tracking empty.

## Gaps (dependencies not declared — never assumed)

| Need | Not in `package.json` | Plan |
|---|---|---|
| Payment WebView | `react-native-webview` | `PayNowWebView` route stub only; hand-off tested; real WebView in its own spec (O-05) |
| Encrypted storage (MMKV) | `react-native-mmkv` | `secureStorage` interface + in-memory fake; real adapter later |
| App version / device details | `react-native-device-info` | `deviceInfo` interface returning version, platform, device-details; adapter later |
| Field encryption (AES-128-GCM, 12-byte random IV, tag appended, base64url `IV:ct+tag`) | an AES-GCM capable lib plus secure random (`crypto-js` has no GCM, so it is out); candidates `react-native-quick-crypto` (native) or `@noble/ciphers` + `react-native-get-random-values` (pure JS) | `encryption` interface with a pure-function format helper tested against a known-answer vector; real adapter chosen at install time. Shared key and 16-byte AAD come from `env.ts` build config only, never in repo or docs |
| Analytics SDK | none | `analytics.track(event, props)` wrapper; tests spy on it |
| Gradient | `react-native-linear-gradient` | use declared `react-native-svg` `LinearGradient` (no new dep) |
| Rubik font | font files | `typography.fontFamily` token, falls back to system font until assets added |
| RN testing library | `@testing-library/react-native` | tests use `react-test-renderer` with small helpers |
| Env config | `react-native-config` | `src/config/env.ts` reading a typed build-config object |

## Project Structure

### Documentation

```text
specs/001-nonlogged-home-screen/
├── spec.md  plan.md  tasks.md  qa-cases.json  manual-verification.json
├── stories.json  contracts/pending-contract-values.md
└── checklists/requirements.md
```

### Source Code (confirmed impact set, all new unless noted)

```text
App.tsx                                    (changed: SafeAreaProvider + Redux Provider + RootNavigator)
__tests__/App.test.tsx                     (changed: render new root, replaces template assertion)
src/
├── theme/tokens.ts
├── config/env.ts
├── assets/nonLoggedHome/                  (illustration + 6 icons exported from Figma)
├── navigation/{routes.ts,RootNavigator.tsx,useGuardedNavigate.ts,stubs/*.tsx}
├── services/{httpClient.ts,authService.ts,faqService.ts,versionService.ts,analytics.ts,secureStorage.ts,encryption.ts,deviceInfo.ts}
├── store/{index.ts,tokenSlice.ts,faqSlice.ts,offersSlice.ts,sessionFlagsSlice.ts}
└── features/nonLoggedHome/
    ├── NonLoggedHomeScreen.tsx
    ├── nonLoggedHomeConstants.ts
    ├── components/{QuickLinkTile.tsx,LoginButton.tsx,CustomerCarePopup.tsx,ExitConfirmDialog.tsx,VersionDialog.tsx,LoadingOverlay.tsx,CommonMessageDialog.tsx}
    ├── hooks/{useNonLoggedToken.ts,useFaqFlow.ts,useVersionGate.ts,useExitConfirm.ts,useFocusReset.ts,useTextScaleLayout.ts}
    └── __tests__/*.test.tsx
```

Tests sit next to the code they cover; `// Covers: <TC-ID>` markers per `references/covers-marker-convention.md`.

## Requirement → File allocation

| FR | Files |
|---|---|
| FR-001, 002, 003, 004, 005, 021, 022 | `NonLoggedHomeScreen.tsx`, `QuickLinkTile.tsx`, `LoginButton.tsx`, `useTextScaleLayout.ts`, `tokens.ts`, `nonLoggedHomeConstants.ts`, `assets/nonLoggedHome/*` |
| FR-006, 007, 008, 009 | `NonLoggedHomeScreen.tsx`, `useGuardedNavigate.ts`, `routes.ts`, `stubs/*`, `analytics.ts` |
| FR-010, 011, 012 | `httpClient.ts`, `authService.ts`, `tokenSlice.ts`, `secureStorage.ts`, `encryption.ts`, `env.ts`, `useNonLoggedToken.ts` |
| FR-013, 014 | `faqService.ts`, `faqSlice.ts`, `useFaqFlow.ts`, `LoadingOverlay.tsx`, `CommonMessageDialog.tsx` |
| FR-015 | `CustomerCarePopup.tsx`, `sessionFlagsSlice.ts` |
| FR-016, 017 | `versionService.ts`, `deviceInfo.ts`, `useVersionGate.ts`, `VersionDialog.tsx` |
| FR-018 | `useExitConfirm.ts`, `ExitConfirmDialog.tsx` |
| FR-019 | `useFocusReset.ts`, `offersSlice.ts`, `sessionFlagsSlice.ts` |
| FR-020 | all of the above (no blocking awaits, cleanups) |
| FR-900 | none (traceability only, T095) |

## Dependency / Mock Strategy

- `httpClient` is mocked at the service boundary in screen/hook tests; `httpClient` itself is tested with axios mocked.
- `navigation` mocked with a `navigate` jest.fn and a focus-listener stub; `BackHandler`, `Linking`, `Platform` spied.
- Redux tests use a real store from `src/store`; secure storage, encryption, device-info, analytics are injected fakes.
- Fake timers for the 10 s token timeout and in-flight guards. No real network.

## Phases

1. **Compose**: tokens, constants, Figma assets, env, navigation shell (T001-T008).
2. **Add minimal new**: tile, login button, popup, dialogs, services, stores (T010, T030, T040, T041 parts).
3. **Wire behaviour**: screen, handlers, token, FAQ, version gate, back, focus (T011-T013, T020, T021, T050, T051).
4. **Polish/verify**: accessibility, typecheck, lint, manual list, scope boundary (T090-T095).

## Risks

- Figma gradient/asset export may yield SVG vs PNG; plan allows either (BRD says PNG icons).
- Template `App.test.tsx` asserts the old template; T007 updates it in the same change, not skipped.
- `react-native-reanimated`/`worklets` Babel config is untouched; no animation used.
