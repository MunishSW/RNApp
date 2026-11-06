---

description: "Task list for the Non-Logged-In (Pre-Login) Home Page"
---

# Tasks: Non-Logged-In (Pre-Login) Home Page

**Input**: `specs/002-non-logged-in-home-page-tdd-trial2/` (spec.md, plan.md, qa-cases.json, manual-verification.json, research.md, data-model.md, contracts/, quickstart.md)

**Prerequisites**: plan.md, spec.md (both present). Constitution: `.specify/memory/constitution.md` (gate G4: every task cites a requirement ID; every test case maps to an automated test or a documented manual check).

**Tests**: Included. The request asks for unit tests for stores, services and components as part of each story, and constitution III and VII require accessibility and affected tests.

**Organization**: grouped by user story, each story mapped to BRD functional areas 4.1 to 4.9. Phase order follows the request: setup and tokens, shared API client, token and version services, FAQ store, tile and screen UI, popups and dialogs, navigation and back handling, accessibility pass, polish.

## Format: `- [ ] T### [P?] [Story?] Description with file path (IDs)`

- **[P]**: can run in parallel (different files, no dependency on an unfinished task).
- **[USn]**: user story label (story phases only).
- IDs in brackets are spec requirement IDs (FR-, BR-, TV-, PERF-), BRD area, and scenarios (P-, N-, E-).

## Story map

| Story | Priority | BRD areas | Spec journey | Delivers |
|---|---|---|---|---|
| US1 | P1 | 4.1, 4.2, 4.3 | A | Page shell, six tiles, "Login", background token request on mount |
| US2 | P1 | 4.7 | G | Force-update and maintenance gate with its dialogs |
| US3 | P2 | 4.5 | B, F | Cache-first FAQ flow, spinner, error dialog |
| US4 | P3 | 4.6 | E | Customer Care popup |
| US5 | P2/P3 | 4.2 (Pay Now, Offers), 4.9 | C, D | Pay Now screen, Offers hand-off, focus reset |
| US6 | P3 | 4.8 | H | Android back and exit confirmation |

## Path conventions

All feature code is new under `src/features/nonLoggedInHome/`. It MUST NOT import from `src/features/nonLoggedHome/` (plan, Structure Decision). Shared infrastructure lives in `src/services`, `src/store`, `src/theme`, `src/navigation`. Tests sit next to the code in `__tests__/` folders. Strings only from `nonLoggedInHomeConstants.ts`; raw colours only in `src/theme/tokens.ts`.

---

## Environment Gate

- [ ] T-ENV-001: Run `npm test` - existing suite green. **Maps**: FR-025, FR-028, FR-029, FR-030, FR-032, FR-033, FR-034 · **Accept**: the whole existing suite passes before any change

---

## Phase 1: Setup and tokens

**Purpose**: tokens, assets, label file, types, routes. No behaviour yet.

- [X] T001 Add `fontFamilySemiBold: 'Rubik-SemiBold'` and `fontFamilyBold: 'Rubik-Bold'` to `typography` in `src/theme/tokens.ts` and extend `src/theme/__tests__/tokens.test.ts` to assert all four Rubik family tokens and the Figma values `#035795`, `#FF512F`, `#F09819`, angle 133.8255, tile width 96, icon height 40 (FR-004, FR-020; plan "Design tokens"; BRD 13.1) **Maps**: FR-004, FR-020 · **Accept**: tokens.ts holds the four Rubik family tokens and the Figma values, and the tokens test passes
- [X] T002 Confirm `Rubik-Regular.ttf`, `Rubik-Medium.ttf`, `Rubik-SemiBold.ttf`, `Rubik-Bold.ttf` are in `src/assets/fonts/` (already copied) and linked for both platforms: `react-native.config.js` already lists `./src/assets/fonts`; run `npx react-native-asset`, then check `ios/*/Info.plist` (`UIAppFonts`) and `android/app/src/main/assets/fonts/` contain all four. Record the result in the task commit (FR-004; G-3) **Maps**: FR-004 · **Accept**: the four Rubik font files are present and linked for Android and iOS
- [X] T003 [P] Create `src/assets/nonLoggedInHome/` with copies of the six tile icons (`pay-now.png`, `our-products.png`, `track-application.png`, `faqs.png`, `offers.png`, `contact-us.png`) and `illustration.png` from `src/assets/nonLoggedHome/`, plus `src/assets/nonLoggedInHome/index.ts` exporting them by tile id (FR-002, FR-010; Figma 2:947-2:964) **Maps**: FR-002, FR-010 · **Accept**: the six tile icons and the illustration are exported by tile id from src/assets/nonLoggedInHome/index.ts
- [X] T004 [P] Create `src/features/nonLoggedInHome/nonLoggedInHomeConstants.ts` holding every on-screen string exactly as the spec quotes it: headline "Login to download account statements, make payments, and manage your account, on the go!" (three-line break), tile labels "Pay Now", "Our Products", "Track Application", "FAQs", "Offers", "Contact Us", "Login", popup text "We are here to help!" / "Call Us" / "022-45297300" / "Email Us" / "bhflwecare@bajajhousing.co.in" / "Find Us" / "Branch locator", FAQ error "Your request could not be processed at this moment. Request you to try again after sometime." / "Okay", exit text "Are you sure you want to exit!" / "CANCEL" / "Okay", update text "Update your app to experience all the latest features." / "Update" / "Exit" / "Skip", header "Pay Now"; the ordered tile table (id, label, linkName, route); analytics event and property names (FR-003, FR-010, FR-018, FR-040, FR-043, BRD area 4.7, BRD area 4.8; BRD 7.7) **Maps**: FR-003, FR-010, FR-018, FR-040, FR-043, FR-048, FR-049, FR-050, FR-051, FR-052, FR-053, FR-054, FR-055, FR-056, FR-057, FR-058, FR-059, FR-060, FR-061 · **Accept**: the constants file holds every on-screen string, the tile table and the analytics names exactly as the spec quotes them
- [X] T005 [P] Create `src/features/nonLoggedInHome/types.ts` with `TileId`, `TileConfig`, `HomeDialogState` and a re-export of the shared `VersionOutcome` type (data-model.md "QuickLinkTile", "HomeUiState"; FR-010) **Maps**: FR-010 · **Accept**: types.ts exports TileId, TileConfig, HomeDialogState and the shared VersionOutcome type
- [X] T006 [P] Add routes `NonLoggedInHome` and `NonLoggedInPayNow` (params `{ title: string }`) to `ROUTES` and `RootStackParamList` in `src/navigation/routes.ts`, leaving every existing route unchanged (contracts/ui-and-navigation.md; FR-014) **Maps**: FR-014 · **Accept**: routes NonLoggedInHome and NonLoggedInPayNow exist and every existing route is unchanged
- [X] T007 [P] Write `src/features/nonLoggedInHome/__tests__/constants.test.ts` asserting each string above is exactly equal to the spec text, tile order is "Pay Now", "Our Products", "Track Application", "FAQs", "Offers", "Contact Us", and there are no strings for Register Now, chatbot or accessibility icon (FR-010, FR-024; BR-4; P-01; TC-102, TC-103, TC-107, TC-108, TC-109) **Maps**: FR-010, FR-024 · **Accept**: constants.test.ts passes: strings equal the spec text, tile order is fixed, no Register Now, chatbot or accessibility text

**Checkpoint**: tokens, assets, labels and routes exist.

---

## Phase 2: Foundational (blocking): shared API client, token and version services, FAQ store

**Purpose**: the network and state layers every story uses. No story starts before this is green.

**Shared API client** (contracts/shared-http-client.md, error-behaviour.md)

