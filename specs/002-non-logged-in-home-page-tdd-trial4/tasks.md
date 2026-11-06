---

description: "Task list for the Non-Logged-In (Pre-Login) Home Page"
---

# Tasks: Non-Logged-In (Pre-Login) Home Page

**Input**: specs/002-non-logged-in-home-page-tdd-trial4/ (spec.md, plan.md, qa-cases.json, manual-verification.json, research.md, data-model.md, contracts/, quickstart.md)

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

- [ ] T-ENV-001: Run `npm test` (jest) - existing suite green. **Maps**: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-012, FR-013, FR-014, FR-015, FR-016, FR-017, FR-018, FR-019, FR-020, FR-021, FR-022, FR-023, FR-024, FR-025, FR-026, FR-027, FR-028, FR-029, FR-030, FR-031, FR-032, FR-033, FR-034, FR-035, FR-036, FR-037, FR-038, FR-039, FR-040, FR-041, FR-042, FR-043, FR-044, FR-045, FR-046, FR-047, FR-048, FR-049, FR-050, FR-051, FR-052, FR-053, FR-054, FR-055, FR-056, FR-057, FR-058, FR-059, FR-060, FR-061, FR-062, FR-063, FR-064, FR-065, FR-066, FR-067, FR-068, FR-069 · **Accept**: the whole suite passes with no skipped or failing test

---

## Phase 1: Setup and tokens

**Purpose**: tokens, assets, label file, types, routes. No behaviour yet.

- [X] T001 Add `fontFamilySemiBold: 'Rubik-SemiBold'` and `fontFamilyBold: 'Rubik-Bold'` to `typography` in `src/theme/tokens.ts` and extend `src/theme/__tests__/tokens.test.ts` to assert all four Rubik family tokens and the Figma values `#035795`, `#FF512F`, `#F09819`, angle 133.8255, tile width 96, icon height 40 (FR-004, FR-020; plan "Design tokens"; BRD 13.1) **Maps**: FR-004, FR-020 · **Accept**: tokens.test.ts asserts the four Rubik family tokens and the Figma values, and passes
- [X] T002 Confirm `Rubik-Regular.ttf`, `Rubik-Medium.ttf`, `Rubik-SemiBold.ttf`, `Rubik-Bold.ttf` are in `src/assets/fonts/` (already copied) and linked for both platforms: `react-native.config.js` already lists `./src/assets/fonts`; run `npx react-native-asset`, then check `ios/*/Info.plist` (`UIAppFonts`) and `android/app/src/main/assets/fonts/` contain all four. Record the result in the task commit (FR-004; G-3) **Maps**: FR-004 · **Accept**: all four Rubik font files are present in src/assets/fonts and linked for both platforms
- [X] T003 [P] Create `src/assets/nonLoggedInHome/` with copies of the six tile icons (`pay-now.png`, `our-products.png`, `track-application.png`, `faqs.png`, `offers.png`, `contact-us.png`) and `illustration.png` from `src/assets/nonLoggedHome/`, plus `src/assets/nonLoggedInHome/index.ts` exporting them by tile id (FR-002, FR-010; Figma 2:947-2:964) **Maps**: FR-002, FR-010 · **Accept**: the six tile icons and the illustration load from src/assets/nonLoggedInHome through its index
- [X] T004 [P] Create `src/features/nonLoggedInHome/nonLoggedInHomeConstants.ts` holding every on-screen string exactly as the spec quotes it: headline "Login to download account statements, make payments, and manage your account, on the go!" (three-line break), tile labels "Pay Now", "Our Products", "Track Application", "FAQs", "Offers", "Contact Us", "Login", popup text "We are here to help!" / "Call Us" / "022-45297300" / "Email Us" / "bhflwecare@bajajhousing.co.in" / "Find Us" / "Branch locator", FAQ error "Your request could not be processed at this moment. Request you to try again after sometime." / "Okay", exit text "Are you sure you want to exit!" / "CANCEL" / "Okay", update text "Update your app to experience all the latest features." / "Update" / "Exit" / "Skip", header "Pay Now"; the ordered tile table (id, label, linkName, route); analytics event and property names (FR-003, FR-010, FR-018, FR-040, FR-043, FR-048 to FR-057, FR-058 to FR-061; BRD 7.7) **Maps**: FR-003, FR-010, FR-018, FR-040, FR-043, FR-048, FR-049, FR-050, FR-051, FR-052, FR-053, FR-054, FR-055, FR-056, FR-057, FR-058, FR-059, FR-060, FR-061 · **Accept**: every on-screen string in the constants file equals the spec text
- [X] T005 [P] Create `src/features/nonLoggedInHome/types.ts` with `TileId`, `TileConfig`, `HomeDialogState` and a re-export of the shared `VersionOutcome` type (data-model.md "QuickLinkTile", "HomeUiState"; FR-010) **Maps**: FR-010 · **Accept**: the feature types compile and are imported by the hooks and components
- [X] T006 [P] Add routes `NonLoggedInHome` and `NonLoggedInPayNow` (params `{ title: string }`) to `ROUTES` and `RootStackParamList` in `src/navigation/routes.ts`, leaving every existing route unchanged (contracts/ui-and-navigation.md; FR-014) **Maps**: FR-014 · **Accept**: NonLoggedInHome and NonLoggedInPayNow routes exist and every earlier route is unchanged
- [X] T007 [P] Write `src/features/nonLoggedInHome/__tests__/constants.test.ts` asserting each string above is exactly equal to the spec text, tile order is "Pay Now", "Our Products", "Track Application", "FAQs", "Offers", "Contact Us", and there are no strings for Register Now, chatbot or accessibility icon (FR-010, FR-024; BR-4; P-01; TC-102, TC-103, TC-107, TC-108, TC-109) **Maps**: FR-010, FR-024 · **Accept**: constants.test.ts passes and asserts the exact strings, the tile order and no Register Now, chatbot or accessibility text

**Checkpoint**: tokens, assets, labels and routes exist.

---

## Phase 2: Foundational (blocking): shared API client, token and version services, FAQ store

**Purpose**: the network and state layers every story uses. No story starts before this is green.

**Shared API client** (contracts/shared-http-client.md, error-behaviour.md)

- [X] T008 [P] Create `src/services/apiErrors.ts` exporting `classifyApiError(error)` returning `{ status, errorCategory: 'Network' | 'Auth' | 'Server' | 'Validation', retryable }` with `retryable` true for network, timeout, 429 and 5xx; and `src/services/__tests__/apiErrors.test.ts` covering each category and the retryable rule (BRD 8.4.4; FR-032; N-01, N-02) **Maps**: FR-032 · **Accept**: apiErrors.test.ts passes for each error category and the retryable rule
- [X] T009 [P] Create `src/services/authRetry.ts` exporting `isAuthFailure(responseOrError)` (HTTP 401; HTTP 400 with body `statusCode` or `returnStatus.returnCode` "401" or "API_3000"; HTTP 200 with `returnStatus.returnCode` "401") and `retryOnceAfterTokenRefresh(config, deps)` that requests a fresh non-logged token, sets the new Bearer header and replays once, marks the replay, skips `skipAuth` calls and any call when a logged-in token exists, and returns or throws the original result when the replay fails (BRD 8.4.3; FR-032; BR-2, BR-3) **Maps**: FR-032 · **Accept**: isAuthFailure and retryOnceAfterTokenRefresh exist and follow the three auth-failure signals
- [X] T010 [P] Write `src/services/__tests__/authRetry.test.ts` covering: each of the three auth-failure signals triggers exactly one token refresh and one replay; a second auth failure on the replay gives no third call and passes the original error on; a logged-in token present means no retry; `skipAuth` never retries; 500 and network failures are not replayed (FR-032; BR-3; N-01, N-02, E-13) **Maps**: FR-032 · **Accept**: authRetry.test.ts passes for each signal, the single replay and the no-retry cases
- [X] T011 Hook `authRetry` into `src/services/httpClient.ts` as a response step (also checking successful HTTP 200 bodies) with no change to existing request behaviour; run `src/services/__tests__/httpClient.test.ts` and confirm every existing case still passes unchanged (FR-028, FR-032; BR-3; G-1; constitution V). Depends on T009. **Maps**: FR-028, FR-032 · **Accept**: httpClient applies the retry step and the pre-existing httpClient tests still pass unchanged
- [X] T012 Extend `src/services/__tests__/authRetry.test.ts` (or add `src/services/__tests__/httpClientRetry.test.ts`) with an end-to-end case through `post()`: FAQ call gets 401, token refresh runs once, replay carries the new Bearer, headers `app-version`, `platform`, `device-details` present and `X-BHFL-Auth` absent (FR-028, FR-034, FR-032; P-08, P-09; TC-404). Depends on T011. **Maps**: FR-028, FR-034, FR-032 · **Accept**: the end-to-end FAQ retry case passes with the new Bearer on the replay and no X-BHFL-Auth