- [X] T008 [P] Create `src/services/apiErrors.ts` exporting `classifyApiError(error)` returning `{ status, errorCategory: 'Network' | 'Auth' | 'Server' | 'Validation', retryable }` with `retryable` true for network, timeout, 429 and 5xx; and `src/services/__tests__/apiErrors.test.ts` covering each category and the retryable rule (BRD 8.4.4; FR-032; N-01, N-02) **Maps**: FR-032 · **Accept**: apiErrors.ts classifies network, auth, server and validation errors with the retryable rule and its test passes
- [X] T009 [P] Create `src/services/authRetry.ts` exporting `isAuthFailure(responseOrError)` (HTTP 401; HTTP 400 with body `statusCode` or `returnStatus.returnCode` "401" or "API_3000"; HTTP 200 with `returnStatus.returnCode` "401") and `retryOnceAfterTokenRefresh(config, deps)` that requests a fresh non-logged token, sets the new Bearer header and replays once, marks the replay, skips `skipAuth` calls and any call when a logged-in token exists, and returns or throws the original result when the replay fails (BRD 8.4.3; FR-032; BR-2, BR-3) **Maps**: FR-032 · **Accept**: authRetry.ts detects the three auth-failure signals and replays once after a token refresh
- [X] T010 [P] Write `src/services/__tests__/authRetry.test.ts` covering: each of the three auth-failure signals triggers exactly one token refresh and one replay; a second auth failure on the replay gives no third call and passes the original error on; a logged-in token present means no retry; `skipAuth` never retries; 500 and network failures are not replayed (FR-032; BR-3; N-01, N-02, E-13) **Maps**: FR-032 · **Accept**: authRetry.test.ts passes for each signal, the single replay, logged-in sessions, skipAuth and non-auth failures
- [X] T011 Hook `authRetry` into `src/services/httpClient.ts` as a response step (also checking successful HTTP 200 bodies) with no change to existing request behaviour; run `src/services/__tests__/httpClient.test.ts` and confirm every existing case still passes unchanged (FR-028, FR-032; BR-3; G-1; constitution V). Depends on T009. **Maps**: FR-028, FR-032 · **Accept**: httpClient.ts runs authRetry on responses and every existing httpClient test still passes unchanged
- [X] T012 Extend `src/services/__tests__/authRetry.test.ts` (or add `src/services/__tests__/httpClientRetry.test.ts`) with an end-to-end case through `post()`: FAQ call gets 401, token refresh runs once, replay carries the new Bearer, headers `app-version`, `platform`, `device-details` present and `X-BHFL-Auth` absent (FR-028, FR-034, FR-032; P-08, P-09; TC-404). Depends on T011. **Maps**: FR-028, FR-032, FR-034 · **Accept**: the end-to-end FAQ call test passes: 401, one refresh, replay with the new Bearer, required headers, no X-BHFL-Auth

**Token and version services** (contracts/generatetoken.md, force-update.md)

- [X] T013 [P] Write `src/services/__tests__/generatetokenContract.test.ts` (check `src/services/__tests__/authService.test.ts` first and add only cases not already covered): body `username` and `password` are in the form `base64url(IV):base64url(ciphertext+tag)` with no `=`, IV differs between calls; call is `skipAuth` with headers `Content-Type: application/json` and `X-BHFL-Auth` absent, `X-BHFL-Entity: mobileapp`; timeout is 10 s; empty or non-string `token` is rejected (TV-1); every failure is swallowed with no throw; the in-flight promise makes a concurrent call wait; a logged-in token is never returned as the non-logged token (FR-025 to FR-030; BR-2, BR-3, TV-1, PERF-2; P-09, N-01, E-13; TC-401, TC-402, TC-403, TC-404, TC-405) **Maps**: FR-025, FR-026, FR-027, FR-028, FR-029, FR-030 · **Accept**: generatetokenContract.test.ts passes for the token request contract
- [X] T014 [P] Write `src/services/__tests__/versionContract.test.ts` (check `versionService.test.ts` first and add only missing cases): dotted numeric compare 1.8.10 vs 1.8.9 and missing parts as 0 (TV-3); enforce only when `status` is "Active" (TV-4); `user_agent` exactly "Android" or "iOS" on each platform (TV-5); each classification step of `contracts/force-update.md` has one case; null, empty, malformed body and thrown request give `none`; `X-BHFL-Auth` absent; the call is `forceUpdate/Secured` (FR-048, FR-050, FR-051, FR-056; BR-9, TV-3, TV-4, TV-5; P-10, N-06 to N-09, E-08, E-09; TC-406 to TC-413) **Maps**: FR-048, FR-050, FR-051, FR-056 · **Accept**: versionContract.test.ts passes for the version contract
- [X] T015 [P] Write `src/services/__tests__/faqContract.test.ts` (check `faqService.test.ts` first): empty `{}` body; base is the bare API host; headers Bearer, `app-version`, `platform`, `device-details` present and `X-BHFL-Auth` absent; array returns items, empty array returns `[]`, object body returns `[]`, 500 rejects (FR-034, FR-037, FR-039, FR-040; BR-6, TV-2; N-02 to N-04; TC-302, TC-303, TC-304, TC-305) **Maps**: FR-034, FR-037, FR-039, FR-040 · **Accept**: faqContract.test.ts passes for the FAQ contract
- [X] T016 Fix any failures T013 to T015 reveal in `src/services/authService.ts`, `src/services/versionService.ts` or `src/services/faqService.ts` with the smallest change; do not touch `src/features/nonLoggedHome/` and do not change behaviour that existing tests assert (BRD area 4.4, BRD area 4.5, BRD area 4.7; zero-regression gate VII). Depends on T013, T014, T015. Skip if all pass. **Maps**: FR-025, FR-026, FR-027, FR-028, FR-029, FR-030, FR-031, FR-032, FR-033, FR-034, FR-035, FR-036, FR-037, FR-038, FR-039, FR-040, FR-041, FR-042, FR-048, FR-049, FR-050, FR-051, FR-052, FR-053, FR-054, FR-055, FR-056, FR-057 · **Accept**: failures revealed by T013 to T015 are fixed with the smallest change, or no failure existed

**FAQ and Home state** (data-model.md)

- [X] T017 [P] Write `src/store/__tests__/nonLoggedInHomeState.test.ts` covering: `faq.items` starts null, set only by `setFaqItems`, cleared only by `clearFaq` and survives the three focus-reset actions (FR-065); `token.nonLoggedToken` and `loggedInToken` are separate slots; `offers` reset values are `fullName: ""`, `mobileNo: ""`, `tncAccepted: false`, `selectedOffer: null`; `sessionFlags` `registerNowReturnScreen` set to null, `faqsFromNonLogin` and `isNonLoggedUser` default false (FR-017, FR-035, FR-062 to FR-065; BR-11; P-13; TC-504, TC-505, TC-506) **Maps**: FR-017, FR-035, FR-062, FR-063, FR-064, FR-065 · **Accept**: nonLoggedInHomeState.test.ts passes for the faq, token, offers and session-flag slices
- [X] T018 Fix any failure T017 reveals in `src/store/tokenSlice.ts`, `src/store/faqSlice.ts`, `src/store/offersSlice.ts` or `src/store/sessionFlagsSlice.ts` with the smallest additive change. Skip if all pass. Depends on T017. **Maps**: FR-017, FR-040, FR-062, FR-063, FR-064, FR-065 · **Accept**: failures revealed by T017 are fixed additively, or no failure existed

**Checkpoint**: `npm test -- src/services src/store` green, including all pre-existing tests. User story work can start.

---

## Phase 3: User Story 1 - Land on Home and reach Login (Priority: P1) 🎯 MVP

**Goal**: BRD 4.1, 4.2, 4.3: blue page, illustration, headline, six tiles, "Login", background token request on mount.

**Independent Test**: open Home with no session; the screen matches Figma node 2:937 at default settings; tapping "Login" opens the Login route; every tile tap records `quick_link_clicked`; the screen draws before the token call finishes (P-01, P-02, P-04, P-05, P-09, E-14).

### Tests for User Story 1 (write first, confirm they fail)

- [X] T019 [P] [US1] `src/features/nonLoggedInHome/__tests__/QuickLinkTile.test.tsx`: label text, role `button`, accessibility label equals visible label, icon hidden from the accessibility tree, press calls handler, minimum 44 x 44, tile width 96 and icon height 40 from tokens, "Track Application" label wraps to two lines (FR-011, FR-013; BR-4, BR-12; E-04, E-07; TC-105, TC-606) **Maps**: FR-011, FR-013 · **Accept**: QuickLinkTile.test.tsx passes
- [X] T020 [P] [US1] `src/features/nonLoggedInHome/__tests__/LoginButton.test.tsx`: label "Login", role `button`, never disabled, gradient stops `#FF512F` and `#F09819` come from tokens, 307 x 40, radius 82, press handler, 44 minimum touch height met (FR-020, FR-022, FR-023; BR-8; P-02; TC-104, TC-606) **Maps**: FR-020, FR-022, FR-023 · **Accept**: LoginButton.test.tsx passes
- [X] T021 [P] [US1] `src/features/nonLoggedInHome/__tests__/QuickLinkGrid.test.tsx`: six tiles in fixed order in a 3 + 3 layout at default; one full-width column when `stacked`; width 331 and row gap 18 (FR-010, FR-012; BR-4; P-01, E-01; TC-103, TC-603) **Maps**: FR-010, FR-012 · **Accept**: QuickLinkGrid.test.tsx passes
- [X] T022 [P] [US1] `src/features/nonLoggedInHome/__tests__/useTextScaleLayout.test.ts`: `stacked` is false below font scale 1.5 and true at 1.5 and above (FR-012; BR-4; E-01; TC-603) **Maps**: FR-012 · **Accept**: useTextScaleLayout.test.ts passes
- [X] T023 [P] [US1] `src/features/nonLoggedInHome/__tests__/useGuardedNavigate.test.tsx`: two quick taps navigate once; lock released on focus (FR-019; E-14) **Maps**: FR-019 · **Accept**: useGuardedNavigate.test.tsx passes
- [X] T024 [P] [US1] `src/features/nonLoggedInHome/__tests__/useHomeActions.test.tsx`: each tile tap records `quick_link_clicked` with `link_name`, `location: non_logged_home`, `logged_in: false` before navigating; Login records `cta_clicked` (`cta_name: login`, `screen: non_logged_home`) then navigates to `LoginScreen`; Our Products to `Products`; Offers to `Offers`; Track Application to `TrackApplication`; Contact Us records `contact_us_clicked` and sets `isNonLoggedUser`; a failed navigation is still counted (FR-015 to FR-019, FR-021; BR-4, BR-8; P-02, P-04, P-05, P-14, E-14; TC-201, TC-203, TC-204, TC-206, TC-207) **Maps**: FR-015, FR-016, FR-017, FR-018, FR-019, FR-021 · **Accept**: useHomeActions.test.tsx passes
- [X] T025 [US1] `src/features/nonLoggedInHome/__tests__/NonLoggedInHomeScreen.test.tsx`: renders illustration, headline, six tiles, "Login", with `#035795` page and light status bar; no Register Now, chatbot or accessibility icon; Home draws while the token promise is pending; the token request is made once on mount; Login press opens Login (FR-001 to FR-007, FR-024, FR-025; BR-1, BR-2, BR-8; P-01, P-02, P-09, N-01; TC-101, TC-102, TC-106, TC-107, TC-108, TC-109, TC-702). Depends on T019 to T024 for shared helpers. **Maps**: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-024, FR-025 · **Accept**: NonLoggedInHomeScreen.test.tsx passes

### Implementation for User Story 1

- [X] T026 [P] [US1] Create `src/features/nonLoggedInHome/components/gradient.ts` (own copy of the CSS-angle-to-line helper) (FR-020; plan research 7) **Maps**: FR-020 · **Accept**: gradient.ts exists and converts a CSS angle to a gradient line
- [X] T027 [P] [US1] Create `src/features/nonLoggedInHome/hooks/useGuardedNavigate.ts` (own copy: one destination per tap burst, 800 ms lock, released on focus) (FR-019; BR-4; E-14) **Maps**: FR-019 · **Accept**: useGuardedNavigate.ts opens one destination per tap burst and releases on focus
- [X] T028 [P] [US1] Create `src/features/nonLoggedInHome/hooks/useTextScaleLayout.ts` returning `{ stacked }` at font scale >= 1.5 (FR-012; BR-4; E-01) **Maps**: FR-012 · **Accept**: useTextScaleLayout.ts returns stacked at font scale 1.5 and above
- [X] T029 [P] [US1] Create `src/features/nonLoggedInHome/components/QuickLinkTile.tsx`: 96 wide, padding 12 horizontal and 16 vertical, gap 8, radius 4, transparent background, 40-high icon, Rubik Regular 11.889 white centred label, role `button`, label from constants, icon hidden from accessibility, minimum 44 x 44, no fixed text height, pressed feedback with no layout shift; all values from `src/theme/tokens.ts` via `useTheme()` (FR-010, FR-011, FR-013; BR-4, BR-12) **Maps**: FR-010, FR-011, FR-013 · **Accept**: QuickLinkTile.tsx exists and QuickLinkTile.test.tsx passes
- [X] T030 [P] [US1] Create `src/features/nonLoggedInHome/components/LoginButton.tsx`: 307 x 40 pill, radius 82, padding 10 and 11.5, SVG gradient 133.8255 degrees from `#FF512F` at 5.5578% to `#F09819` at 94.442%, label "Login" Rubik Medium 14 white single line, role `button`, never disabled, exempt from dark remap (FR-020, FR-022, FR-023; BR-8) **Maps**: FR-020, FR-022, FR-023 · **Accept**: LoginButton.tsx exists and LoginButton.test.tsx passes
- [X] T031 [US1] Create `src/features/nonLoggedInHome/components/QuickLinkGrid.tsx`: 331 wide, two rows with 18 gap, three tiles per row spread with space between; one full-width column with the icon aligned to the first text line when `stacked` (FR-010, FR-012; BR-4). Depends on T028, T029. **Maps**: FR-010, FR-012 · **Accept**: QuickLinkGrid.tsx exists and QuickLinkGrid.test.tsx passes
- [X] T032 [US1] Create `src/features/nonLoggedInHome/hooks/useHomeActions.ts`: tile and Login handlers that fire the typed analytics events first (`src/services/analytics.ts`), then navigate through the feature's `useGuardedNavigate`; Contact Us and FAQs handlers expose hooks for later stories (FR-015 to FR-019, FR-021; BR-4, BR-8). Depends on T027. **Maps**: FR-015, FR-016, FR-017, FR-018, FR-019, FR-021 · **Accept**: useHomeActions.ts records the analytics events first and then navigates, and its tests pass
- [X] T033 [US1] Create `src/features/nonLoggedInHome/hooks/useHomeBootstrap.ts`: on mount call `requestNonLoggedToken()` once without awaiting it for render; version check wiring is added in US2 (FR-025, FR-007; BR-2; P-09, N-01) **Maps**: FR-007, FR-025 · **Accept**: useHomeBootstrap.ts requests the token once on mount without blocking render
- [X] T034 [US1] Create `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx`: scroll view with `#035795` background and light status bar; illustration block 311 x 310 (padding top 22, bottom 14, gap 28, art 172 x 140, hidden from accessibility); headline Rubik Regular 16 / line height 22 white centred with the three-line break; 18 gap; grid; "Login" with its top gap from Figma; scroll indicators hidden; no logic beyond composing hooks and components (FR-001 to FR-007, FR-020; BR-1, BR-12; P-01). Depends on T029 to T033. **Maps**: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-020 · **Accept**: NonLoggedInHomeScreen.tsx composes the hooks and components and the screen tests pass
- [X] T035 [US1] Register `NonLoggedInHome` in `src/navigation/RootNavigator.tsx` (additive; initial route unchanged) so the new screen is reachable for review (FR-001; plan structure). Depends on T034, T006. **Maps**: FR-001 · **Accept**: NonLoggedInHome is registered in RootNavigator.tsx and the initial route is unchanged

**Checkpoint**: US1 works alone; run `npm test -- src/features/nonLoggedInHome`.

---

## Phase 4: User Story 2 - Force-update and maintenance gate (Priority: P1)

**Goal**: BRD 4.7: once-per-mount version check, blocking dialogs, fail open, no popup on 401.

**Independent Test**: make the version service answer maintenance, mandatory, optional, 401, error and failure; each shows the dialog or nothing as specified (N-06 to N-09, E-08, E-12).

### Tests for User Story 2

- [X] T036 [P] [US2] `src/features/nonLoggedInHome/__tests__/CommonMessageDialog.test.tsx`: message text, one button with the given label, no close icon, role and announcement, button press handler (FR-040, FR-055; BR-12; TC-303) **Maps**: FR-040, FR-055 · **Accept**: CommonMessageDialog.test.tsx passes
- [X] T037 [P] [US2] `src/features/nonLoggedInHome/__tests__/VersionDialog.test.tsx`: maintenance shows server message and "Exit" only on Android and cannot be dismissed; mandatory shows "Update your app to experience all the latest features." with "Update" and "Exit" (Android only), not dismissable, "Update" opens `targetUrl`; on iOS no "Exit"; optional shows "Update" and "Skip" and "Skip" closes it (FR-052, FR-053, FR-054; BR-9; N-06, N-07, E-12; TC-407, TC-408, TC-409, TC-802, TC-803, TC-804) **Maps**: FR-052, FR-053, FR-054 · **Accept**: VersionDialog.test.tsx passes
- [X] T038 [P] [US2] `src/features/nonLoggedInHome/__tests__/useHomeBootstrap.test.tsx`: version check runs once per fresh mount and not on focus; Home is not blocked while it is pending; outcomes map to maintenance, mandatory, optional and generic error dialogs; `sessionExpired` shows nothing and clears the logged-in token silently; `none` and a thrown request show nothing; platform name sent is "Android" or "iOS" (FR-048, FR-049, FR-055, FR-056; BR-9; P-10, N-06 to N-09; TC-406 to TC-413) **Maps**: FR-048, FR-049, FR-055, FR-056 · **Accept**: useHomeBootstrap.test.tsx passes