**Token and version services** (contracts/generatetoken.md, force-update.md)

- [X] T013 [P] Write `src/services/__tests__/generatetokenContract.test.ts` (check `src/services/__tests__/authService.test.ts` first and add only cases not already covered): body `username` and `password` are in the form `base64url(IV):base64url(ciphertext+tag)` with no `=`, IV differs between calls; call is `skipAuth` with headers `Content-Type: application/json` and `X-BHFL-Auth` absent, `X-BHFL-Entity: mobileapp`; timeout is 10 s; empty or non-string `token` is rejected (TV-1); every failure is swallowed with no throw; the in-flight promise makes a concurrent call wait; a logged-in token is never returned as the non-logged token (FR-025 to FR-030; BR-2, BR-3, TV-1, PERF-2; P-09, N-01, E-13; TC-401, TC-402, TC-403, TC-404, TC-405) **Maps**: FR-025, FR-026, FR-027, FR-028, FR-029, FR-030 · **Accept**: generatetokenContract.test.ts passes for headers, body, timeout, validation and silent failure
- [X] T014 [P] Write `src/services/__tests__/versionContract.test.ts` (check `versionService.test.ts` first and add only missing cases): dotted numeric compare 1.8.10 vs 1.8.9 and missing parts as 0 (TV-3); enforce only when `status` is "Active" (TV-4); `user_agent` exactly "Android" or "iOS" on each platform (TV-5); each classification step of `contracts/force-update.md` has one case; null, empty, malformed body and thrown request give `none`; `X-BHFL-Auth` absent; the call is `forceUpdate/Secured` (FR-048, FR-050, FR-051, FR-056; BR-9, TV-3, TV-4, TV-5; P-10, N-06 to N-09, E-08, E-09; TC-406 to TC-413) **Maps**: FR-048, FR-050, FR-051, FR-056 · **Accept**: versionContract.test.ts passes for compare, enforcement, platform value, classification and fail-open
- [X] T015 [P] Write `src/services/__tests__/faqContract.test.ts` (check `faqService.test.ts` first): empty `{}` body; base is the bare API host; headers Bearer, `app-version`, `platform`, `device-details` present and `X-BHFL-Auth` absent; array returns items, empty array returns `[]`, object body returns `[]`, 500 rejects (FR-034, FR-037, FR-039, FR-040; BR-6, TV-2; N-02 to N-04; TC-302, TC-303, TC-304, TC-305) **Maps**: FR-034, FR-037, FR-039, FR-040 · **Accept**: faqContract.test.ts passes for headers, body shapes and failure
- [X] T016 Fix any failures T013 to T015 reveal in `src/services/authService.ts`, `src/services/versionService.ts` or `src/services/faqService.ts` with the smallest change; do not touch `src/features/nonLoggedHome/` and do not change behaviour that existing tests assert (FR-025 to FR-034, FR-035 to FR-042, FR-048 to FR-057; zero-regression gate VII). Depends on T013, T014, T015. Skip if all pass. **Maps**: FR-025, FR-026, FR-027, FR-028, FR-029, FR-030, FR-031, FR-032, FR-033, FR-034, FR-035, FR-036, FR-037, FR-038, FR-039, FR-040, FR-041, FR-042, FR-048, FR-049, FR-050, FR-051, FR-052, FR-053, FR-054, FR-055, FR-056, FR-057 · **Accept**: T013 to T015 pass, or no fix was needed

**FAQ and Home state** (data-model.md)

- [X] T017 [P] Write `src/store/__tests__/nonLoggedInHomeState.test.ts` covering: `faq.items` starts null, set only by `setFaqItems`, cleared only by `clearFaq` and survives the three focus-reset actions (FR-065); `token.nonLoggedToken` and `loggedInToken` are separate slots; `offers` reset values are `fullName: ""`, `mobileNo: ""`, `tncAccepted: false`, `selectedOffer: null`; `sessionFlags` `registerNowReturnScreen` set to null, `faqsFromNonLogin` and `isNonLoggedUser` default false (FR-017, FR-035, FR-062 to FR-065; BR-11; P-13; TC-504, TC-505, TC-506) **Maps**: FR-065, FR-017, FR-035, FR-062, FR-063, FR-064 · **Accept**: nonLoggedInHomeState.test.ts passes for the FAQ cache, token slots, offers reset and session flags
- [X] T018 Fix any failure T017 reveals in `src/store/tokenSlice.ts`, `src/store/faqSlice.ts`, `src/store/offersSlice.ts` or `src/store/sessionFlagsSlice.ts` with the smallest additive change. Skip if all pass. Depends on T017. **Maps**: FR-062, FR-063, FR-064, FR-065 · **Accept**: T017 passes, or no fix was needed

**Checkpoint**: `npm test -- src/services src/store` green, including all pre-existing tests. User story work can start.

---

## Phase 3: User Story 1 - Land on Home and reach Login (Priority: P1) 🎯 MVP

**Goal**: BRD 4.1, 4.2, 4.3: blue page, illustration, headline, six tiles, "Login", background token request on mount.

**Independent Test**: open Home with no session; the screen matches Figma node 2:937 at default settings; tapping "Login" opens the Login route; every tile tap records `quick_link_clicked`; the screen draws before the token call finishes (P-01, P-02, P-04, P-05, P-09, E-14).

### Tests for User Story 1 (write first, confirm they fail)

- [X] T019 [P] [US1] `src/features/nonLoggedInHome/__tests__/QuickLinkTile.test.tsx`: label text, role `button`, accessibility label equals visible label, icon hidden from the accessibility tree, press calls handler, minimum 44 x 44, tile width 96 and icon height 40 from tokens, "Track Application" label wraps to two lines (FR-011, FR-013; BR-4, BR-12; E-04, E-07; TC-105, TC-606) **Maps**: FR-011, FR-013 · **Accept**: QuickLinkTile.test.tsx passes for label, role, sizes, touch target and Track Application wrapping
- [X] T020 [P] [US1] `src/features/nonLoggedInHome/__tests__/LoginButton.test.tsx`: label "Login", role `button`, never disabled, gradient stops `#FF512F` and `#F09819` come from tokens, 307 x 40, radius 82, press handler, 44 minimum touch height met (FR-020, FR-022, FR-023; BR-8; P-02; TC-104, TC-606) **Maps**: FR-020, FR-022, FR-023 · **Accept**: LoginButton.test.tsx passes for label, role, never disabled, gradient and size
- [X] T021 [P] [US1] `src/features/nonLoggedInHome/__tests__/QuickLinkGrid.test.tsx`: six tiles in fixed order in a 3 + 3 layout at default; one full-width column when `stacked`; width 331 and row gap 18 (FR-010, FR-012; BR-4; P-01, E-01; TC-103, TC-603) **Maps**: FR-010, FR-012 · **Accept**: QuickLinkGrid.test.tsx passes for order, 3 + 3 layout, stacked column and grid sizes
- [X] T022 [P] [US1] `src/features/nonLoggedInHome/__tests__/useTextScaleLayout.test.ts`: `stacked` is false below font scale 1.5 and true at 1.5 and above (FR-012; BR-4; E-01; TC-603) **Maps**: FR-012 · **Accept**: useTextScaleLayout.test.ts passes at font scale below and above 1.5
- [X] T023 [P] [US1] `src/features/nonLoggedInHome/__tests__/useGuardedNavigate.test.tsx`: two quick taps navigate once; lock released on focus (FR-019; E-14) **Maps**: FR-019 · **Accept**: useGuardedNavigate.test.tsx passes for one destination per tap burst and release on focus
- [X] T024 [P] [US1] `src/features/nonLoggedInHome/__tests__/useHomeActions.test.tsx`: each tile tap records `quick_link_clicked` with `link_name`, `location: non_logged_home`, `logged_in: false` before navigating; Login records `cta_clicked` (`cta_name: login`, `screen: non_logged_home`) then navigates to `LoginScreen`; Our Products to `Products`; Offers to `Offers`; Track Application to `TrackApplication`; Contact Us records `contact_us_clicked` and sets `isNonLoggedUser`; a failed navigation is still counted (FR-015 to FR-019, FR-021; BR-4, BR-8; P-02, P-04, P-05, P-14, E-14; TC-201, TC-203, TC-204, TC-206, TC-207) **Maps**: FR-015, FR-016, FR-017, FR-018, FR-019, FR-021 · **Accept**: useHomeActions.test.tsx passes for analytics order, destinations and Contact Us
- [X] T025 [US1] `src/features/nonLoggedInHome/__tests__/NonLoggedInHomeScreen.test.tsx`: renders illustration, headline, six tiles, "Login", with `#035795` page and light status bar; no Register Now, chatbot or accessibility icon; Home draws while the token promise is pending; the token request is made once on mount; Login press opens Login (FR-001 to FR-007, FR-024, FR-025; BR-1, BR-2, BR-8; P-01, P-02, P-09, N-01; TC-101, TC-102, TC-106, TC-107, TC-108, TC-109, TC-702). Depends on T019 to T024 for shared helpers. **Maps**: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-024, FR-025 · **Accept**: NonLoggedInHomeScreen.test.tsx passes for the page content, Login, token request and dialogs