### Implementation for User Story 2

- [X] T039 [P] [US2] Create `src/features/nonLoggedInHome/components/CommonMessageDialog.tsx`: message plus one button, no close icon, announced to screen readers, tokens only (FR-040, FR-055; BR-12) **Maps**: FR-040, FR-055 · **Accept**: CommonMessageDialog.tsx exists and its test passes
- [X] T040 [P] [US2] Create `src/features/nonLoggedInHome/components/VersionDialog.tsx` for maintenance, mandatory and optional outcomes with the labels from constants; "Update" opens the store URL through the system; "Exit" (Android only) closes the app; blocking outcomes cannot be dismissed (FR-052, FR-053, FR-054; BR-9; E-12) **Maps**: FR-052, FR-053, FR-054 · **Accept**: VersionDialog.tsx exists and its test passes
- [X] T041 [US2] Extend `src/features/nonLoggedInHome/hooks/useHomeBootstrap.ts`: after mount start `checkAppVersion()` once (ref guard, never on focus), expose `versionOutcome`; map `sessionExpired` to no dialog and call `logout()` from `src/services/sessionService.ts`; `error` to a `CommonMessageDialog` with "Okay" and the server message or generic text; all failures fail open (FR-048, FR-049, FR-055, FR-056; BR-9). Depends on T033. **Maps**: FR-048, FR-049, FR-055, FR-056 · **Accept**: useHomeBootstrap.ts runs the version check once per mount, fails open, and its tests pass
- [X] T042 [US2] Wire `VersionDialog` and the error `CommonMessageDialog` into `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx` on top of Home after the answer arrives, never blocking navigation or drawing (FR-049; BR-9; P-10, N-06 to N-09). Depends on T039, T040, T041. **Maps**: FR-049 · **Accept**: the version and error dialogs are wired into the screen on top of Home without blocking it

**Checkpoint**: US1 and US2 both work independently.

---

## Phase 5: User Story 3 - FAQs flow (Priority: P2)

**Goal**: BRD 4.5: cache first, blocking spinner, error dialog, double-tap guard.

**Independent Test**: tap "FAQs" with cache (instant), without cache (spinner then list), with an empty list, a non-list, and a failure (dialog "Okay") (P-07, P-08, N-02 to N-05).

### Tests for User Story 3

- [X] T043 [P] [US3] `src/features/nonLoggedInHome/__tests__/LoadingOverlay.test.tsx`: blocks touches while visible, announced to screen readers, hidden when not visible (FR-037, FR-042; BR-12; E-04) **Maps**: FR-037, FR-042 · **Accept**: LoadingOverlay.test.tsx passes
- [X] T044 [P] [US3] `src/features/nonLoggedInHome/__tests__/useFaqFlow.test.tsx`: `faqsFromNonLogin` set true on every tap; cached list opens `Faq` with no request and no spinner; no cache shows the spinner and requests once; non-empty list is stored and opens `Faq`; empty list and non-list stay on Home with no dialog; failure clears the spinner, shows the dialog with "Your request could not be processed at this moment. Request you to try again after sometime." and "Okay", records `dialog_shown` (`dialog_name: faq_error`, `screen: non_logged_home`, `kind: error`); "Okay" lets the user retry and a second attempt succeeds; double tap while loading sends one request; spinner cleared in every outcome (FR-035 to FR-041; BR-6, TV-2, PERF-3; P-07, P-08, N-02 to N-05, N-10; TC-301 to TC-308) **Maps**: FR-035, FR-036, FR-037, FR-038, FR-039, FR-040, FR-041 · **Accept**: useFaqFlow.test.tsx passes

### Implementation for User Story 3

- [X] T045 [P] [US3] Create `src/features/nonLoggedInHome/components/LoadingOverlay.tsx`: full-screen blocking activity indicator, announced, tokens only (FR-037, FR-042; BR-12) **Maps**: FR-037, FR-042 · **Accept**: LoadingOverlay.tsx exists and its test passes
- [X] T046 [US3] Create `src/features/nonLoggedInHome/hooks/useFaqFlow.ts` per plan "FAQ flow": read the cache from the `faq` slice, `fetchFaq()` from `src/services/faqService.ts`, `loading` ref guard, `finally` clears the overlay, dispatch `setFaqItems` only for a non-empty list, error dialog state, analytics `dialog_shown`, navigation to `Faq` through the guarded hook (FR-035 to FR-041; BR-6, TV-2, PERF-3). Depends on T027, T039 (dialog), T045. **Maps**: FR-035, FR-036, FR-037, FR-038, FR-039, FR-040, FR-041 · **Accept**: useFaqFlow.ts implements the cache-first flow and its tests pass
- [X] T047 [US3] Wire `useFaqFlow`, `LoadingOverlay` and the FAQ error `CommonMessageDialog` into `src/features/nonLoggedInHome/hooks/useHomeActions.ts` (FAQs tile) and `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx` (FR-015, BRD area 4.5; BR-6). Depends on T046. **Maps**: FR-015, FR-035, FR-036, FR-037, FR-038, FR-039, FR-040, FR-041, FR-042 · **Accept**: the FAQ flow, overlay and error dialog are wired into the FAQs tile and the screen

**Checkpoint**: US1, US2 and US3 work independently.

---

## Phase 6: User Story 4 - Customer Care popup (Priority: P3)

**Goal**: BRD 4.6: centred modal popup, three contact routes, focus return.

**Independent Test**: tap "Contact Us"; the popup shows the text exactly; each row hands off and closes; back, outside tap and close return focus to the tile (P-06, E-11).

### Tests for User Story 4

- [X] T048 [P] [US4] `src/features/nonLoggedInHome/__tests__/CustomerCarePopup.test.tsx`: heading and three rows with the exact text; modal for screen readers; "Call Us" opens the dialer for "022-45297300", "Email Us" opens mail to "bhflwecare@bajajhousing.co.in", "Find Us" navigates to `BranchLocator`, popup closes after each; close control, outside tap and back close it and return focus to the "Contact Us" tile; max height is window height minus insets minus 64 and the content scrolls; popup rows meet 44 minimum touch height (FR-043 to FR-047, FR-017; BR-7, BR-12; P-06, E-01, E-02, E-11; TC-205, TC-208, TC-607) **Maps**: FR-017, FR-043, FR-044, FR-045, FR-046, FR-047 · **Accept**: CustomerCarePopup.test.tsx passes

### Implementation for User Story 4

- [X] T049 [US4] Create `src/features/nonLoggedInHome/components/CustomerCarePopup.tsx` with the constants text, modal accessibility, focus move-in and return, hand-offs for dialer, mail and `BranchLocator`, close behaviours, scrolling height cap using safe-area insets, tokens only (FR-043 to FR-047; BR-7, BR-12) **Maps**: FR-043, FR-044, FR-045, FR-046, FR-047 · **Accept**: CustomerCarePopup.tsx exists and its tests pass
- [X] T050 [US4] Wire the popup into `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx` and the "Contact Us" handler in `src/features/nonLoggedInHome/hooks/useHomeActions.ts` (set `isNonLoggedUser` true, open popup over Home, no route change, ref to the tile for focus return) (FR-017, FR-043; BR-7; P-06). Depends on T049. **Maps**: FR-017, FR-043 · **Accept**: the popup is wired into the screen and the Contact Us handler with no route change

**Checkpoint**: US4 works independently.

---

## Phase 7: User Story 5 - Pay Now, Offers hand-off and focus reset (Priority: P2/P3)

**Goal**: BRD 4.2 (Pay Now, Offers) and 4.9: Pay Now header and back screen; offers state reset on every Home focus.

**Independent Test**: tap "Pay Now", see the header "Pay Now" and a back button, go back to Home; enter offers data, return, reopen Offers and find it empty (P-03, P-05, P-13, E-10, N-11).

### Tests for User Story 5