### Implementation for User Story 1

- [X] T026 [P] [US1] Create `src/features/nonLoggedInHome/components/gradient.ts` (own copy of the CSS-angle-to-line helper) (FR-020; plan research 7) **Maps**: FR-020 · **Accept**: the gradient helper exists and the Login button draws the Figma gradient
- [X] T027 [P] [US1] Create `src/features/nonLoggedInHome/hooks/useGuardedNavigate.ts` (own copy: one destination per tap burst, 800 ms lock, released on focus) (FR-019; BR-4; E-14) **Maps**: FR-019 · **Accept**: the guarded navigation hook opens one destination per tap burst
- [X] T028 [P] [US1] Create `src/features/nonLoggedInHome/hooks/useTextScaleLayout.ts` returning `{ stacked }` at font scale >= 1.5 (FR-012; BR-4; E-01) **Maps**: FR-012 · **Accept**: the layout hook returns stacked at font scale 1.5 and above
- [X] T029 [P] [US1] Create `src/features/nonLoggedInHome/components/QuickLinkTile.tsx`: 96 wide, padding 12 horizontal and 16 vertical, gap 8, radius 4, transparent background, 40-high icon, Rubik Regular 11.889 white centred label, role `button`, label from constants, icon hidden from accessibility, minimum 44 x 44, no fixed text height, pressed feedback with no layout shift; all values from `src/theme/tokens.ts` via `useTheme()` (FR-010, FR-011, FR-013; BR-4, BR-12) **Maps**: FR-010, FR-011, FR-013 · **Accept**: the tile component matches the Figma sizes and passes its tests
- [X] T030 [P] [US1] Create `src/features/nonLoggedInHome/components/LoginButton.tsx`: 307 x 40 pill, radius 82, padding 10 and 11.5, SVG gradient 133.8255 degrees from `#FF512F` at 5.5578% to `#F09819` at 94.442%, label "Login" Rubik Medium 14 white single line, role `button`, never disabled, exempt from dark remap (FR-020, FR-022, FR-023; BR-8) **Maps**: FR-020, FR-022, FR-023 · **Accept**: the Login button component matches the Figma pill and passes its tests
- [X] T031 [US1] Create `src/features/nonLoggedInHome/components/QuickLinkGrid.tsx`: 331 wide, two rows with 18 gap, three tiles per row spread with space between; one full-width column with the icon aligned to the first text line when `stacked` (FR-010, FR-012; BR-4). Depends on T028, T029. **Maps**: FR-010, FR-012 · **Accept**: the grid component shows 3 + 3 at default and one column when stacked
- [X] T032 [US1] Create `src/features/nonLoggedInHome/hooks/useHomeActions.ts`: tile and Login handlers that fire the typed analytics events first (`src/services/analytics.ts`), then navigate through the feature's `useGuardedNavigate`; Contact Us and FAQs handlers expose hooks for later stories (FR-015 to FR-019, FR-021; BR-4, BR-8). Depends on T027. **Maps**: FR-015, FR-016, FR-017, FR-018, FR-019, FR-021 · **Accept**: tile and Login handlers record analytics first and then navigate
- [X] T033 [US1] Create `src/features/nonLoggedInHome/hooks/useHomeBootstrap.ts`: on mount call `requestNonLoggedToken()` once without awaiting it for render; version check wiring is added in US2 (FR-025, FR-007; BR-2; P-09, N-01) **Maps**: FR-025, FR-007 · **Accept**: Home requests the token once on mount without waiting for it
- [X] T034 [US1] Create `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx`: scroll view with `#035795` background and light status bar; illustration block 311 x 310 (padding top 22, bottom 14, gap 28, art 172 x 140, hidden from accessibility); headline Rubik Regular 16 / line height 22 white centred with the three-line break; 18 gap; grid; "Login" with its top gap from Figma; scroll indicators hidden; no logic beyond composing hooks and components (FR-001 to FR-007, FR-020; BR-1, BR-12; P-01). Depends on T029 to T033. **Maps**: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-020 · **Accept**: the Home screen composes the illustration, headline, grid and Login at the Figma layout
- [X] T035 [US1] Register `NonLoggedInHome` in `src/navigation/RootNavigator.tsx` (additive; initial route unchanged) so the new screen is reachable for review (FR-001; plan structure). Depends on T034, T006. **Maps**: FR-001 · **Accept**: NonLoggedInHome is registered in the navigator and the initial route is unchanged

**Checkpoint**: US1 works alone; run `npm test -- src/features/nonLoggedInHome`.

---

## Phase 4: User Story 2 - Force-update and maintenance gate (Priority: P1)

**Goal**: BRD 4.7: once-per-mount version check, blocking dialogs, fail open, no popup on 401.

**Independent Test**: make the version service answer maintenance, mandatory, optional, 401, error and failure; each shows the dialog or nothing as specified (N-06 to N-09, E-08, E-12).

### Tests for User Story 2

- [X] T036 [P] [US2] `src/features/nonLoggedInHome/__tests__/CommonMessageDialog.test.tsx`: message text, one button with the given label, no close icon, role and announcement, button press handler (FR-040, FR-055; BR-12; TC-303) **Maps**: FR-040, FR-055 · **Accept**: CommonMessageDialog.test.tsx passes for message, single button, no close icon and announcement
- [X] T037 [P] [US2] `src/features/nonLoggedInHome/__tests__/VersionDialog.test.tsx`: maintenance shows server message and "Exit" only on Android and cannot be dismissed; mandatory shows "Update your app to experience all the latest features." with "Update" and "Exit" (Android only), not dismissable, "Update" opens `targetUrl`; on iOS no "Exit"; optional shows "Update" and "Skip" and "Skip" closes it (FR-052, FR-053, FR-054; BR-9; N-06, N-07, E-12; TC-407, TC-408, TC-409, TC-802, TC-803, TC-804) **Maps**: FR-052, FR-053, FR-054 · **Accept**: VersionDialog.test.tsx passes for maintenance, mandatory, optional and iOS variants
- [X] T038 [P] [US2] `src/features/nonLoggedInHome/__tests__/useHomeBootstrap.test.tsx`: version check runs once per fresh mount and not on focus; Home is not blocked while it is pending; outcomes map to maintenance, mandatory, optional and generic error dialogs; `sessionExpired` shows nothing and clears the logged-in token silently; `none` and a thrown request show nothing; platform name sent is "Android" or "iOS" (FR-048, FR-049, FR-055, FR-056; BR-9; P-10, N-06 to N-09; TC-406 to TC-413) **Maps**: FR-048, FR-049, FR-055, FR-056 · **Accept**: useHomeBootstrap.test.tsx passes for once-per-mount check, outcomes and fail-open

### Implementation for User Story 2

- [X] T039 [P] [US2] Create `src/features/nonLoggedInHome/components/CommonMessageDialog.tsx`: message plus one button, no close icon, announced to screen readers, tokens only (FR-040, FR-055; BR-12) **Maps**: FR-040, FR-055 · **Accept**: the message dialog component shows one button and no close icon
- [X] T040 [P] [US2] Create `src/features/nonLoggedInHome/components/VersionDialog.tsx` for maintenance, mandatory and optional outcomes with the labels from constants; "Update" opens the store URL through the system; "Exit" (Android only) closes the app; blocking outcomes cannot be dismissed (FR-052, FR-053, FR-054; BR-9; E-12) **Maps**: FR-052, FR-053, FR-054 · **Accept**: the version dialog shows the right buttons per outcome and platform and blocks dismissal
- [X] T041 [US2] Extend `src/features/nonLoggedInHome/hooks/useHomeBootstrap.ts`: after mount start `checkAppVersion()` once (ref guard, never on focus), expose `versionOutcome`; map `sessionExpired` to no dialog and call `logout()` from `src/services/sessionService.ts`; `error` to a `CommonMessageDialog` with "Okay" and the server message or generic text; all failures fail open (FR-048, FR-049, FR-055, FR-056; BR-9). Depends on T033. **Maps**: FR-048, FR-049, FR-055, FR-056 · **Accept**: the bootstrap hook exposes the version outcome and fails open
- [X] T042 [US2] Wire `VersionDialog` and the error `CommonMessageDialog` into `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx` on top of Home after the answer arrives, never blocking navigation or drawing (FR-049; BR-9; P-10, N-06 to N-09). Depends on T039, T040, T041. **Maps**: FR-049 · **Accept**: the version dialog and the error dialog show on top of Home after the answer arrives

**Checkpoint**: US1 and US2 both work independently.

---

## Phase 5: User Story 3 - FAQs flow (Priority: P2)

**Goal**: BRD 4.5: cache first, blocking spinner, error dialog, double-tap guard.

**Independent Test**: tap "FAQs" with cache (instant), without cache (spinner then list), with an empty list, a non-list, and a failure (dialog "Okay") (P-07, P-08, N-02 to N-05).

### Tests for User Story 3

- [X] T043 [P] [US3] `src/features/nonLoggedInHome/__tests__/LoadingOverlay.test.tsx`: blocks touches while visible, announced to screen readers, hidden when not visible (FR-037, FR-042; BR-12; E-04) **Maps**: FR-037, FR-042 · **Accept**: LoadingOverlay.test.tsx passes for blocking, announcement and hidden state
- [X] T044 [P] [US3] `src/features/nonLoggedInHome/__tests__/useFaqFlow.test.tsx`: `faqsFromNonLogin` set true on every tap; cached list opens `Faq` with no request and no spinner; no cache shows the spinner and requests once; non-empty list is stored and opens `Faq`; empty list and non-list stay on Home with no dialog; failure clears the spinner, shows the dialog with "Your request could not be processed at this moment. Request you to try again after sometime." and "Okay", records `dialog_shown` (`dialog_name: faq_error`, `screen: non_logged_home`, `kind: error`); "Okay" lets the user retry and a second attempt succeeds; double tap while loading sends one request; spinner cleared in every outcome (FR-035 to FR-041; BR-6, TV-2, PERF-3; P-07, P-08, N-02 to N-05, N-10; TC-301 to TC-308) **Maps**: FR-035, FR-036, FR-037, FR-038, FR-039, FR-040, FR-041 · **Accept**: useFaqFlow.test.tsx passes for every FAQ outcome

### Implementation for User Story 3

- [X] T045 [P] [US3] Create `src/features/nonLoggedInHome/components/LoadingOverlay.tsx`: full-screen blocking activity indicator, announced, tokens only (FR-037, FR-042; BR-12) **Maps**: FR-037, FR-042 · **Accept**: the loading overlay is a full-screen blocking indicator that is announced
- [X] T046 [US3] Create `src/features/nonLoggedInHome/hooks/useFaqFlow.ts` per plan "FAQ flow": read the cache from the `faq` slice, `fetchFaq()` from `src/services/faqService.ts`, `loading` ref guard, `finally` clears the overlay, dispatch `setFaqItems` only for a non-empty list, error dialog state, analytics `dialog_shown`, navigation to `Faq` through the guarded hook (FR-035 to FR-041; BR-6, TV-2, PERF-3). Depends on T027, T039 (dialog), T045. **Maps**: FR-035, FR-036, FR-037, FR-038, FR-039, FR-040, FR-041 · **Accept**: the FAQ flow hook follows cache first, one request, and clears the spinner in every outcome
- [X] T047 [US3] Wire `useFaqFlow`, `LoadingOverlay` and the FAQ error `CommonMessageDialog` into `src/features/nonLoggedInHome/hooks/useHomeActions.ts` (FAQs tile) and `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx` (FR-015, FR-035 to FR-042; BR-6). Depends on T046. **Maps**: FR-015, FR-035, FR-036, FR-037, FR-038, FR-039, FR-040, FR-041, FR-042 · **Accept**: the FAQs tile runs the FAQ flow and the overlay and error dialog are wired

**Checkpoint**: US1, US2 and US3 work independently.

---

## Phase 6: User Story 4 - Customer Care popup (Priority: P3)

**Goal**: BRD 4.6: centred modal popup, three contact routes, focus return.

**Independent Test**: tap "Contact Us"; the popup shows the text exactly; each row hands off and closes; back, outside tap and close return focus to the tile (P-06, E-11).

### Tests for User Story 4

- [X] T048 [P] [US4] `src/features/nonLoggedInHome/__tests__/CustomerCarePopup.test.tsx`: heading and three rows with the exact text; modal for screen readers; "Call Us" opens the dialer for "022-45297300", "Email Us" opens mail to "bhflwecare@bajajhousing.co.in", "Find Us" navigates to `BranchLocator`, popup closes after each; close control, outside tap and back close it and return focus to the "Contact Us" tile; max height is window height minus insets minus 64 and the content scrolls; popup rows meet 44 minimum touch height (FR-043 to FR-047, FR-017; BR-7, BR-12; P-06, E-01, E-02, E-11; TC-205, TC-208, TC-607) **Maps**: FR-043, FR-044, FR-045, FR-046, FR-047, FR-017 · **Accept**: CustomerCarePopup.test.tsx passes for text, modality, hand-offs, closing and height cap

### Implementation for User Story 4

- [X] T049 [US4] Create `src/features/nonLoggedInHome/components/CustomerCarePopup.tsx` with the constants text, modal accessibility, focus move-in and return, hand-offs for dialer, mail and `BranchLocator`, close behaviours, scrolling height cap using safe-area insets, tokens only (FR-043 to FR-047; BR-7, BR-12) **Maps**: FR-043, FR-044, FR-045, FR-046, FR-047 · **Accept**: the popup component shows the exact text and closes on every route
- [X] T050 [US4] Wire the popup into `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx` and the "Contact Us" handler in `src/features/nonLoggedInHome/hooks/useHomeActions.ts` (set `isNonLoggedUser` true, open popup over Home, no route change, ref to the tile for focus return) (FR-017, FR-043; BR-7; P-06). Depends on T049. **Maps**: FR-017, FR-043 · **Accept**: Contact Us opens the popup over Home with no route change

**Checkpoint**: US4 works independently.

---

## Phase 7: User Story 5 - Pay Now, Offers hand-off and focus reset (Priority: P2/P3)

**Goal**: BRD 4.2 (Pay Now, Offers) and 4.9: Pay Now header and back screen; offers state reset on every Home focus.

**Independent Test**: tap "Pay Now", see the header "Pay Now" and a back button, go back to Home; enter offers data, return, reopen Offers and find it empty (P-03, P-05, P-13, E-10, N-11).

### Tests for User Story 5