- [X] T051 [P] [US5] `src/features/nonLoggedInHome/__tests__/PayNowScreen.test.tsx`: header titled "Pay Now", a back button with role and label, back returns to Home, no other content (FR-014; BR-5; P-03, N-11; TC-202) **Maps**: FR-014 · **Accept**: PayNowScreen.test.tsx passes
- [X] T052 [P] [US5] `src/features/nonLoggedInHome/__tests__/useFocusReset.test.tsx`: on every focus dispatches `resetOffersForm`, `clearSelectedOffer` and `setRegisterNowReturnScreen(null)`; runs again on a second focus (returns from Offers, the Offers failure screen's "Ok", FAQ back, Pay Now back); does not clear `faq.items` or the non-logged token; no service call (FR-062 to FR-065; BR-11; P-13, E-10; TC-504, TC-505, TC-506) **Maps**: FR-062, FR-063, FR-064, FR-065 · **Accept**: useFocusReset.test.tsx passes

### Implementation for User Story 5

- [X] T053 [P] [US5] Create `src/features/nonLoggedInHome/PayNowScreen.tsx`: header titled "Pay Now" from constants and a back button only; no web view, no loader, no network (FR-014; BR-5) **Maps**: FR-014 · **Accept**: PayNowScreen.tsx shows the header and back button only
- [X] T054 [P] [US5] Create `src/features/nonLoggedInHome/hooks/useFocusReset.ts`: one focus effect with the three dispatches (FR-062 to FR-065; BR-11) **Maps**: FR-062, FR-063, FR-064, FR-065 · **Accept**: useFocusReset.ts dispatches the three resets on every focus
- [X] T055 [US5] Register `NonLoggedInPayNow` in `src/navigation/RootNavigator.tsx` with the header and back button options and add the "Pay Now" tile target (`{ title: 'Pay Now' }`) in `src/features/nonLoggedInHome/hooks/useHomeActions.ts` (FR-014; BR-5; P-03). Depends on T053, T032, T006. **Maps**: FR-014 · **Accept**: NonLoggedInPayNow is registered and the Pay Now tile opens it
- [X] T056 [US5] Use `useFocusReset` in `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx` (BRD area 4.9; BR-11). Depends on T054. **Maps**: FR-062, FR-063, FR-064, FR-065 · **Accept**: useFocusReset is used by the screen

**Checkpoint**: US5 works independently.

---

## Phase 8: User Story 6 - Android back and exit confirmation (Priority: P3)

**Goal**: BRD 4.8: exit dialog on Android back; popups and dialogs close first.

**Independent Test**: on Android press back on Home: dialog; "CANCEL" stays; "Okay" exits; with the popup open, back closes it first (P-11, P-12, E-11).

### Tests for User Story 6

- [X] T057 [P] [US6] `src/features/nonLoggedInHome/__tests__/ExitConfirmDialog.test.tsx`: "Are you sure you want to exit!" with "CANCEL" and "Okay"; handlers; announced (FR-058, FR-059; BR-10; P-11, P-12; TC-501, TC-502) **Maps**: FR-058, FR-059 · **Accept**: ExitConfirmDialog.test.tsx passes
- [X] T058 [P] [US6] `src/features/nonLoggedInHome/__tests__/useExitConfirm.test.tsx`: Android back with nothing open shows the dialog; "CANCEL" closes it; "Okay" exits the app; with the Contact Us popup or any dialog open, back closes that first and a second back shows the exit dialog; handler registered only while Home is focused and removed on blur; iOS registers nothing (FR-058 to FR-061; BR-10; P-11, P-12, E-11; TC-501, TC-502, TC-503) **Maps**: FR-058, FR-059, FR-060, FR-061 · **Accept**: useExitConfirm.test.tsx passes

### Implementation for User Story 6

- [X] T059 [P] [US6] Create `src/features/nonLoggedInHome/components/ExitConfirmDialog.tsx` (FR-058, FR-059; BR-10) **Maps**: FR-058, FR-059 · **Accept**: ExitConfirmDialog.tsx exists and its test passes
- [X] T060 [US6] Create `src/features/nonLoggedInHome/hooks/useExitConfirm.ts`: hardware-back handler with the precedence above, registered on focus and removed on blur (FR-058 to FR-061; BR-10). Depends on T059. **Maps**: FR-058, FR-059, FR-060, FR-061 · **Accept**: useExitConfirm.ts applies the back precedence and its tests pass
- [X] T061 [US6] Wire `useExitConfirm` and `ExitConfirmDialog` into `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx`, passing the open state of the popup, FAQ dialog, version dialog and exit dialog so the precedence holds (FR-060; BR-10; E-11). Depends on T060, T042, T047, T050. **Maps**: FR-060 · **Accept**: useExitConfirm and ExitConfirmDialog are wired into the screen with every popup and dialog state

**Checkpoint**: all six stories work independently.

---

## Phase 9: Accessibility pass (BRD 7.4, BR-12)

**Purpose**: prove FR-066 to FR-069 across the whole screen.

- [X] T062 [P] Write `src/features/nonLoggedInHome/__tests__/accessibility.test.tsx`: reading order is headline, six tiles row-wise, "Login"; six tiles and "Login" are role `button` with labels equal to visible text; illustration and tile icons hidden; popup modal; spinner and FAQ failure dialog announced; every touch target at least 44 x 44; at font scale 1.5 and 2 tiles stack with no fixed text height; no hard-coded colour in the feature (FR-066 to FR-069, FR-002, FR-011, FR-042, FR-044; BR-12; E-01 to E-04; TC-601, TC-602, TC-603, TC-604, TC-606, TC-607) **Maps**: FR-002, FR-011, FR-042, FR-044, FR-066, FR-067, FR-068, FR-069 · **Accept**: accessibility.test.tsx passes
- [X] T063 Fix every failure T062 reveals in the feature's components under `src/features/nonLoggedInHome/components/` and `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx` (BRD area 7.4; BR-12). Depends on T062. **Maps**: FR-066, FR-067, FR-068, FR-069 · **Accept**: every failure revealed by T062 is fixed in the feature components, or none existed
- [X] T064 [P] Add a theme test in `src/theme/__tests__/tokens.test.ts` that dark and high-contrast sets resolve for every token the feature reads and that the illustration and CTA gradient are exempt from remapping; record that remapped values are an open Design item (FR-006, FR-023, FR-068; BR-12; E-03; TC-605) **Maps**: FR-006, FR-023, FR-068 · **Accept**: the theme test shows dark and high-contrast sets resolve for every token and the brand art is exempt
- [X] T065 Record the manual accessibility checks M-10 to M-13 from `quickstart.md` (TalkBack, VoiceOver, text 2x with 0.36em spacing and 2x line height, dark mode, high contrast, 320 x 568, tablet) with steps, expected result and owner in `specs/002-non-logged-in-home-page/checklists/manual-checks.md` (BRD area 7.4; BR-12; E-02 to E-06; constitution Delivery Standards) **Maps**: FR-066, FR-067, FR-068, FR-069 · **Accept**: manual-checks.md lists M-10 to M-13 with steps, expected result and owner

---

## Phase 10: Polish and cross-cutting

- [X] T066 [P] Add a guard test `src/features/nonLoggedInHome/__tests__/isolation.test.ts` that fails if any file under `src/features/nonLoggedInHome/` imports from `src/features/nonLoggedHome/`, contains a raw `#` hex or `rgb(` colour, a direct `axios` or `fetch` call, or a literal user-facing string outside `nonLoggedInHomeConstants.ts` (plan Structure Decision; constitution I, II, V) **Maps**: FR-001, FR-010, FR-025, FR-034 · **Accept**: isolation.test.ts passes and fails on cross-feature imports, raw colours, direct network calls and stray strings
- [X] T067 Run `npx tsc --noEmit` and `npm run lint`; fix findings in files this feature added or edited; no `any` without a justified suppression (constitution VI, VII) **Maps**: FR-001, FR-010, FR-020, FR-025, FR-035, FR-043, FR-048, FR-058, FR-062, FR-066 · **Accept**: tsc --noEmit and lint report no new findings in this feature's files
- [X] T068 Run `npm test` and confirm no previously passing test is skipped or broken, in particular `src/services/__tests__/httpClient.test.ts` and everything under `src/features/nonLoggedHome/` (constitution VII; zero regressions) **Maps**: FR-028, FR-032, FR-035, FR-043, FR-048, FR-058, FR-062 · **Accept**: npm test passes with no previously passing test skipped or broken
- [X] T069 [P] Verify cleanup and performance: no timers, listeners or subscriptions left after unmount (back handler, focus listener, navigation lock timer); loaders clear on success, failure and cancel; no animation loops; a repeat-navigation test of 50 open and close cycles shows no growth in listener count (PERF-3, PERF-5; constitution VIII; TC-703) **Maps**: FR-071 · **Accept**: no listeners or timers remain after unmount, loaders clear on every outcome, and the 50-cycle test shows no growth
- [X] T070 [P] Security check: no credential, token or header value is logged in any new file; `X-BHFL-Auth` absent in all new request code; token mirrored to storage only through `src/services/authService.ts` (FR-026, FR-034; BRD 6.4, 7.3; constitution IV) **Maps**: FR-026, FR-034 · **Accept**: no credential, token or header value is logged and X-BHFL-Auth is absent from the new request code
- [ ] T071 Run the manual scenarios M-1 to M-14 in `specs/002-non-logged-in-home-page/quickstart.md` on Android and iOS; record owner, result and date in `specs/002-non-logged-in-home-page/checklists/manual-checks.md`; PERF-1 (2 s) and PERF-4 (200 ms) are pass or fail (all stories; TC-701, TC-702, TC-801) **Maps**: FR-070, FR-072 · **Accept**: manual scenarios M-1 to M-17 run on Android and iOS with owner, result and date recorded (open until a human runs them)
- [X] T072 Re-run the spec checklist in `specs/002-non-logged-in-home-page/checklists/requirements.md`, list every spec "Open Clarifications" item still open in the release notes, and raise the BRD change request for the owner overrides (no WebView, Pay Now header and back only, no popup on version 401, no `X-BHFL-Auth`) (plan Constitution Check IX) **Maps**: FR-014, FR-024, FR-031, FR-034, FR-056 · **Accept**: the spec checklist is re-run, open clarifications are listed in the release notes and the BRD change request is raised
- [X] T073 Build the requirement-to-test traceability table in `specs/002-non-logged-in-home-page/checklists/traceability.md` mapping every FR, BR, TV and P-/N-/E- scenario to its task and test file (constitution I and G4) **Maps**: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-012, FR-013, FR-014, FR-015, FR-016, FR-017, FR-018, FR-019, FR-020, FR-021, FR-022, FR-023, FR-024, FR-025, FR-026, FR-027, FR-028, FR-029, FR-030, FR-031, FR-032, FR-033, FR-034, FR-035, FR-036, FR-037, FR-038, FR-039, FR-040, FR-041, FR-042, FR-043, FR-044, FR-045, FR-046, FR-047, FR-048, FR-049, FR-050, FR-051, FR-052, FR-053, FR-054, FR-055, FR-056, FR-057, FR-058, FR-059, FR-060, FR-061, FR-062, FR-063, FR-064, FR-065, FR-066, FR-067, FR-068, FR-069, FR-070, FR-071, FR-072 · **Accept**: traceability.md maps every FR, BR, TV and scenario to its task and test file

---

## Phase 11: Retrofit Tests

**Purpose**: unit tests added by the test-case retrofit for QA cases that no existing test fully proved. Production code was not changed.

- [X] T074 Add 12 test(s) to `src/features/nonLoggedInHome/__tests__/NonLoggedInHomeScreen.test.tsx` for HOME_CONTACT_TC_003, HOME_CONTACT_TC_006, HOME_FAQ_TC_006, HOME_LAYOUT_TC_001, HOME_LAYOUT_TC_003, HOME_NET_TC_001, HOME_NET_TC_007, HOME_NET_TC_008, HOME_RESET_TC_004, HOME_STATE_TC_002, HOME_TOKEN_TC_005, HOME_VER_TC_012. **Maps**: FR-001, FR-002, FR-003, FR-005, FR-007, FR-008, FR-010, FR-020, FR-024, FR-025, FR-027, FR-040, FR-043, FR-046, FR-049, FR-052, FR-053, FR-065 · **Accept**: the new tests pass and each asserts the expected result of its QA case
- [X] T075 Add 1 test(s) to `src/features/nonLoggedInHome/__tests__/LoadingOverlay.test.tsx` for HOME_FAQ_TC_004. **Maps**: FR-037 · **Accept**: the new tests pass and each asserts the expected result of its QA case
- [X] T076 Add 2 test(s) to `src/features/nonLoggedInHome/__tests__/useFaqFlow.test.tsx` for HOME_FAQ_TC_007, HOME_NET_TC_004. **Maps**: FR-040 · **Accept**: the new tests pass and each asserts the expected result of its QA case
- [X] T077 Add 1 test(s) to `src/services/__tests__/faqContract.test.ts` for HOME_FAQ_TC_007. **Maps**: FR-040 · **Accept**: the new tests pass and each asserts the expected result of its QA case
- [X] T078 Add 1 test(s) to `src/features/nonLoggedInHome/__tests__/CustomerCarePopup.test.tsx` for HOME_CONTACT_TC_004. **Maps**: FR-047 · **Accept**: the new tests pass and each asserts the expected result of its QA case
- [X] T079 Add 1 test(s) to `src/features/nonLoggedInHome/__tests__/useFocusReset.test.tsx` for HOME_STATE_TC_001. **Maps**: FR-062, FR-063, FR-064, FR-065 · **Accept**: the new tests pass and each asserts the expected result of its QA case
- [X] T080 Add 3 test(s) to `src/services/__tests__/authService.test.ts` for HOME_TOKEN_TC_003, HOME_TOKEN_TC_004, HOME_TOKEN_TC_006. **Maps**: FR-026, FR-028, FR-029 · **Accept**: the new tests pass and each asserts the expected result of its QA case
- [X] T081 Add 2 test(s) to `src/services/__tests__/secureStorage.test.ts` for HOME_TOKEN_TC_007. **Maps**: FR-027 · **Accept**: the new tests pass and each asserts the expected result of its QA case
- [X] T082 Add 2 test(s) to `src/navigation/__tests__/guardedStack.test.tsx` for HOME_BACK_TC_005, HOME_NET_TC_006. **Maps**: FR-019, FR-035 · **Accept**: the new tests pass and each asserts the expected result of its QA case

---

## Phase 12: Retrofit Gaps

**Purpose**: parts of QA cases that no unit test in this repo can prove. Not implemented here.

- [ ] T083 Add a Register-module test that a stale `registerNowReturnScreen` does not pre-fill or lock the CIF field (HOME_RESET_TC_003); the Register screen is not in this repo. **Maps**: FR-064 · **Accept**: the Register screen test passes with the flag cleared on Home focus
- [ ] T084 Add an Offers-module test that "Ok" on the Offers failure screen returns to Home (HOME_RESET_TC_004); the Offers failure screen is not in this repo. **Maps**: FR-065 · **Accept**: the Offers failure screen test shows the navigation target is Home
- [ ] T085 Run on a device: spinner blocks touches (HOME_FAQ_TC_004), screen-reader focus returns to Contact Us (HOME_CONTACT_TC_003), popup does not clip at 2x text (HOME_CONTACT_TC_004), nothing clipped at 320 x 568 (HOME_NET_TC_007); record in `checklists/manual-checks.md` (M-5, M-10, M-11b, M-13). **Maps**: FR-037, FR-046, FR-047, FR-008 · **Accept**: each check is recorded with owner, result and date

---

## Dependencies and execution order

### Phase dependencies

- **Setup (Phase 1)**: none.
- **Foundational (Phase 2)**: depends on Setup (T006 routes, T004 constants). Blocks every story.
- **US1 (Phase 3)**: depends on Phase 2. MVP.
- **US2 (Phase 4)**: depends on Phase 2 and on US1's `NonLoggedInHomeScreen.tsx` and `useHomeBootstrap.ts` (T033, T034).
- **US3 (Phase 5)**: depends on US1 (`useHomeActions.ts`, screen) and on `CommonMessageDialog` from US2 (T039).
- **US4 (Phase 6)**: depends on US1.
- **US5 (Phase 7)**: depends on US1 and Setup T006.
- **US6 (Phase 8)**: depends on US1; its final wiring (T061) needs US2, US3 and US4 wired so back precedence covers every popup and dialog.
- **Accessibility (Phase 9)** and **Polish (Phase 10)**: depend on all stories.

Stories edit the same two files (`NonLoggedInHomeScreen.tsx`, `useHomeActions.ts`), so their wiring tasks run one after another; component and test files are independent.

### Within each story

Tests first and failing, then components and hooks, then wiring into the screen, then the checkpoint run.

### Parallel opportunities

- Setup: T003, T004, T005, T006, T007.
- Foundational: T008, T009, T010 together; then T013, T014, T015, T017 together.
- US1: all tests T019 to T024; all independent components T026 to T030.
- US2 to US6: the test files and the standalone components of each story (T036/T037/T038, T039/T040, T043/T044/T045, T051/T052/T053/T054, T057/T058/T059).
- Accessibility and Polish: T062, T064, T066, T069, T070.

### Parallel example: User Story 1

```text
Task: T019 QuickLinkTile.test.tsx
Task: T020 LoginButton.test.tsx
Task: T021 QuickLinkGrid.test.tsx
Task: T029 QuickLinkTile.tsx
Task: T030 LoginButton.tsx
```

---

## Implementation strategy

### MVP first (User Story 1 only)

1. Phase 1 Setup, Phase 2 Foundational.
2. Phase 3 US1: Home shell, tiles, "Login".
3. Stop and validate: Home matches Figma node 2:937, "Login" works, tile analytics fire, Home draws before the token call finishes.

### Incremental delivery

1. Add US2 (the gate, P1 with US1), then US3 (FAQ), then US5 (Pay Now, reset), US4 (popup), US6 (exit).
2. Run the checkpoint after each story; run the accessibility pass and polish last.

---

## Notes

- Constitution G4: every task above cites requirement IDs; every BRD test case (TC-) is mapped to an automated test task or to a manual check (T065, T071).
- Open spec items that remain: O-01, O-02, O-04, O-08, O-09, O-11, O-13, O-14 (AVL-2, retention, minimum OS only), O-15, O-16, the `forceUpdatev1` selection rule, and the narrowed O-06 (contact values) and O-12 (Backend sign-off). Resolved at implement stage: PERF-1 = 2 s, PERF-4 = 200 ms, Track Application link_name = `track_application`. AVL-2, retention and minimum OS versions have no checks until O-14 closes.
- FR-057 (installed version available for the "App version" footer on other screens): the installed version is already read on demand by `getAppVersion()` in `src/services/deviceInfo.ts`, so no store or task is added here. The footer itself belongs to the screens that show it.
- Tasks that edit existing shared files are T011 (`httpClient.ts`), T001 (`tokens.ts`), T006 (`routes.ts`), T035 and T055 (`RootNavigator.tsx`), and the optional fixes T016 and T018. All edits are additive and gated by T068.
- Commit after each task or logical group, using Conventional Commits and citing requirement IDs (constitution IX).

## TC -> Task coverage

Counts: 71 QA cases = 57 covered + 6 partial + 3 manual + 0 gap + 5 divergent + 0 qa-suspect + 0 out-of-scope (the parts must add up to the total).

| TC (id + short description) | Task(s) | Test approach |
|---|---|---|
| HOME_LAYOUT_TC_001 - Verify Home screen shows illustration, headline, six tiles and Login button. | T074, T025, T021, T064, T034, T031, T001 | unit-testable - render screen, assert root view backgroundColor equals page token alongside existing content assertions |
| HOME_LAYOUT_TC_002 - Verify tile labels and order. | T025, T021, T007, T034, T031, T004 | unit-testable - tile labels asserted by toEqual with exact capitalisation and order, in label file and as rendered |
| HOME_LAYOUT_TC_003 - Verify Home screen loads without waiting for background calls. | T074, T025, T038, T034, T041, T042 | unit-testable - token and version never resolve; no loading overlay and a tile press still navigates |
| HOME_ACTION_TC_001 - Verify Pay Now action opens the payment portal. | T025, T051, T034, T053, T055, T072 | unit-testable - divergent: case expects WebView with portal URL, spec decision is Pay Now screen with header and back button only |
| HOME_ACTION_TC_002 - Verify Our Products action routes to Products. | T024, T032 | unit-testable - ourProducts tile calls navigate('Products') |
| HOME_ACTION_TC_003 - Verify Track Application action routes to its destination. | T024, T032 | unit-testable - trackApplication tile hands off to TrackApplication route |
| HOME_ACTION_TC_004 - Verify FAQs action opens FAQ screen. | T025, T044, T034, T046, T047 | unit-testable - FAQs tile navigates to Faq with fetched list stored |
| HOME_ACTION_TC_005 - Verify Offers action routes to non-logged Offers. | T024, T032 | unit-testable - offers tile navigates to Offers route |
| HOME_ACTION_TC_006 - Verify Contact Us action opens the Customer Care popup. | T025, T034, T049, T050, T032 | unit-testable - Contact Us shows the popup on Home with no route change |
| HOME_ACTION_TC_007 - Verify Login button routes to Login screen. | T025, T024, T034, T032 | unit-testable - Login press navigates to LoginScreen |
| HOME_ACTION_TC_008 - Verify FAQ action fetches content when cache is not available. | T025, T044, T034, T046, T047 | unit-testable - empty cache: spinner, one fetch, items stored, Faq opens |
| HOME_ACTION_TC_009 - Verify FAQ action uses cached content when available. | T044, T046, T047 | unit-testable - seeded cache: Faq opens, no fetch, no spinner |
| HOME_ACTION_TC_010 - Verify user returns to Home after closing the Pay Now WebView. | T051, T053, T055, T072 | unit-testable - divergent: case refers to Pay Now WebView, spec has no WebView; replacement is back button returning to Home |
| HOME_NEG_TC_001 - Verify FAQ API failure with no cache shows error. | T025, T044, T034, T046, T047 | unit-testable - FAQ fetch rejects with no cache: spinner closes, exact error text rendered, navigate not called |
| HOME_NEG_TC_002 - Verify Pay Now URL unavailable is handled. | T051, T053, T055, T072 | unit-testable - divergent: spec says no WebView and Pay Now is header plus back only, so no URL can be missing |
| HOME_STATE_TC_001 - Verify stale session flags are reset on Home entry. | T079, T052, T054, T056 | unit-testable - mounting Home with dirty offers form, selected offer and register flag resets all three |
| HOME_STATE_TC_002 - Verify Home works when non-logged token generation succeeds. | T074, T025, T034 | unit-testable - after token resolves and settles every tile and Login still works |
| HOME_STATE_TC_003 - Verify token generation failure is handled silently. | T025, T038, T013, T034, T041, T016 | unit-testable - token failure resolves silently, no token stored, no dialog, Home stays usable |
| HOME_VER_TC_001 - Verify no dialog when app version is up to date. | T037, T014, T040, T016, T041, T042 | unit-testable - equal versions classify as none and none renders no dialog |
| HOME_VER_TC_002 - Verify maintenance dialog is shown. | T037, T038, T014, T040, T041, T016, T042 | unit-testable - maintenance outcome carries server message; dialog shows it with only Exit on Android and is not dismissible; hook marks it blocking |
| HOME_VER_TC_003 - Verify mandatory update dialog. | T037, T014, T040, T016, T041, T042 | unit-testable - mandatory outcome renders exact message with Update and Exit on Android, not dismissible |
| HOME_VER_TC_004 - Verify Update button opens the store link. | T037, T038, T040, T041, T042 | unit-testable - Update calls onUpdate(targetUrl) and the hook opens target url via Linking; real store opening is device behaviour |
| HOME_VER_TC_005 - Verify optional update dialog can be dismissed. | T037, T038, T014, T040, T041, T016, T042 | unit-testable - optional dialog shows Update and Skip, Skip dismisses, outcome returns to none |
| HOME_VER_TC_006 - Verify update is not enforced when status is not Active. | T014, T016, T041, T042 | unit-testable - outdated version with non-Active status classifies as none |
| HOME_VER_TC_007 - Verify version 1.8.10 is treated newer than 1.8.9. | T014, T016, T041, T042 | unit-testable - numeric part-by-part compare; installed 1.8.9 vs 1.8.10 gives mandatory |
| HOME_VER_TC_008 - Verify 401 from version service shows message and logs out. | T038, T025, T037, T014, T041, T034, T040, T016, T042, T072 | unit-testable - divergent: QA expects 401 popup with Okay then logout; spec says no popup and silent logged-in-token clear |
| HOME_VER_TC_009 - Verify version call failure or empty body fails open. | T038, T014, T041, T016, T042 | unit-testable - failed request or null/empty/malformed body resolves to none; rejected call leaves hook outcome none |
| HOME_VER_TC_010 - Verify version request sends capitalised platform value. | T014, T016, T041, T042 | unit-testable - request body is exactly {version:'1.8.9', user_agent:'Android'} on Android and 'iOS' on iOS |
| HOME_VER_TC_011 - Verify iOS has no Exit button on blocking dialogs. | T037, T040, T041, T042 | unit-testable - iOS mandatory dialog shows only Update, no Exit, not dismissible |
| HOME_VER_TC_012 - Verify blocking dialog cannot be dismissed by Android back. | T074, T037, T058, T034, T040, T060, T041, T042 | unit-testable - with a blocking outcome open, hardware back is swallowed: dialog visible, no exit-confirm dialog, exitApp not called |
| HOME_BACK_TC_001 - Verify exit confirmation shows on Android back. | T057, T025, T058, T059, T034, T060, T061 | unit-testable - Android back handler shows the dialog; text and CANCEL/Okay buttons asserted |
| HOME_BACK_TC_002 - Verify Okay on exit dialog closes the app. | T057, T025, T058, T059, T034, T060, T061 | unit-testable - Okay calls BackHandler.exitApp once (mocked); real process exit is native |
| HOME_BACK_TC_003 - Verify CANCEL on exit dialog keeps user on Home. | T057, T025, T058, T059, T034, T060, T061 | unit-testable - CANCEL closes the dialog, no exit; hook never navigates |
| HOME_BACK_TC_004 - Verify back closes Contact Us popup before exit dialog. | T025, T058, T034, T060, T061 | unit-testable - first back closes popup only, second back shows exit dialog |
| HOME_BACK_TC_005 - Verify FAQ back returns to Home. | T082, T027, T046, T047 | unit-testable - back from the Faq route pops to NonLoggedInHome and Home is visible |
| HOME_RESET_TC_001 - Verify offers form data is cleared on return to Home. | T052, T017, T054, T018, T056 | unit-testable - focus on Home resets the offers form to empty |
| HOME_RESET_TC_002 - Verify selected pre-approved offer is cleared on return to Home. | T025, T052, T034, T054, T056 | unit-testable - focus on Home clears offers.selectedOffer |
| HOME_RESET_TC_003 - Verify register return flag is cleared on return to Home. | T025, T052, T034, T054, T056, T083 | unit-testable - register return flag cleared on focus; partial - Register CIF field behaviour lives in the Register module, not in this repo |
| HOME_RESET_TC_004 - Verify Offers fail screen Ok returns to Home with reset state. | T074, T052, T034, T054, T056, T084 | unit-testable - reset runs on every focus event including return from Offers fail screen; partial - Offers failure screen "Ok" navigation lives in the Offers module, not in this repo |
| HOME_RESET_TC_005 - Verify focus reset does not clear FAQ cache or token. | T044, T052, T013, T046, T054, T016, T056 | unit-testable - reset keeps faq.items and token; cache opens FAQ without request (separate tests) |
| HOME_CONTACT_TC_001 - Verify popup heading and three rows. | T048, T049, T050 | unit-testable - popup renders heading and three rows with titles and subtitles |
| HOME_CONTACT_TC_002 - Verify popup closes with its close control. | T048, T025, T049, T034, T050 | unit-testable - close control closes popup with no route change |
| HOME_CONTACT_TC_003 - Verify focus returns to Contact Us tile after closing popup. | T074, T048, T034, T049, T050, T085 | unit-testable - setAccessibilityFocus called with tile handle on close; partial - real TalkBack/VoiceOver focus placement needs a device |
| HOME_CONTACT_TC_004 - Verify popup scrolls at large text sizes. | T078, T048, T049, T050, T085 | unit-testable - height cap function and scroll container exist; partial - visual no-clipping at 2x text needs a device |
| HOME_CONTACT_TC_005 - Verify Call, Email and Find Us tap behaviour. | T048, T049, T050 | unit-testable - tel:, mailto: and BranchLocator navigation per recorded decision; Linking mocked |
| HOME_CONTACT_TC_006 - Verify popup opens only once on rapid taps. | T074, T034, T049, T050 | unit-testable - two rapid Contact Us taps render exactly one popup |
| HOME_TOKEN_TC_001 - Verify Bearer token is sent on FAQ request. | T015, T012, T016, T011 | unit-testable - FAQ request carries Bearer plus app-version, platform, device-details; no X-BHFL-Auth |
| HOME_TOKEN_TC_002 - Verify token request times out after 10 seconds. | T025, T013, T034, T016 | unit-testable - request configured with 10000 ms timeout, error swallowed, Home usable; real abort is axios behaviour |
| HOME_TOKEN_TC_003 - Verify early FAQ tap waits for in-flight token. | T080, T013, T012, T016, T011 | unit-testable - token getter waits for in-flight request and client waits for provider (separate tests) |
| HOME_TOKEN_TC_004 - Verify relaunch after 15 minutes uses a fresh non-logged token. | T080, T013, T016 | unit-testable - non-logged slot only and fresh request on start; 15-minute real-time relaunch not modelled |
| HOME_TOKEN_TC_005 - Verify FAQ shows error after token failure. | T074, T044, T010, T034, T046, T009, T047 | unit-testable - failed fetch shows error dialog; token-failure precondition not linked |
| HOME_TOKEN_TC_006 - Verify token request body fields are encrypted. | T080, T013, T016 | unit-testable - username and password encrypted in request body; release log check is a build-level check |
| HOME_TOKEN_TC_007 - Verify token is stored after success. | T081, T013, T016 | unit-testable - memory slot and key name asserted; real store encryption not asserted |
| HOME_FAQ_TC_001 - Verify empty FAQ list keeps user on Home with no dialog. | T044, T015, T046, T016, T047 | unit-testable - useFaqFlow with fetchFaq resolving [] asserts spinner cleared, no navigate, no error dialog; service returns [] for empty array |
| HOME_FAQ_TC_002 - Verify non-array FAQ response does not crash. | T044, T015, T046, T016, T047 | unit-testable - faqService maps non-array bodies to [] without throwing; hook test proves an empty list stays on Home (two links proven in separate tests) |
| HOME_FAQ_TC_003 - Verify double tap on FAQs sends one request. | T044, T046, T047 | unit-testable - three onFaqPress calls with a pending fetch call fetchFaq once |
| HOME_FAQ_TC_004 - Verify spinner blocks other touches while FAQ loads. | T075, T043, T025, T045, T034, T046, T047, T085 | unit-testable - overlay is a visible modal element while loading and gone afterwards; partial - native touch blocking by the modal needs a device |
| HOME_FAQ_TC_005 - Verify retry after FAQ failure succeeds. | T044, T046, T047 | unit-testable - first fetch rejects, Okay, second fetch resolves; navigate('Faq') and two fetches |
| HOME_FAQ_TC_006 - Verify Okay on FAQ error dialog keeps user on Home. | T074, T025, T044, T034, T046, T047 | unit-testable - after failure and Okay: dialog gone, navigate not called, Home still rendered |
| HOME_FAQ_TC_007 - Verify spinner always clears on FAQ failure or timeout. | T076, T077, T044, T046, T016, T047 | unit-testable - FAQ call rejecting with a timeout error clears the spinner and shows the dialog |
| HOME_NET_TC_001 - Verify Home renders with no network. | T074, T025, T038, T034, T041 | unit-testable - all services rejecting leaves Home fully rendered and local tiles working; only FAQs degrades |
| HOME_NET_TC_002 - Verify FAQs with no network shows error. | T044, T046, T047 | unit-testable - fetchFaq rejecting: spinner cleared, error dialog visible, no navigation |
| HOME_NET_TC_003 - Verify Pay Now with no network shows WebView error. | T051, T053, T055, T072 | unit-testable - divergent: expects WebView error state; spec has no WebView, Pay Now is header plus back only |
| HOME_NET_TC_004 - Verify network lost mid FAQ fetch. | T076, T044, T046, T047 | unit-testable - request pending then rejects: spinner true, then false with dialog |
| HOME_NET_TC_005 - Verify rapid taps on different tiles open one destination. | T025, T068, T034, T027, T032 | unit-testable - rapid navigations to different destinations produce exactly one navigate call |
| HOME_NET_TC_006 - Verify rapid taps on the same tile do not duplicate screens. | T082, T068, T027, T032 | unit-testable - guarded navigate fires once per burst; stack depth needs a real navigator |
| HOME_NET_TC_007 - Verify layout on small screen 320 x 568. | T074, T025, T062, T034, T063, T085 | unit-testable - at 320x568 content is inside a ScrollView with Login within it; partial - visual no-clipping on a real 320 x 568 device needs a human |
| HOME_NET_TC_008 - Verify layout on tablet or wide screen. | T074, T034 | unit-testable - at a wide window the column is capped at layout.columnMaxWidth and centred; tablet rules pending O-13 |
| HOME_NET_TC_009 - Verify cold start time to interactive. | T071, T034 | manual - cold-start timing on a mid-range device from splash end (PERF-1, 2 s) |
| HOME_NET_TC_010 - Verify no memory growth when opening and closing tiles repeatedly. | T071, T069 | manual - 50 open/close cycles with a memory profiler on device (PERF-5) |
| HOME_NET_TC_011 - Verify Android and iOS parity. | T071, T034 | manual - side-by-side layout and flow check on Android and iOS devices |