- [X] T051 [P] [US5] `src/features/nonLoggedInHome/__tests__/PayNowScreen.test.tsx`: header titled "Pay Now", a back button with role and label, back returns to Home, no other content (FR-014; BR-5; P-03, N-11; TC-202) **Maps**: FR-014 · **Accept**: PayNowScreen.test.tsx passes for the header, back button and no other content
- [X] T052 [P] [US5] `src/features/nonLoggedInHome/__tests__/useFocusReset.test.tsx`: on every focus dispatches `resetOffersForm`, `clearSelectedOffer` and `setRegisterNowReturnScreen(null)`; runs again on a second focus (returns from Offers, the Offers failure screen's "Ok", FAQ back, Pay Now back); does not clear `faq.items` or the non-logged token; no service call (FR-062 to FR-065; BR-11; P-13, E-10; TC-504, TC-505, TC-506) **Maps**: FR-062, FR-063, FR-064, FR-065 · **Accept**: useFocusReset.test.tsx passes for the three resets on every focus and nothing else cleared

### Implementation for User Story 5

- [X] T053 [P] [US5] Create `src/features/nonLoggedInHome/PayNowScreen.tsx`: header titled "Pay Now" from constants and a back button only; no web view, no loader, no network (FR-014; BR-5) **Maps**: FR-014 · **Accept**: the Pay Now screen shows the header and back button only
- [X] T054 [P] [US5] Create `src/features/nonLoggedInHome/hooks/useFocusReset.ts`: one focus effect with the three dispatches (FR-062 to FR-065; BR-11) **Maps**: FR-062, FR-063, FR-064, FR-065 · **Accept**: the focus hook dispatches the three resets on every focus
- [X] T055 [US5] Register `NonLoggedInPayNow` in `src/navigation/RootNavigator.tsx` with the header and back button options and add the "Pay Now" tile target (`{ title: 'Pay Now' }`) in `src/features/nonLoggedInHome/hooks/useHomeActions.ts` (FR-014; BR-5; P-03). Depends on T053, T032, T006. **Maps**: FR-014 · **Accept**: the Pay Now tile opens the Pay Now screen with the title Pay Now
- [X] T056 [US5] Use `useFocusReset` in `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx` (FR-062 to FR-065; BR-11). Depends on T054. **Maps**: FR-062, FR-063, FR-064, FR-065 · **Accept**: Home runs the focus reset on every return

**Checkpoint**: US5 works independently.

---

## Phase 8: User Story 6 - Android back and exit confirmation (Priority: P3)

**Goal**: BRD 4.8: exit dialog on Android back; popups and dialogs close first.

**Independent Test**: on Android press back on Home: dialog; "CANCEL" stays; "Okay" exits; with the popup open, back closes it first (P-11, P-12, E-11).

### Tests for User Story 6

- [X] T057 [P] [US6] `src/features/nonLoggedInHome/__tests__/ExitConfirmDialog.test.tsx`: "Are you sure you want to exit!" with "CANCEL" and "Okay"; handlers; announced (FR-058, FR-059; BR-10; P-11, P-12; TC-501, TC-502) **Maps**: FR-058, FR-059 · **Accept**: ExitConfirmDialog.test.tsx passes for text, buttons and handlers
- [X] T058 [P] [US6] `src/features/nonLoggedInHome/__tests__/useExitConfirm.test.tsx`: Android back with nothing open shows the dialog; "CANCEL" closes it; "Okay" exits the app; with the Contact Us popup or any dialog open, back closes that first and a second back shows the exit dialog; handler registered only while Home is focused and removed on blur; iOS registers nothing (FR-058 to FR-061; BR-10; P-11, P-12, E-11; TC-501, TC-502, TC-503) **Maps**: FR-058, FR-059, FR-060, FR-061 · **Accept**: useExitConfirm.test.tsx passes for back precedence and focus-bound registration

### Implementation for User Story 6

- [X] T059 [P] [US6] Create `src/features/nonLoggedInHome/components/ExitConfirmDialog.tsx` (FR-058, FR-059; BR-10) **Maps**: FR-058, FR-059 · **Accept**: the exit dialog component shows the exact text with CANCEL and Okay
- [X] T060 [US6] Create `src/features/nonLoggedInHome/hooks/useExitConfirm.ts`: hardware-back handler with the precedence above, registered on focus and removed on blur (FR-058 to FR-061; BR-10). Depends on T059. **Maps**: FR-058, FR-059, FR-060, FR-061 · **Accept**: the back handler follows the precedence popup, dialog, then exit dialog
- [X] T061 [US6] Wire `useExitConfirm` and `ExitConfirmDialog` into `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx`, passing the open state of the popup, FAQ dialog, version dialog and exit dialog so the precedence holds (FR-060; BR-10; E-11). Depends on T060, T042, T047, T050. **Maps**: FR-060 · **Accept**: the Home screen passes every open popup and dialog state to the back handler

**Checkpoint**: all six stories work independently.

---

## Phase 9: Accessibility pass (BRD 7.4, BR-12)

**Purpose**: prove FR-066 to FR-069 across the whole screen.

- [X] T062 [P] Write `src/features/nonLoggedInHome/__tests__/accessibility.test.tsx`: reading order is headline, six tiles row-wise, "Login"; six tiles and "Login" are role `button` with labels equal to visible text; illustration and tile icons hidden; popup modal; spinner and FAQ failure dialog announced; every touch target at least 44 x 44; at font scale 1.5 and 2 tiles stack with no fixed text height; no hard-coded colour in the feature (FR-066 to FR-069, FR-002, FR-011, FR-042, FR-044; BR-12; E-01 to E-04; TC-601, TC-602, TC-603, TC-604, TC-606, TC-607) **Maps**: FR-066, FR-067, FR-068, FR-069, FR-002, FR-011, FR-042, FR-044 · **Accept**: accessibility.test.tsx passes for order, roles, hidden icons, touch targets and stacking
- [X] T063 Fix every failure T062 reveals in the feature's components under `src/features/nonLoggedInHome/components/` and `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx` (FR-066 to FR-069; BR-12). Depends on T062. **Maps**: FR-066, FR-067, FR-068, FR-069 · **Accept**: every failure found by T062 is fixed, or none was found
- [X] T064 [P] Add a theme test in `src/theme/__tests__/tokens.test.ts` that dark and high-contrast sets resolve for every token the feature reads and that the illustration and CTA gradient are exempt from remapping; record that remapped values are an open Design item (FR-006, FR-023, FR-068; BR-12; E-03; TC-605) **Maps**: FR-006, FR-023, FR-068 · **Accept**: the theme test passes for dark and high-contrast sets and the exempt CTA gradient
- [X] T065 Record the manual accessibility checks M-10 to M-13 from `quickstart.md` (TalkBack, VoiceOver, text 2x with 0.36em spacing and 2x line height, dark mode, high contrast, 320 x 568, tablet) with steps, expected result and owner in `specs/002-non-logged-in-home-page/checklists/manual-checks.md` (FR-066 to FR-069; BR-12; E-02 to E-06; constitution Delivery Standards) **Maps**: FR-066, FR-067, FR-068, FR-069 · **Accept**: manual-checks.md lists steps, expected result and owner for the accessibility checks

---

## Phase 10: Polish and cross-cutting

- [X] T066 [P] Add a guard test `src/features/nonLoggedInHome/__tests__/isolation.test.ts` that fails if any file under `src/features/nonLoggedInHome/` imports from `src/features/nonLoggedHome/`, contains a raw `#` hex or `rgb(` colour, a direct `axios` or `fetch` call, or a literal user-facing string outside `nonLoggedInHomeConstants.ts` (plan Structure Decision; constitution I, II, V) **Maps**: FR-001, FR-004, FR-010, FR-025 · **Accept**: isolation.test.ts passes and fails on cross-imports, raw colours, direct network calls and stray strings
- [X] T067 Run `npx tsc --noEmit` and `npm run lint`; fix findings in files this feature added or edited; no `any` without a justified suppression (constitution VI, VII) **Maps**: FR-001, FR-010, FR-025, FR-035, FR-048 · **Accept**: tsc and lint report no finding in files this feature added or edited
- [X] T068 Run `npm test` and confirm no previously passing test is skipped or broken, in particular `src/services/__tests__/httpClient.test.ts` and everything under `src/features/nonLoggedHome/` (constitution VII; zero regressions) **Maps**: FR-001, FR-010, FR-025, FR-035, FR-048, FR-058, FR-062 · **Accept**: the full suite shows no skipped or broken earlier test
- [X] T069 [P] Verify cleanup and performance: no timers, listeners or subscriptions left after unmount (back handler, focus listener, navigation lock timer); loaders clear on success, failure and cancel; no animation loops; a repeat-navigation test of 50 open and close cycles shows no growth in listener count (PERF-3, PERF-5; constitution VIII; TC-703) **Maps**: FR-058, FR-062 · **Accept**: no listener or timer remains after unmount and 50 open and close cycles do not grow the listener count
- [X] T070 [P] Security check: no credential, token or header value is logged in any new file; `X-BHFL-Auth` absent in all new request code; token mirrored to storage only through `src/services/authService.ts` (FR-026, FR-034; BRD 6.4, 7.3; constitution IV) **Maps**: FR-026, FR-034 · **Accept**: no credential or header value is logged and X-BHFL-Auth is absent from new request code
- [ ] T071 Run the manual scenarios M-1 to M-14 in `specs/002-non-logged-in-home-page/quickstart.md` on Android and iOS; record owner, result and date in `specs/002-non-logged-in-home-page/checklists/manual-checks.md`; PERF-1 (2 s) and PERF-4 (200 ms) are pass or fail (all stories; TC-701, TC-702, TC-801) **Maps**: FR-001, FR-007, FR-010, FR-043, FR-058, FR-062, FR-066 · **Accept**: every manual scenario M-1 to M-18 has an owner, result and date recorded
- [X] T072 Re-run the spec checklist in `specs/002-non-logged-in-home-page/checklists/requirements.md`, list every spec "Open Clarifications" item still open in the release notes, and raise the BRD change request for the owner overrides (no WebView, Pay Now header and back only, no popup on version 401, no `X-BHFL-Auth`) (plan Constitution Check IX) **Maps**: FR-001, FR-008, FR-009, FR-031 · **Accept**: the requirements checklist is re-run and open clarifications are listed in the release notes
- [X] T073 Build the requirement-to-test traceability table in `specs/002-non-logged-in-home-page/checklists/traceability.md` mapping every FR, BR, TV and P-/N-/E- scenario to its task and test file (constitution I and G4) **Maps**: FR-001, FR-010, FR-025, FR-035, FR-043, FR-048, FR-058, FR-062, FR-066 · **Accept**: the traceability table maps every FR, BR, TV and scenario to its task and test file

## Phase 11: Retrofit Tests

**Purpose**: new unit tests that prove QA cases no earlier test proved. Each was written and passed in the retrofit run.

- [X] T074 Add test `[HOME_LAYOUT_TC_001]` in `src/features/nonLoggedInHome/__tests__/NonLoggedInHomeScreen.test.tsx`: the page paints the brand blue background token #035795 (HOME_LAYOUT_TC_001) **Maps**: FR-001, FR-002, FR-003, FR-010, FR-020, FR-024 · **Accept**: the test exists, carries `// Covers: HOME_LAYOUT_TC_001` and passes
- [X] T075 Add test `[HOME_LAYOUT_TC_003]` in `src/features/nonLoggedInHome/__tests__/NonLoggedInHomeScreen.test.tsx`: six tiles and Login draw and Login navigates while the token and version calls are pending, with no loader (HOME_LAYOUT_TC_003) **Maps**: FR-007 · **Accept**: the test exists, carries `// Covers: HOME_LAYOUT_TC_003` and passes
- [X] T076 Add test `[HOME_STATE_TC_002]` in `src/features/nonLoggedInHome/__tests__/NonLoggedInHomeScreen.test.tsx`: seven enabled buttons and a tile navigation after the token succeeds (HOME_STATE_TC_002) **Maps**: FR-010, FR-022 · **Accept**: the test exists, carries `// Covers: HOME_STATE_TC_002` and passes
- [X] T077 Add test `[HOME_STATE_TC_003]` in `src/features/nonLoggedInHome/__tests__/NonLoggedInHomeScreen.test.tsx`: a rejected token request shows no error and a later FAQ failure shows its own dialog (HOME_STATE_TC_003) **Maps**: FR-030, FR-007 · **Accept**: the test exists, carries `// Covers: HOME_STATE_TC_003` and passes
- [X] T078 Add test `[HOME_RESET_TC_005]` in `src/features/nonLoggedInHome/__tests__/NonLoggedInHomeScreen.test.tsx`: after a focus reset the FAQ opens from cache with no request and the token is kept (HOME_RESET_TC_005) **Maps**: FR-065, FR-036 · **Accept**: the test exists, carries `// Covers: HOME_RESET_TC_005` and passes
- [X] T079 Add test `[HOME_CONTACT_TC_006]` in `src/features/nonLoggedInHome/__tests__/NonLoggedInHomeScreen.test.tsx`: two rapid taps on Contact Us open one popup (HOME_CONTACT_TC_006) **Maps**: FR-043 · **Accept**: the test exists, carries `// Covers: HOME_CONTACT_TC_006` and passes
- [X] T080 Add test `[HOME_TOKEN_TC_005]` in `src/features/nonLoggedInHome/__tests__/NonLoggedInHomeScreen.test.tsx`: the FAQ error dialog shows when the FAQ request fails after a token failure (HOME_TOKEN_TC_005) **Maps**: FR-037, FR-040 · **Accept**: the test exists, carries `// Covers: HOME_TOKEN_TC_005` and passes
- [X] T081 Add test `[HOME_FAQ_TC_006]` in `src/features/nonLoggedInHome/__tests__/NonLoggedInHomeScreen.test.tsx`: after Okay on the FAQ error dialog the user stays on Home (HOME_FAQ_TC_006) **Maps**: FR-040 · **Accept**: the test exists, carries `// Covers: HOME_FAQ_TC_006` and passes
- [X] T082 Add test `[HOME_NET_TC_001]` in `src/features/nonLoggedInHome/__tests__/NonLoggedInHomeScreen.test.tsx`: Home renders fully when the token and version calls fail (HOME_NET_TC_001) **Maps**: FR-007, FR-030 · **Accept**: the test exists, carries `// Covers: HOME_NET_TC_001` and passes
- [X] T083 Add test `[HOME_NET_TC_007]` in `src/features/nonLoggedInHome/__tests__/NonLoggedInHomeScreen.test.tsx`: Login and all tiles sit inside the scroll view on a 320 x 568 window (HOME_NET_TC_007) **Maps**: FR-005, FR-008 · **Accept**: the test exists, carries `// Covers: HOME_NET_TC_007` and passes
- [X] T084 Add test `[HOME_FAQ_TC_007]` in `src/features/nonLoggedInHome/__tests__/useFaqFlow.test.tsx`: a timeout clears the spinner and shows the FAQ error dialog (HOME_FAQ_TC_007) **Maps**: FR-040 · **Accept**: the test exists, carries `// Covers: HOME_FAQ_TC_007` and passes
- [X] T085 Add test `[HOME_NET_TC_002]` in `src/features/nonLoggedInHome/__tests__/useFaqFlow.test.tsx`: with no network the FAQ flow shows the error dialog and clears the spinner (HOME_NET_TC_002) **Maps**: FR-037, FR-040 · **Accept**: the test exists, carries `// Covers: HOME_NET_TC_002` and passes
- [X] T086 Add test `[HOME_NET_TC_004]` in `src/features/nonLoggedInHome/__tests__/useFaqFlow.test.tsx`: a network drop during the FAQ fetch clears the spinner and shows the dialog (HOME_NET_TC_004) **Maps**: FR-040 · **Accept**: the test exists, carries `// Covers: HOME_NET_TC_004` and passes
- [X] T087 Add test `[HOME_NET_TC_006]` in `src/features/nonLoggedInHome/__tests__/useGuardedNavigate.test.tsx`: rapid taps on the same tile navigate once and work again after focus returns (HOME_NET_TC_006) **Maps**: FR-019 · **Accept**: the test exists, carries `// Covers: HOME_NET_TC_006` and passes
- [X] T088 Add test `[HOME_TOKEN_TC_006]` in `src/services/__tests__/authService.test.ts`: no credentials reach the console when the token is requested in a release build (HOME_TOKEN_TC_006) **Maps**: FR-026 · **Accept**: the test exists, carries `// Covers: HOME_TOKEN_TC_006` and passes

## Phase 12: Retrofit Gaps

**Purpose**: QA cases and requirements that are not fully proven yet. None is implemented here.

- [ ] T089 Retrofit gap HOME_RESET_TC_004: Offers failure screen "Ok" must return to Home; not built here, awaiting the Offers module (the Offers route is a stub in this repo) (HOME_RESET_TC_004) **Maps**: FR-062, FR-063, FR-064, FR-065 · **Accept**: the Offers failure screen Ok navigates to Home and a test shows the state reset runs on that return
- [ ] T090 Retrofit gap HOME_RESET_TC_003: Register Now CIF field must not be pre-filled or locked after the reset; not built here, awaiting the Register Now module (HOME_RESET_TC_003) **Maps**: FR-064 · **Accept**: the Register Now screen reads registerNowReturnScreen and a test shows the CIF field is empty and unlocked after a Home focus reset
- [ ] T091 Retrofit gap HOME_BACK_TC_005: FAQ back must return to Home; not built here, awaiting the FAQ screen module (the Faq route is a stub in this repo) (HOME_BACK_TC_005) **Maps**: FR-035, FR-065 · **Accept**: the FAQ screen back button reads faqsFromNonLogin and returns to Home, shown by a test
- [ ] T092 Open item FR-008: tablet and wide-screen layout; not built, awaiting O-13 (HOME_NET_TC_008 out of scope until Design decides) (HOME_NET_TC_008) **Maps**: FR-008 · **Accept**: Design records the tablet and wide-screen rules and a layout test and a device check cover them

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

Counts: 71 QA cases = 55 covered + 8 partial + 2 manual + 0 gap + 5 divergent + 0 qa-suspect + 1 out-of-scope (the parts must add up to the total).

| TC (id + short description) | Task(s) | Test approach |
|---|---|---|
| HOME_LAYOUT_TC_001 - Verify Home screen shows illustration, headline, six tiles and Login button. | T074, T025, T021, T034, T031 | unit-testable - screen test asserts the illustration, the exact three-line headline, the seven buttons ending in Login, no Register Now, chatbot or accessibility label, and the page background token #035795; grid test asserts the 3 + 3 layout |
| HOME_LAYOUT_TC_002 - Verify tile labels and order. | T025, T007, T062, T029, T031 | unit-testable - screen test asserts the button labels equal Pay Now, Our Products, Track Application, FAQs, Offers, Contact Us, Login in that order; constants and accessibility tests assert the same order |
| HOME_LAYOUT_TC_003 - Verify Home screen loads without waiting for background calls. | T075, T025, T038, T033, T034 | unit-testable - new screen test asserts all six tiles and Login are drawn, no loading overlay, and a Login press navigates while the token and version promises are both pending; bootstrap test asserts no dialog and blocking false while the version call is pending |
| HOME_ACTION_TC_001 - Verify Pay Now action opens the payment portal. | T051, T053, T055 | unit-testable - divergent: the case expects a WebView on the payment portal URL titled Pay Now; the recorded owner decision is no WebView, a Pay Now screen with a header and back button only (spec plan-stage decision 2, O-05); the Home hand-off to that screen is tested but the case is not |
| HOME_ACTION_TC_002 - Verify Our Products action routes to Products. | T024, T032 | unit-testable - useHomeActions test asserts navigate is called with Products for the Our Products tile |
| HOME_ACTION_TC_003 - Verify Track Application action routes to its destination. | T024, T032 | unit-testable - useHomeActions test asserts navigate is called with TrackApplication for the Track Application tile (destination flow is a separate BRD, O-03) |
| HOME_ACTION_TC_004 - Verify FAQs action opens FAQ screen. | T044, T025, T046, T047 | unit-testable - useFaqFlow and screen tests assert the fetched list is stored and navigate is called with Faq |
| HOME_ACTION_TC_005 - Verify Offers action routes to non-logged Offers. | T024, T032 | unit-testable - useHomeActions test asserts navigate is called with Offers for the Offers tile |
| HOME_ACTION_TC_006 - Verify Contact Us action opens the Customer Care popup. | T025, T048, T024, T049, T050 | unit-testable - screen test asserts the popup text "We are here to help!" shows over Home with no navigation; hook test asserts the popup opens without a route change |
| HOME_ACTION_TC_007 - Verify Login button routes to Login screen. | T025, T024, T030, T032 | unit-testable - screen and useHomeActions tests assert navigate is called with LoginScreen after cta_clicked |
| HOME_ACTION_TC_008 - Verify FAQ action fetches content when cache is not available. | T044, T015, T025, T046, T047 | unit-testable - screen test asserts the spinner shows and Faq opens on a pending then resolved fetch; hook test asserts one request and the stored list; service tests assert the empty POST to fetch-faq and the list returned |
| HOME_ACTION_TC_009 - Verify FAQ action uses cached content when available. | T044, T046 | unit-testable - useFaqFlow test asserts Faq opens from cache with no fetch call and no spinner |
| HOME_ACTION_TC_010 - Verify user returns to Home after closing the Pay Now WebView. | T051, T053, T055 | unit-testable - divergent: the case closes a Pay Now WebView; no WebView exists by owner decision (O-05). The Pay Now screen back button is tested to navigate to NonLoggedInHome (PayNowScreen.test.tsx), but that is not the case as written |
| HOME_NEG_TC_001 - Verify FAQ API failure with no cache shows error. | T044, T025, T036, T046, T039 | unit-testable - useFaqFlow and screen tests assert the spinner clears, the exact error text shows, Okay closes it and navigate is not called |
| HOME_NEG_TC_002 - Verify Pay Now URL unavailable is handled. | T051, T053 | unit-testable - divergent: the case expects a WebView error or fallback when the Pay Now URL is unavailable; there is no WebView and no URL (O-05, O-09 payment URL no longer used); the Pay Now screen has no network content to fail |
| HOME_STATE_TC_001 - Verify stale session flags are reset on Home entry. | T052, T054, T056 | unit-testable - useFocusReset test asserts the offers form, selected offer and register return flag are reset on focus, and a stale selected offer is cleared on first mount |
| HOME_STATE_TC_002 - Verify Home works when non-logged token generation succeeds. | T076, T025 | unit-testable - new screen test asserts seven buttons, none disabled, and a tile press navigates after the token request succeeds |
| HOME_STATE_TC_003 - Verify token generation failure is handled silently. | T077, T025, T013, T038, T033 | unit-testable - new screen test asserts no Okay button, no FAQ error text and no overlay after a rejected token request and a later FAQ failure shows its own dialog; service tests assert every token failure resolves quietly |
| HOME_VER_TC_001 - Verify no dialog when app version is up to date. | T014, T037, T038, T041 | unit-testable - versionService test asserts an equal version returns kind none; VersionDialog test asserts none renders nothing |
| HOME_VER_TC_002 - Verify maintenance dialog is shown. | T037, T014, T040, T041 | unit-testable - VersionDialog test asserts the server message, Exit as the only button on Android and no dismissal on back; versionService test asserts kind maintenance with the message |
| HOME_VER_TC_003 - Verify mandatory update dialog. | T037, T014, T025, T040, T042 | unit-testable - VersionDialog test asserts the exact update text with Update and Exit and no dismissal; versionService test asserts kind mandatory; screen test asserts the dialog shows on a drawn Home |
| HOME_VER_TC_004 - Verify Update button opens the store link. | T037, T038, T040, T041 | unit-testable - VersionDialog test asserts onUpdate gets the target url; useHomeBootstrap test asserts Linking.openURL is called with the store url |
| HOME_VER_TC_005 - Verify optional update dialog can be dismissed. | T037, T038, T014, T040, T041 | unit-testable - VersionDialog test asserts Update and Skip show and Skip closes; hook test asserts Skip returns the outcome to none; versionService test asserts kind optional |
| HOME_VER_TC_006 - Verify update is not enforced when status is not Active. | T014, T041 | unit-testable - versionService and contract tests assert a status other than Active returns kind none |
| HOME_VER_TC_007 - Verify version 1.8.10 is treated newer than 1.8.9. | T014, T041 | unit-testable - versionService test asserts compareVersions(1.8.9, 1.8.10) is -1 and the 1.8.10 body gives kind mandatory |
| HOME_VER_TC_008 - Verify 401 from version service shows message and logs out. | T038, T041 | unit-testable - divergent: the case expects the server message with Okay and a logout call on Okay; the recorded decision is a 401 shows no popup and the logged-in token is cleared silently (spec plan-stage decision 3, overrides BRD 4.7.4) |
| HOME_VER_TC_009 - Verify version call failure or empty body fails open. | T014, T038, T041 | unit-testable - versionService and contract tests assert null, empty, malformed bodies and a failed request give none; hook test asserts a rejected call leaves no dialog |
| HOME_VER_TC_010 - Verify version request sends capitalised platform value. | T014, T041 | unit-testable - versionService and contract tests assert the body is { version: 1.8.9, user_agent: Android } and user_agent is exactly iOS on iOS |
| HOME_VER_TC_011 - Verify iOS has no Exit button on blocking dialogs. | T037, T040 | unit-testable - VersionDialog test asserts only Update shows on iOS and back does not dismiss |
| HOME_VER_TC_012 - Verify blocking dialog cannot be dismissed by Android back. | T037, T058, T040, T060 | unit-testable - VersionDialog tests assert the Android back request calls neither the skip, okay nor exit handler; useExitConfirm test asserts back is swallowed while blocked |
| HOME_BACK_TC_001 - Verify exit confirmation shows on Android back. | T057, T058, T025, T059, T060 | unit-testable - ExitConfirmDialog and screen tests assert the exact text with CANCEL and Okay shows on back |
| HOME_BACK_TC_002 - Verify Okay on exit dialog closes the app. | T058, T025, T060 | unit-testable - screen and hook tests assert BackHandler.exitApp is called once on Okay |
| HOME_BACK_TC_003 - Verify CANCEL on exit dialog keeps user on Home. | T058, T025, T060 | unit-testable - hook test asserts the dialog hides on CANCEL and exitApp is not called; screen test asserts the dialog text is gone |
| HOME_BACK_TC_004 - Verify back closes Contact Us popup before exit dialog. | T058, T025, T060, T061 | unit-testable - screen test asserts the first back closes the popup with no exit dialog and the second back shows the exit dialog |
| HOME_BACK_TC_005 - Verify FAQ back returns to Home. | T044, T091 | unit-testable - partial: useFaqFlow asserts the faqsFromNonLogin flag is set when the FAQ opens; blocked: FAQ screen back handling (the Faq route is a stub in this repo) |
| HOME_RESET_TC_001 - Verify offers form data is cleared on return to Home. | T052, T017, T054 | unit-testable - useFocusReset and slice tests assert the offers form equals empty strings and false after reset |
| HOME_RESET_TC_002 - Verify selected pre-approved offer is cleared on return to Home. | T052, T025, T017, T054 | unit-testable - useFocusReset, screen and slice tests assert selectedOffer is null after focus |
| HOME_RESET_TC_003 - Verify register return flag is cleared on return to Home. | T052, T090 | unit-testable - partial: useFocusReset and screen tests assert registerNowReturnScreen is null after focus; blocked: Register Now screen CIF field (module not in this repo) |
| HOME_RESET_TC_004 - Verify Offers fail screen Ok returns to Home with reset state. | T052, T089 | unit-testable - partial: useFocusReset asserts the reset runs on every later focus (loop of three returns); blocked: Offers failure screen Ok navigation (Offers route is a stub in this repo) |
| HOME_RESET_TC_005 - Verify focus reset does not clear FAQ cache or token. | T078, T052, T017, T054, T046 | unit-testable - new screen test asserts after a focus event the FAQ opens from cache, fetchFaq is not called and the token is still APP; hook and slice tests assert the cache and token survive |
| HOME_CONTACT_TC_001 - Verify popup heading and three rows. | T048, T007, T049 | unit-testable - popup and constants tests assert the heading and the three rows with their exact details |
| HOME_CONTACT_TC_002 - Verify popup closes with its close control. | T048, T025, T049, T050 | unit-testable - popup test asserts close control, backdrop and Android back each call onClose; screen test asserts the popup text is gone after the close control |
| HOME_CONTACT_TC_003 - Verify focus returns to Contact Us tile after closing popup. | T048, T065, T049 | unit-testable - partial: useCustomerCare asserts setAccessibilityFocus is called with the tile handle on close; manual remainder: a person confirms with TalkBack or VoiceOver that focus lands on the Contact Us tile |
| HOME_CONTACT_TC_004 - Verify popup scrolls at large text sizes. | T048, T065, T049 | unit-testable - partial: popup test asserts the height cap (window - insets - 64 = 678) and a scroll container; manual remainder: a person checks on a device at large text that nothing is clipped |
| HOME_CONTACT_TC_005 - Verify Call, Email and Find Us tap behaviour. | T048, T049 | unit-testable - useCustomerCare tests assert tel:02245297300, mailto:bhflwecare@bajajhousing.co.in and navigate BranchLocator, each closing the popup |
| HOME_CONTACT_TC_006 - Verify popup opens only once on rapid taps. | T079, T048, T049 | unit-testable - new screen test asserts exactly one contact-popup after two rapid taps; hook test asserts a second open does not stack |
| HOME_TOKEN_TC_001 - Verify Bearer token is sent on FAQ request. | T012, T015, T011 | unit-testable - httpClient and FAQ contract tests assert Authorization Bearer, app-version, platform and device-details |
| HOME_TOKEN_TC_002 - Verify token request times out after 10 seconds. | T013, T025, T033 | unit-testable - authService test asserts timeout 10000 and a swallowed timeout error; screen test asserts Home stays usable after a rejected token request |
| HOME_TOKEN_TC_003 - Verify early FAQ tap waits for in-flight token. | T013, T012, T011 | unit-testable - httpClient test asserts no request is sent until the token provider resolves and then Bearer late-token is sent; authService test asserts an early token read waits for the in-flight request |
| HOME_TOKEN_TC_004 - Verify relaunch after 15 minutes uses a fresh non-logged token. | T013 | unit-testable - authService test asserts the logged-in token is never returned and a fresh token is requested; contract test asserts the logged-in slot is untouched |
| HOME_TOKEN_TC_005 - Verify FAQ shows error after token failure. | T080, T044, T025 | unit-testable - new screen test asserts that after a rejected token request a failing FAQ call shows the exact error text and fetchFaq is called once |
| HOME_TOKEN_TC_006 - Verify token request body fields are encrypted. | T088, T013 | unit-testable - authService test asserts username and password are sent as enc(...) only and a release-build run writes no credentials to the console; encryption tests assert the base64url IV:ciphertext format |
| HOME_TOKEN_TC_007 - Verify token is stored after success. | T013 | unit-testable - authService test asserts the token is in the store and under the key auth_token_Nonlogged |
| HOME_FAQ_TC_001 - Verify empty FAQ list keeps user on Home with no dialog. | T044, T015, T046 | unit-testable - useFaqFlow test asserts no navigation, no dialog, spinner cleared and no stored list for an empty list; service test asserts an empty array stays empty |
| HOME_FAQ_TC_002 - Verify non-array FAQ response does not crash. | T015, T044, T046 | unit-testable - faqService and contract tests assert every non-array body resolves to an empty list; the empty-list flow test asserts Home stays with no dialog |
| HOME_FAQ_TC_003 - Verify double tap on FAQs sends one request. | T044, T046 | unit-testable - useFaqFlow test presses three times and asserts fetch is called once |
| HOME_FAQ_TC_004 - Verify spinner blocks other touches while FAQ loads. | T043, T071, T045 | unit-testable - partial: LoadingOverlay tests assert a modal, labelled, announced overlay and a swallowed Android back; manual remainder: a person confirms on a device that touches on tiles are blocked until the spinner closes |
| HOME_FAQ_TC_005 - Verify retry after FAQ failure succeeds. | T044, T046 | unit-testable - useFaqFlow test asserts a failure then a retry opens Faq and fetch is called twice |
| HOME_FAQ_TC_006 - Verify Okay on FAQ error dialog keeps user on Home. | T081, T044, T036, T046 | unit-testable - new screen test asserts after Okay the error text is gone, navigate is not called and Login is still shown; hook test asserts the dialog closes |
| HOME_FAQ_TC_007 - Verify spinner always clears on FAQ failure or timeout. | T084, T044, T046 | unit-testable - new useFaqFlow test asserts a timeout error clears the spinner and shows the dialog; the failure test asserts the same for a 500 |
| HOME_NET_TC_001 - Verify Home renders with no network. | T082, T025 | unit-testable - new screen test asserts all six tiles, Login and the headline render and no Okay or Update button shows when the token and version calls both fail |
| HOME_NET_TC_002 - Verify FAQs with no network shows error. | T085, T044, T046 | unit-testable - new useFaqFlow test asserts a Network Error clears the spinner, shows the dialog and stores nothing |
| HOME_NET_TC_003 - Verify Pay Now with no network shows WebView error. | T051, T053 | unit-testable - divergent: the case expects a WebView error state with no network; there is no WebView, the Pay Now screen opens with no network content (spec N-10) |
| HOME_NET_TC_004 - Verify network lost mid FAQ fetch. | T086, T044, T046 | unit-testable - new useFaqFlow test asserts loading is true while pending, then a rejection clears it and shows the dialog |
| HOME_NET_TC_005 - Verify rapid taps on different tiles open one destination. | T023, T024, T025, T027, T032 | unit-testable - guarded navigation, useHomeActions and screen tests assert three rapid taps on different destinations call navigate once |
| HOME_NET_TC_006 - Verify rapid taps on the same tile do not duplicate screens. | T087, T023, T027 | unit-testable - new guarded navigation test asserts three taps on Offers navigate once and a tap after focus navigates again |
| HOME_NET_TC_007 - Verify layout on small screen 320 x 568. | T083, T025, T065, T034 | unit-testable - partial: new screen test asserts at 320 x 568 Login and all seven buttons sit inside the scroll view; manual remainder: a person checks on a small device that nothing is clipped |
| HOME_NET_TC_008 - Verify layout on tablet or wide screen. | T092 | out-of-scope - tablet and wide-screen layout rules are an open BRD item (O-13); nothing to test yet |
| HOME_NET_TC_009 - Verify cold start time to interactive. | T071 | manual - cold-start time to interactive on a mid-range device cannot be proven by a unit test (PERF-1, 2 s target) |
| HOME_NET_TC_010 - Verify no memory growth when opening and closing tiles repeatedly. | T069, T071 | unit-testable - partial: lifecycle tests assert 50 mount and unmount cycles and 50 popup open and close cycles leave the live listener count unchanged; manual remainder: a person checks device memory and crashes over repeated tile open and close |
| HOME_NET_TC_011 - Verify Android and iOS parity. | T071 | manual - Android and iOS parity of layout and flows needs both real devices; platform branches (Exit button, hardware back) are unit tested separately |
