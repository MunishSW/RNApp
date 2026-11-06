---

description: "Task list for the Non-Logged-In (Pre-Login) Home Page"
---

# Tasks: Non-Logged-In (Pre-Login) Home Page

**Input**: `specs/002-non-logged-in-home-page-tdd-trial5/` (spec.md, plan.md, qa-cases.json, manual-verification.json; also research.md, data-model.md, contracts/, quickstart.md)

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

- [ ] T-ENV-001: Run `npm test` - existing suite green. **Maps**: FR-001, FR-010, FR-020, FR-025, FR-035, FR-043, FR-048, FR-058, FR-062, FR-066 · **Accept**: `npm test` finishes with every suite passing before and after the retrofit changes.

---

## Phase 1: Setup and tokens

**Purpose**: tokens, assets, label file, types, routes. No behaviour yet.

- [X] T001 Add `fontFamilySemiBold: 'Rubik-SemiBold'` and `fontFamilyBold: 'Rubik-Bold'` to `typography` in `src/theme/tokens.ts` and extend `src/theme/__tests__/tokens.test.ts` to assert all four Rubik family tokens and the Figma values `#035795`, `#FF512F`, `#F09819`, angle 133.8255, tile width 96, icon height 40 (FR-004, FR-020; plan "Design tokens"; BRD 13.1) **Maps**: FR-004, FR-020 · **Accept**: tokens.test.ts asserts all four Rubik family tokens and the Figma colour, angle, tile and icon values and passes.
- [X] T002 Confirm `Rubik-Regular.ttf`, `Rubik-Medium.ttf`, `Rubik-SemiBold.ttf`, `Rubik-Bold.ttf` are in `src/assets/fonts/` (already copied) and linked for both platforms: `react-native.config.js` already lists `./src/assets/fonts`; run `npx react-native-asset`, then check `ios/*/Info.plist` (`UIAppFonts`) and `android/app/src/main/assets/fonts/` contain all four. Record the result in the task commit (FR-004; G-3) **Maps**: FR-004 · **Accept**: all four Rubik font files exist in src/assets/fonts and are linked for both platforms, result recorded.
- [X] T003 [P] Create `src/assets/nonLoggedInHome/` with copies of the six tile icons (`pay-now.png`, `our-products.png`, `track-application.png`, `faqs.png`, `offers.png`, `contact-us.png`) and `illustration.png` from `src/assets/nonLoggedHome/`, plus `src/assets/nonLoggedInHome/index.ts` exporting them by tile id (FR-002, FR-010; Figma 2:947-2:964) **Maps**: FR-002, FR-010 · **Accept**: src/assets/nonLoggedInHome holds the six tile icons and the illustration with an index exporting them by tile id.
- [X] T004 [P] Create `src/features/nonLoggedInHome/nonLoggedInHomeConstants.ts` holding every on-screen string exactly as the spec quotes it: headline "Login to download account statements, make payments, and manage your account, on the go!" (three-line break), tile labels "Pay Now", "Our Products", "Track Application", "FAQs", "Offers", "Contact Us", "Login", popup text "We are here to help!" / "Call Us" / "022-45297300" / "Email Us" / "bhflwecare@bajajhousing.co.in" / "Find Us" / "Branch locator", FAQ error "Your request could not be processed at this moment. Request you to try again after sometime." / "Okay", exit text "Are you sure you want to exit!" / "CANCEL" / "Okay", update text "Update your app to experience all the latest features." / "Update" / "Exit" / "Skip", header "Pay Now"; the ordered tile table (id, label, linkName, route); analytics event and property names (FR-003, FR-010, FR-018, FR-040, FR-043, BRD area 4.7, BRD area 4.8; BRD 7.7) **Maps**: FR-003, FR-010, FR-018, FR-040, FR-043, FR-048, FR-049, FR-050, FR-051, FR-052, FR-053, FR-054, FR-055, FR-056, FR-057, FR-058, FR-059, FR-060, FR-061 · **Accept**: nonLoggedInHomeConstants.ts holds every on-screen string exactly as the spec quotes it, plus the ordered tile table and analytics names.
- [X] T005 [P] Create `src/features/nonLoggedInHome/types.ts` with `TileId`, `TileConfig`, `HomeDialogState` and a re-export of the shared `VersionOutcome` type (data-model.md "QuickLinkTile", "HomeUiState"; FR-010) **Maps**: FR-010 · **Accept**: types.ts exports TileId, TileConfig, HomeDialogState and the shared VersionOutcome type and compiles.
- [X] T006 [P] Add routes `NonLoggedInHome` and `NonLoggedInPayNow` (params `{ title: string }`) to `ROUTES` and `RootStackParamList` in `src/navigation/routes.ts`, leaving every existing route unchanged (contracts/ui-and-navigation.md; FR-014) **Maps**: FR-014 · **Accept**: routes NonLoggedInHome and NonLoggedInPayNow exist in ROUTES and RootStackParamList and no existing route changed.
- [X] T007 [P] Write `src/features/nonLoggedInHome/__tests__/constants.test.ts` asserting each string above is exactly equal to the spec text, tile order is "Pay Now", "Our Products", "Track Application", "FAQs", "Offers", "Contact Us", and there are no strings for Register Now, chatbot or accessibility icon (FR-010, FR-024; BR-4; P-01; TC-102, TC-103, TC-107, TC-108, TC-109) **Maps**: FR-010, FR-024 · **Accept**: constants.test.ts passes and shows every string, the tile order and the absence of Register Now, chatbot and accessibility strings.

**Checkpoint**: tokens, assets, labels and routes exist.

---

## Phase 2: Foundational (blocking): shared API client, token and version services, FAQ store

**Purpose**: the network and state layers every story uses. No story starts before this is green.

**Shared API client** (contracts/shared-http-client.md, error-behaviour.md)

- [X] T008 [P] Create `src/services/apiErrors.ts` exporting `classifyApiError(error)` returning `{ status, errorCategory: 'Network' | 'Auth' | 'Server' | 'Validation', retryable }` with `retryable` true for network, timeout, 429 and 5xx; and `src/services/__tests__/apiErrors.test.ts` covering each category and the retryable rule (BRD 8.4.4; FR-032; N-01, N-02) **Maps**: FR-032 · **Accept**: classifyApiError returns the right category and retryable flag for network, auth, server and validation errors and its test passes.
- [X] T009 [P] Create `src/services/authRetry.ts` exporting `isAuthFailure(responseOrError)` (HTTP 401; HTTP 400 with body `statusCode` or `returnStatus.returnCode` "401" or "API_3000"; HTTP 200 with `returnStatus.returnCode` "401") and `retryOnceAfterTokenRefresh(config, deps)` that requests a fresh non-logged token, sets the new Bearer header and replays once, marks the replay, skips `skipAuth` calls and any call when a logged-in token exists, and returns or throws the original result when the replay fails (BRD 8.4.3; FR-032; BR-2, BR-3) **Maps**: FR-032 · **Accept**: isAuthFailure detects all three auth signals and retryOnceAfterTokenRefresh replays exactly once with the new Bearer.
- [X] T010 [P] Write `src/services/__tests__/authRetry.test.ts` covering: each of the three auth-failure signals triggers exactly one token refresh and one replay; a second auth failure on the replay gives no third call and passes the original error on; a logged-in token present means no retry; `skipAuth` never retries; 500 and network failures are not replayed (FR-032; BR-3; N-01, N-02, E-13) **Maps**: FR-032 · **Accept**: authRetry.test.ts covers retry-once, no third call, logged-in session, skipAuth and non-auth failures and passes.
- [X] T011 Hook `authRetry` into `src/services/httpClient.ts` as a response step (also checking successful HTTP 200 bodies) with no change to existing request behaviour; run `src/services/__tests__/httpClient.test.ts` and confirm every existing case still passes unchanged (FR-028, FR-032; BR-3; G-1; constitution V). Depends on T009. **Maps**: FR-028, FR-032 · **Accept**: httpClient calls the auth retry step and the existing httpClient.test.ts still passes unchanged.
- [X] T012 Extend `src/services/__tests__/authRetry.test.ts` (or add `src/services/__tests__/httpClientRetry.test.ts`) with an end-to-end case through `post()`: FAQ call gets 401, token refresh runs once, replay carries the new Bearer, headers `app-version`, `platform`, `device-details` present and `X-BHFL-Auth` absent (FR-028, FR-034, FR-032; P-08, P-09; TC-404). Depends on T011. **Maps**: FR-028, FR-032, FR-034 · **Accept**: an end-to-end post() case shows one refresh, one replay with the new Bearer, standard headers present and X-BHFL-Auth absent.

**Token and version services** (contracts/generatetoken.md, force-update.md)

- [X] T013 [P] Write `src/services/__tests__/generatetokenContract.test.ts` (check `src/services/__tests__/authService.test.ts` first and add only cases not already covered): body `username` and `password` are in the form `base64url(IV):base64url(ciphertext+tag)` with no `=`, IV differs between calls; call is `skipAuth` with headers `Content-Type: application/json` and `X-BHFL-Auth` absent, `X-BHFL-Entity: mobileapp`; timeout is 10 s; empty or non-string `token` is rejected (TV-1); every failure is swallowed with no throw; the in-flight promise makes a concurrent call wait; a logged-in token is never returned as the non-logged token (FR-025 to FR-030; BR-2, BR-3, TV-1, PERF-2; P-09, N-01, E-13; TC-401, TC-402, TC-403, TC-404, TC-405) **Maps**: FR-025, FR-026, FR-027, FR-028, FR-029, FR-030, FR-033 · **Accept**: generatetokenContract.test.ts and authService.test.ts pass and cover encrypted body, headers, 10 s timeout, TV-1, silent failure and in-flight wait.
- [X] T014 [P] Write `src/services/__tests__/versionContract.test.ts` (check `versionService.test.ts` first and add only missing cases): dotted numeric compare 1.8.10 vs 1.8.9 and missing parts as 0 (TV-3); enforce only when `status` is "Active" (TV-4); `user_agent` exactly "Android" or "iOS" on each platform (TV-5); each classification step of `contracts/force-update.md` has one case; null, empty, malformed body and thrown request give `none`; `X-BHFL-Auth` absent; the call is `forceUpdate/Secured` (FR-048, FR-050, FR-051, FR-056; BR-9, TV-3, TV-4, TV-5; P-10, N-06 to N-09, E-08, E-09; TC-406 to TC-413) **Maps**: FR-033, FR-048, FR-050, FR-051, FR-056 · **Accept**: versionContract.test.ts and versionService.test.ts pass and cover compare, Active-only, platform name, classification order and fail-open.
- [X] T015 [P] Write `src/services/__tests__/faqContract.test.ts` (check `faqService.test.ts` first): empty `{}` body; base is the bare API host; headers Bearer, `app-version`, `platform`, `device-details` present and `X-BHFL-Auth` absent; array returns items, empty array returns `[]`, object body returns `[]`, 500 rejects (FR-034, FR-037, FR-039, FR-040; BR-6, TV-2; N-02 to N-04; TC-302, TC-303, TC-304, TC-305) **Maps**: FR-033, FR-034, FR-037, FR-039, FR-040 · **Accept**: faqContract.test.ts passes and covers empty body, headers, list handling and the 500 rejection.
- [X] T016 Fix any failures T013 to T015 reveal in `src/services/authService.ts`, `src/services/versionService.ts` or `src/services/faqService.ts` with the smallest change; do not touch `src/features/nonLoggedHome/` and do not change behaviour that existing tests assert (BRD area 4.4, BRD area 4.5, BRD area 4.7; zero-regression gate VII). Depends on T013, T014, T015. Skip if all pass. **Maps**: FR-025, FR-026, FR-027, FR-028, FR-029, FR-030, FR-033, FR-034, FR-037, FR-039, FR-040, FR-048, FR-050, FR-051, FR-056 · **Accept**: every failure found by T013 to T015 is fixed with the smallest change, or the task is skipped because all passed.

**FAQ and Home state** (data-model.md)

- [X] T017 [P] Write `src/store/__tests__/nonLoggedInHomeState.test.ts` covering: `faq.items` starts null, set only by `setFaqItems`, cleared only by `clearFaq` and survives the three focus-reset actions (FR-065); `token.nonLoggedToken` and `loggedInToken` are separate slots; `offers` reset values are `fullName: ""`, `mobileNo: ""`, `tncAccepted: false`, `selectedOffer: null`; `sessionFlags` `registerNowReturnScreen` set to null, `faqsFromNonLogin` and `isNonLoggedUser` default false (FR-017, FR-035, FR-062 to FR-065; BR-11; P-13; TC-504, TC-505, TC-506) **Maps**: FR-017, FR-035, FR-062, FR-063, FR-064, FR-065 · **Accept**: nonLoggedInHomeState.test.ts passes and shows the FAQ cache, token slots, offers reset values and session flags behave as specified.
- [X] T018 Fix any failure T017 reveals in `src/store/tokenSlice.ts`, `src/store/faqSlice.ts`, `src/store/offersSlice.ts` or `src/store/sessionFlagsSlice.ts` with the smallest additive change. Skip if all pass. Depends on T017. **Maps**: FR-017, FR-035, FR-062, FR-063, FR-064, FR-065 · **Accept**: every failure found by T017 is fixed additively, or the task is skipped because all passed.

**Checkpoint**: `npm test -- src/services src/store` green, including all pre-existing tests. User story work can start.

---

## Phase 3: User Story 1 - Land on Home and reach Login (Priority: P1) 🎯 MVP

**Goal**: BRD 4.1, 4.2, 4.3: blue page, illustration, headline, six tiles, "Login", background token request on mount.

**Independent Test**: open Home with no session; the screen matches Figma node 2:937 at default settings; tapping "Login" opens the Login route; every tile tap records `quick_link_clicked`; the screen draws before the token call finishes (P-01, P-02, P-04, P-05, P-09, E-14).

### Tests for User Story 1 (write first, confirm they fail)

- [X] T019 [P] [US1] `src/features/nonLoggedInHome/__tests__/QuickLinkTile.test.tsx`: label text, role `button`, accessibility label equals visible label, icon hidden from the accessibility tree, press calls handler, minimum 44 x 44, tile width 96 and icon height 40 from tokens, "Track Application" label wraps to two lines (FR-011, FR-013; BR-4, BR-12; E-04, E-07; TC-105, TC-606) **Maps**: FR-011, FR-013 · **Accept**: QuickLinkTile.test.tsx passes and covers label, role, hidden icon, press, 44 x 44, sizes and the two-line wrap.
- [X] T020 [P] [US1] `src/features/nonLoggedInHome/__tests__/LoginButton.test.tsx`: label "Login", role `button`, never disabled, gradient stops `#FF512F` and `#F09819` come from tokens, 307 x 40, radius 82, press handler, 44 minimum touch height met (FR-020, FR-022, FR-023; BR-8; P-02; TC-104, TC-606) **Maps**: FR-020, FR-022, FR-023 · **Accept**: LoginButton.test.tsx passes and covers label, role, never disabled, gradient tokens, size, radius and touch height.
- [X] T021 [P] [US1] `src/features/nonLoggedInHome/__tests__/QuickLinkGrid.test.tsx`: six tiles in fixed order in a 3 + 3 layout at default; one full-width column when `stacked`; width 331 and row gap 18 (FR-010, FR-012; BR-4; P-01, E-01; TC-103, TC-603) **Maps**: FR-010, FR-012 · **Accept**: QuickLinkGrid.test.tsx passes and covers six tiles in order, 3 + 3, stacked column, width 331 and gap 18.
- [X] T022 [P] [US1] `src/features/nonLoggedInHome/__tests__/useTextScaleLayout.test.ts`: `stacked` is false below font scale 1.5 and true at 1.5 and above (FR-012; BR-4; E-01; TC-603) **Maps**: FR-012 · **Accept**: useTextScaleLayout.test.ts passes and shows stacked is false below 1.5 and true at 1.5 and above.
- [X] T023 [P] [US1] `src/features/nonLoggedInHome/__tests__/useGuardedNavigate.test.tsx`: two quick taps navigate once; lock released on focus (FR-019; E-14) **Maps**: FR-019 · **Accept**: useGuardedNavigate.test.tsx passes and shows two quick taps navigate once and the lock is released on focus.
- [X] T024 [P] [US1] `src/features/nonLoggedInHome/__tests__/useHomeActions.test.tsx`: each tile tap records `quick_link_clicked` with `link_name`, `location: non_logged_home`, `logged_in: false` before navigating; Login records `cta_clicked` (`cta_name: login`, `screen: non_logged_home`) then navigates to `LoginScreen`; Our Products to `Products`; Offers to `Offers`; Track Application to `TrackApplication`; Contact Us records `contact_us_clicked` and sets `isNonLoggedUser`; a failed navigation is still counted (FR-015 to FR-019, FR-021; BR-4, BR-8; P-02, P-04, P-05, P-14, E-14; TC-201, TC-203, TC-204, TC-206, TC-207) **Maps**: FR-015, FR-016, FR-017, FR-018, FR-019, FR-021 · **Accept**: useHomeActions.test.tsx passes and covers analytics-then-navigate for every tile and Login, Contact Us flag and failed navigation.
- [X] T025 [US1] `src/features/nonLoggedInHome/__tests__/NonLoggedInHomeScreen.test.tsx`: renders illustration, headline, six tiles, "Login", with `#035795` page and light status bar; no Register Now, chatbot or accessibility icon; Home draws while the token promise is pending; the token request is made once on mount; Login press opens Login (FR-001 to FR-007, FR-024, FR-025; BR-1, BR-2, BR-8; P-01, P-02, P-09, N-01; TC-101, TC-102, TC-106, TC-107, TC-108, TC-109, TC-702). Depends on T019 to T024 for shared helpers. **Maps**: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-024, FR-025 · **Accept**: NonLoggedInHomeScreen.test.tsx passes and covers the illustration, headline, tiles, Login, page colour, token on mount and no extra entry points.

### Implementation for User Story 1

- [X] T026 [P] [US1] Create `src/features/nonLoggedInHome/components/gradient.ts` (own copy of the CSS-angle-to-line helper) (FR-020; plan research 7) **Maps**: FR-020 · **Accept**: gradient.ts converts the CSS angle to a gradient line and the Login button uses it.
- [X] T027 [P] [US1] Create `src/features/nonLoggedInHome/hooks/useGuardedNavigate.ts` (own copy: one destination per tap burst, 800 ms lock, released on focus) (FR-019; BR-4; E-14) **Maps**: FR-019 · **Accept**: useGuardedNavigate allows one destination per tap burst with an 800 ms lock released on focus.
- [X] T028 [P] [US1] Create `src/features/nonLoggedInHome/hooks/useTextScaleLayout.ts` returning `{ stacked }` at font scale >= 1.5 (FR-012; BR-4; E-01) **Maps**: FR-012 · **Accept**: useTextScaleLayout returns stacked at font scale 1.5 or more.
- [X] T029 [P] [US1] Create `src/features/nonLoggedInHome/components/QuickLinkTile.tsx`: 96 wide, padding 12 horizontal and 16 vertical, gap 8, radius 4, transparent background, 40-high icon, Rubik Regular 11.889 white centred label, role `button`, label from constants, icon hidden from accessibility, minimum 44 x 44, no fixed text height, pressed feedback with no layout shift; all values from `src/theme/tokens.ts` via `useTheme()` (FR-010, FR-011, FR-013; BR-4, BR-12) **Maps**: FR-010, FR-011, FR-013 · **Accept**: QuickLinkTile renders the Figma tile with role button, hidden icon and 44 x 44 target using tokens only.
- [X] T030 [P] [US1] Create `src/features/nonLoggedInHome/components/LoginButton.tsx`: 307 x 40 pill, radius 82, padding 10 and 11.5, SVG gradient 133.8255 degrees from `#FF512F` at 5.5578% to `#F09819` at 94.442%, label "Login" Rubik Medium 14 white single line, role `button`, never disabled, exempt from dark remap (FR-020, FR-022, FR-023; BR-8) **Maps**: FR-020, FR-022, FR-023 · **Accept**: LoginButton renders the 307 x 40 gradient pill, never disabled, with the Login label and role button.
- [X] T031 [US1] Create `src/features/nonLoggedInHome/components/QuickLinkGrid.tsx`: 331 wide, two rows with 18 gap, three tiles per row spread with space between; one full-width column with the icon aligned to the first text line when `stacked` (FR-010, FR-012; BR-4). Depends on T028, T029. **Maps**: FR-010, FR-012 · **Accept**: QuickLinkGrid shows two rows of three at default and one full-width column when stacked.
- [X] T032 [US1] Create `src/features/nonLoggedInHome/hooks/useHomeActions.ts`: tile and Login handlers that fire the typed analytics events first (`src/services/analytics.ts`), then navigate through the feature's `useGuardedNavigate`; Contact Us and FAQs handlers expose hooks for later stories (FR-015 to FR-019, FR-021; BR-4, BR-8). Depends on T027. **Maps**: FR-015, FR-016, FR-017, FR-018, FR-019, FR-021 · **Accept**: useHomeActions fires the analytics event first, then navigates through the guarded hook for every tile and Login.
- [X] T033 [US1] Create `src/features/nonLoggedInHome/hooks/useHomeBootstrap.ts`: on mount call `requestNonLoggedToken()` once without awaiting it for render; version check wiring is added in US2 (FR-025, FR-007; BR-2; P-09, N-01) **Maps**: FR-007, FR-025 · **Accept**: useHomeBootstrap requests the token once on mount without awaiting it for render.
- [X] T034 [US1] Create `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx`: scroll view with `#035795` background and light status bar; illustration block 311 x 310 (padding top 22, bottom 14, gap 28, art 172 x 140, hidden from accessibility); headline Rubik Regular 16 / line height 22 white centred with the three-line break; 18 gap; grid; "Login" with its top gap from Figma; scroll indicators hidden; no logic beyond composing hooks and components (FR-001 to FR-007, FR-020; BR-1, BR-12; P-01). Depends on T029 to T033. **Maps**: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-020 · **Accept**: NonLoggedInHomeScreen composes the page to the Figma layout and is scrollable with the indicator hidden.
- [X] T035 [US1] Register `NonLoggedInHome` in `src/navigation/RootNavigator.tsx` (additive; initial route unchanged) so the new screen is reachable for review (FR-001; plan structure). Depends on T034, T006. **Maps**: FR-001 · **Accept**: NonLoggedInHome is registered in RootNavigator additively and the initial route is unchanged.

**Checkpoint**: US1 works alone; run `npm test -- src/features/nonLoggedInHome`.

---

## Phase 4: User Story 2 - Force-update and maintenance gate (Priority: P1)

**Goal**: BRD 4.7: once-per-mount version check, blocking dialogs, fail open, no popup on 401.

**Independent Test**: make the version service answer maintenance, mandatory, optional, 401, error and failure; each shows the dialog or nothing as specified (N-06 to N-09, E-08, E-12).

### Tests for User Story 2

- [X] T036 [P] [US2] `src/features/nonLoggedInHome/__tests__/CommonMessageDialog.test.tsx`: message text, one button with the given label, no close icon, role and announcement, button press handler (FR-040, FR-055; BR-12; TC-303) **Maps**: FR-040, FR-055 · **Accept**: CommonMessageDialog.test.tsx passes and covers the message, one button, no close icon and announcement.
- [X] T037 [P] [US2] `src/features/nonLoggedInHome/__tests__/VersionDialog.test.tsx`: maintenance shows server message and "Exit" only on Android and cannot be dismissed; mandatory shows "Update your app to experience all the latest features." with "Update" and "Exit" (Android only), not dismissable, "Update" opens `targetUrl`; on iOS no "Exit"; optional shows "Update" and "Skip" and "Skip" closes it (FR-052, FR-053, FR-054; BR-9; N-06, N-07, E-12; TC-407, TC-408, TC-409, TC-802, TC-803, TC-804) **Maps**: FR-052, FR-053, FR-054 · **Accept**: VersionDialog.test.tsx passes and covers maintenance, mandatory, optional and iOS variants and that blocking dialogs cannot be dismissed.
- [X] T038 [P] [US2] `src/features/nonLoggedInHome/__tests__/useHomeBootstrap.test.tsx`: version check runs once per fresh mount and not on focus; Home is not blocked while it is pending; outcomes map to maintenance, mandatory, optional and generic error dialogs; `sessionExpired` shows nothing and clears the logged-in token silently; `none` and a thrown request show nothing; platform name sent is "Android" or "iOS" (FR-048, FR-049, FR-055, FR-056; BR-9; P-10, N-06 to N-09; TC-406 to TC-413) **Maps**: FR-048, FR-049, FR-055, FR-056 · **Accept**: useHomeBootstrap.test.tsx passes and covers once-per-mount check, outcome mapping, silent 401, fail-open and Update, Exit and Skip.

### Implementation for User Story 2

- [X] T039 [P] [US2] Create `src/features/nonLoggedInHome/components/CommonMessageDialog.tsx`: message plus one button, no close icon, announced to screen readers, tokens only (FR-040, FR-055; BR-12) **Maps**: FR-040, FR-055 · **Accept**: CommonMessageDialog shows a message and one button with no close icon, announced to screen readers.
- [X] T040 [P] [US2] Create `src/features/nonLoggedInHome/components/VersionDialog.tsx` for maintenance, mandatory and optional outcomes with the labels from constants; "Update" opens the store URL through the system; "Exit" (Android only) closes the app; blocking outcomes cannot be dismissed (FR-052, FR-053, FR-054; BR-9; E-12) **Maps**: FR-052, FR-053, FR-054 · **Accept**: VersionDialog shows the maintenance, mandatory and optional dialogs with the right buttons per platform.
- [X] T041 [US2] Extend `src/features/nonLoggedInHome/hooks/useHomeBootstrap.ts`: after mount start `checkAppVersion()` once (ref guard, never on focus), expose `versionOutcome`; map `sessionExpired` to no dialog and call `logout()` from `src/services/sessionService.ts`; `error` to a `CommonMessageDialog` with "Okay" and the server message or generic text; all failures fail open (FR-048, FR-049, FR-055, FR-056; BR-9). Depends on T033. **Maps**: FR-048, FR-049, FR-055, FR-056 · **Accept**: useHomeBootstrap starts one version check per mount and maps every outcome, failing open.
- [X] T042 [US2] Wire `VersionDialog` and the error `CommonMessageDialog` into `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx` on top of Home after the answer arrives, never blocking navigation or drawing (FR-049; BR-9; P-10, N-06 to N-09). Depends on T039, T040, T041. **Maps**: FR-049 · **Accept**: the version dialog and the error dialog appear on top of a drawn Home after the answer arrives.

**Checkpoint**: US1 and US2 both work independently.

---

## Phase 5: User Story 3 - FAQs flow (Priority: P2)

**Goal**: BRD 4.5: cache first, blocking spinner, error dialog, double-tap guard.

**Independent Test**: tap "FAQs" with cache (instant), without cache (spinner then list), with an empty list, a non-list, and a failure (dialog "Okay") (P-07, P-08, N-02 to N-05).

### Tests for User Story 3

- [X] T043 [P] [US3] `src/features/nonLoggedInHome/__tests__/LoadingOverlay.test.tsx`: blocks touches while visible, announced to screen readers, hidden when not visible (FR-037, FR-042; BR-12; E-04) **Maps**: FR-037, FR-042 · **Accept**: LoadingOverlay.test.tsx passes and shows a blocking, announced spinner that hides when not visible.
- [X] T044 [P] [US3] `src/features/nonLoggedInHome/__tests__/useFaqFlow.test.tsx`: `faqsFromNonLogin` set true on every tap; cached list opens `Faq` with no request and no spinner; no cache shows the spinner and requests once; non-empty list is stored and opens `Faq`; empty list and non-list stay on Home with no dialog; failure clears the spinner, shows the dialog with "Your request could not be processed at this moment. Request you to try again after sometime." and "Okay", records `dialog_shown` (`dialog_name: faq_error`, `screen: non_logged_home`, `kind: error`); "Okay" lets the user retry and a second attempt succeeds; double tap while loading sends one request; spinner cleared in every outcome (FR-035 to FR-041; BR-6, TV-2, PERF-3; P-07, P-08, N-02 to N-05, N-10; TC-301 to TC-308) **Maps**: FR-035, FR-036, FR-037, FR-038, FR-039, FR-040, FR-041 · **Accept**: useFaqFlow.test.tsx passes and covers cache, fetch, empty, non-list, failure, retry, double tap and spinner clearing.

### Implementation for User Story 3

- [X] T045 [P] [US3] Create `src/features/nonLoggedInHome/components/LoadingOverlay.tsx`: full-screen blocking activity indicator, announced, tokens only (FR-037, FR-042; BR-12) **Maps**: FR-037, FR-042 · **Accept**: LoadingOverlay renders a full-screen blocking announced spinner using tokens only.
- [X] T046 [US3] Create `src/features/nonLoggedInHome/hooks/useFaqFlow.ts` per plan "FAQ flow": read the cache from the `faq` slice, `fetchFaq()` from `src/services/faqService.ts`, `loading` ref guard, `finally` clears the overlay, dispatch `setFaqItems` only for a non-empty list, error dialog state, analytics `dialog_shown`, navigation to `Faq` through the guarded hook (FR-035 to FR-041; BR-6, TV-2, PERF-3). Depends on T027, T039 (dialog), T045. **Maps**: FR-035, FR-036, FR-037, FR-038, FR-039, FR-040, FR-041 · **Accept**: useFaqFlow implements the cache-first flow with a loading guard, a finally that clears the overlay and the error dialog with dialog_shown.
- [X] T047 [US3] Wire `useFaqFlow`, `LoadingOverlay` and the FAQ error `CommonMessageDialog` into `src/features/nonLoggedInHome/hooks/useHomeActions.ts` (FAQs tile) and `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx` (FR-015, BRD area 4.5; BR-6). Depends on T046. **Maps**: FR-015, FR-035, FR-036, FR-037, FR-038, FR-039, FR-040, FR-041, FR-042 · **Accept**: the FAQs tile, overlay and error dialog are wired into useHomeActions and the screen.

**Checkpoint**: US1, US2 and US3 work independently.

---

## Phase 6: User Story 4 - Customer Care popup (Priority: P3)

**Goal**: BRD 4.6: centred modal popup, three contact routes, focus return.

**Independent Test**: tap "Contact Us"; the popup shows the text exactly; each row hands off and closes; back, outside tap and close return focus to the tile (P-06, E-11).

### Tests for User Story 4

- [X] T048 [P] [US4] `src/features/nonLoggedInHome/__tests__/CustomerCarePopup.test.tsx`: heading and three rows with the exact text; modal for screen readers; "Call Us" opens the dialer for "022-45297300", "Email Us" opens mail to "bhflwecare@bajajhousing.co.in", "Find Us" navigates to `BranchLocator`, popup closes after each; close control, outside tap and back close it and return focus to the "Contact Us" tile; max height is window height minus insets minus 64 and the content scrolls; popup rows meet 44 minimum touch height (FR-043 to FR-047, FR-017; BR-7, BR-12; P-06, E-01, E-02, E-11; TC-205, TC-208, TC-607) **Maps**: FR-017, FR-043, FR-044, FR-045, FR-046, FR-047 · **Accept**: CustomerCarePopup.test.tsx passes and covers the text, modal behaviour, hand-offs, closing, height cap and 44 minimum rows.

### Implementation for User Story 4

- [X] T049 [US4] Create `src/features/nonLoggedInHome/components/CustomerCarePopup.tsx` with the constants text, modal accessibility, focus move-in and return, hand-offs for dialer, mail and `BranchLocator`, close behaviours, scrolling height cap using safe-area insets, tokens only (FR-043 to FR-047; BR-7, BR-12) **Maps**: FR-043, FR-044, FR-045, FR-046, FR-047 · **Accept**: CustomerCarePopup shows the exact text, hands off to dialer, mail and Branch locator, closes, returns focus and caps its height.
- [X] T050 [US4] Wire the popup into `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx` and the "Contact Us" handler in `src/features/nonLoggedInHome/hooks/useHomeActions.ts` (set `isNonLoggedUser` true, open popup over Home, no route change, ref to the tile for focus return) (FR-017, FR-043; BR-7; P-06). Depends on T049. **Maps**: FR-017, FR-043 · **Accept**: Contact Us marks a non-logged user and opens the popup over Home with no route change.

**Checkpoint**: US4 works independently.

---

## Phase 7: User Story 5 - Pay Now, Offers hand-off and focus reset (Priority: P2/P3)

**Goal**: BRD 4.2 (Pay Now, Offers) and 4.9: Pay Now header and back screen; offers state reset on every Home focus.

**Independent Test**: tap "Pay Now", see the header "Pay Now" and a back button, go back to Home; enter offers data, return, reopen Offers and find it empty (P-03, P-05, P-13, E-10, N-11).

### Tests for User Story 5

- [X] T051 [P] [US5] `src/features/nonLoggedInHome/__tests__/PayNowScreen.test.tsx`: header titled "Pay Now", a back button with role and label, back returns to Home, no other content (FR-014; BR-5; P-03, N-11; TC-202) **Maps**: FR-014 · **Accept**: PayNowScreen.test.tsx passes and shows header "Pay Now", a back button, back to Home and no other content.
- [X] T052 [P] [US5] `src/features/nonLoggedInHome/__tests__/useFocusReset.test.tsx`: on every focus dispatches `resetOffersForm`, `clearSelectedOffer` and `setRegisterNowReturnScreen(null)`; runs again on a second focus (returns from Offers, the Offers failure screen's "Ok", FAQ back, Pay Now back); does not clear `faq.items` or the non-logged token; no service call (FR-062 to FR-065; BR-11; P-13, E-10; TC-504, TC-505, TC-506) **Maps**: FR-062, FR-063, FR-064, FR-065 · **Accept**: useFocusReset.test.tsx passes and shows the three resets on every focus and no service call or FAQ and token clearing.

### Implementation for User Story 5

- [X] T053 [P] [US5] Create `src/features/nonLoggedInHome/PayNowScreen.tsx`: header titled "Pay Now" from constants and a back button only; no web view, no loader, no network (FR-014; BR-5) **Maps**: FR-014 · **Accept**: PayNowScreen shows header "Pay Now" and a back button only, with no web view, loader or network.
- [X] T054 [P] [US5] Create `src/features/nonLoggedInHome/hooks/useFocusReset.ts`: one focus effect with the three dispatches (FR-062 to FR-065; BR-11) **Maps**: FR-062, FR-063, FR-064, FR-065 · **Accept**: useFocusReset dispatches the three resets on every focus.
- [X] T055 [US5] Register `NonLoggedInPayNow` in `src/navigation/RootNavigator.tsx` with the header and back button options and add the "Pay Now" tile target (`{ title: 'Pay Now' }`) in `src/features/nonLoggedInHome/hooks/useHomeActions.ts` (FR-014; BR-5; P-03). Depends on T053, T032, T006. **Maps**: FR-014 · **Accept**: NonLoggedInPayNow is registered with header and back options and the Pay Now tile opens it with title Pay Now.
- [X] T056 [US5] Use `useFocusReset` in `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx` (BRD area 4.9; BR-11). Depends on T054. **Maps**: FR-062, FR-063, FR-064, FR-065 · **Accept**: the Home screen uses useFocusReset so the reset runs on every focus.

**Checkpoint**: US5 works independently.

---

## Phase 8: User Story 6 - Android back and exit confirmation (Priority: P3)

**Goal**: BRD 4.8: exit dialog on Android back; popups and dialogs close first.

**Independent Test**: on Android press back on Home: dialog; "CANCEL" stays; "Okay" exits; with the popup open, back closes it first (P-11, P-12, E-11).

### Tests for User Story 6

- [X] T057 [P] [US6] `src/features/nonLoggedInHome/__tests__/ExitConfirmDialog.test.tsx`: "Are you sure you want to exit!" with "CANCEL" and "Okay"; handlers; announced (FR-058, FR-059; BR-10; P-11, P-12; TC-501, TC-502) **Maps**: FR-058, FR-059 · **Accept**: ExitConfirmDialog.test.tsx passes and shows the exit text, CANCEL and Okay handlers and announcement.
- [X] T058 [P] [US6] `src/features/nonLoggedInHome/__tests__/useExitConfirm.test.tsx`: Android back with nothing open shows the dialog; "CANCEL" closes it; "Okay" exits the app; with the Contact Us popup or any dialog open, back closes that first and a second back shows the exit dialog; handler registered only while Home is focused and removed on blur; iOS registers nothing (FR-058 to FR-061; BR-10; P-11, P-12, E-11; TC-501, TC-502, TC-503) **Maps**: FR-058, FR-059, FR-060, FR-061 · **Accept**: useExitConfirm.test.tsx passes and covers the precedence of popup, dialog and exit dialog, blur removal and iOS.

### Implementation for User Story 6

- [X] T059 [P] [US6] Create `src/features/nonLoggedInHome/components/ExitConfirmDialog.tsx` (FR-058, FR-059; BR-10) **Maps**: FR-058, FR-059 · **Accept**: ExitConfirmDialog shows "Are you sure you want to exit!" with CANCEL and Okay.
- [X] T060 [US6] Create `src/features/nonLoggedInHome/hooks/useExitConfirm.ts`: hardware-back handler with the precedence above, registered on focus and removed on blur (FR-058 to FR-061; BR-10). Depends on T059. **Maps**: FR-058, FR-059, FR-060, FR-061 · **Accept**: useExitConfirm registers the back handler on focus, removes it on blur and applies the close-first precedence.
- [X] T061 [US6] Wire `useExitConfirm` and `ExitConfirmDialog` into `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx`, passing the open state of the popup, FAQ dialog, version dialog and exit dialog so the precedence holds (FR-060; BR-10; E-11). Depends on T060, T042, T047, T050. **Maps**: FR-060 · **Accept**: the screen passes the open state of the popup, FAQ dialog, version dialog and exit dialog so back precedence holds.

**Checkpoint**: all six stories work independently.

---

## Phase 9: Accessibility pass (BRD 7.4, BR-12)

**Purpose**: prove FR-066 to FR-069 across the whole screen.

- [X] T062 [P] Write `src/features/nonLoggedInHome/__tests__/accessibility.test.tsx`: reading order is headline, six tiles row-wise, "Login"; six tiles and "Login" are role `button` with labels equal to visible text; illustration and tile icons hidden; popup modal; spinner and FAQ failure dialog announced; every touch target at least 44 x 44; at font scale 1.5 and 2 tiles stack with no fixed text height; no hard-coded colour in the feature (FR-066 to FR-069, FR-002, FR-011, FR-042, FR-044; BR-12; E-01 to E-04; TC-601, TC-602, TC-603, TC-604, TC-606, TC-607) **Maps**: FR-002, FR-011, FR-042, FR-044, FR-066, FR-067, FR-068, FR-069 · **Accept**: accessibility.test.tsx passes and covers reading order, roles, hidden decoration, popup modal, announcements, 44 x 44 and stacking.
- [X] T063 Fix every failure T062 reveals in the feature's components under `src/features/nonLoggedInHome/components/` and `src/features/nonLoggedInHome/NonLoggedInHomeScreen.tsx` (BRD area 7.4; BR-12). Depends on T062. **Maps**: FR-066, FR-067, FR-068, FR-069 · **Accept**: every failure found by T062 is fixed in the feature components, or the task is skipped because all passed.
- [X] T064 [P] Add a theme test in `src/theme/__tests__/tokens.test.ts` that dark and high-contrast sets resolve for every token the feature reads and that the illustration and CTA gradient are exempt from remapping; record that remapped values are an open Design item (FR-006, FR-023, FR-068; BR-12; E-03; TC-605) **Maps**: FR-006, FR-023, FR-068 · **Accept**: the theme test shows dark and high-contrast sets resolve for every feature token and the CTA gradient is exempt, with remapped values recorded as an open Design item.
- [X] T065 Record the manual accessibility checks M-10 to M-13 from `quickstart.md` (TalkBack, VoiceOver, text 2x with 0.36em spacing and 2x line height, dark mode, high contrast, 320 x 568, tablet) with steps, expected result and owner in `specs/002-non-logged-in-home-page/checklists/manual-checks.md` (BRD area 7.4; BR-12; E-02 to E-06; constitution Delivery Standards) **Maps**: FR-066, FR-067, FR-068, FR-069 · **Accept**: manual-checks.md lists M-10 to M-13 with steps, expected result and owner.

---

## Phase 10: Polish and cross-cutting

- [X] T066 [P] Add a guard test `src/features/nonLoggedInHome/__tests__/isolation.test.ts` that fails if any file under `src/features/nonLoggedInHome/` imports from `src/features/nonLoggedHome/`, contains a raw `#` hex or `rgb(` colour, a direct `axios` or `fetch` call, or a literal user-facing string outside `nonLoggedInHomeConstants.ts` (plan Structure Decision; constitution I, II, V) **Maps**: FR-001, FR-003, FR-028 · **Accept**: isolation.test.ts passes and fails on any import from nonLoggedHome, raw colour, direct axios or fetch, or literal UI string outside the constants file.
- [X] T067 Run `npx tsc --noEmit` and `npm run lint`; fix findings in files this feature added or edited; no `any` without a justified suppression (constitution VI, VII) **Maps**: FR-001, FR-010, FR-020, FR-025, FR-035, FR-043, FR-048, FR-058, FR-062, FR-066 · **Accept**: npx tsc --noEmit and npm run lint report no finding in files this feature added or edited.
- [X] T068 Run `npm test` and confirm no previously passing test is skipped or broken, in particular `src/services/__tests__/httpClient.test.ts` and everything under `src/features/nonLoggedHome/` (constitution VII; zero regressions) **Maps**: FR-001, FR-010, FR-020, FR-025, FR-035, FR-043, FR-048, FR-058, FR-062, FR-066 · **Accept**: npm test passes with no previously passing test skipped or broken.
- [X] T069 [P] Verify cleanup and performance: no timers, listeners or subscriptions left after unmount (back handler, focus listener, navigation lock timer); loaders clear on success, failure and cancel; no animation loops; a repeat-navigation test of 50 open and close cycles shows no growth in listener count (PERF-3, PERF-5; constitution VIII; TC-703) **Maps**: FR-061, FR-071 · **Accept**: lifecycle.test.tsx passes and shows no listener, timer or subscription remains after 50 mount and unmount cycles.
- [X] T070 [P] Security check: no credential, token or header value is logged in any new file; `X-BHFL-Auth` absent in all new request code; token mirrored to storage only through `src/services/authService.ts` (FR-026, FR-034; BRD 6.4, 7.3; constitution IV) **Maps**: FR-026, FR-034 · **Accept**: a review finds no credential, token or header value logged and no X-BHFL-Auth in new request code.
- [ ] T071 Run the manual scenarios M-1 to M-14 in `specs/002-non-logged-in-home-page/quickstart.md` on Android and iOS; record owner, result and date in `specs/002-non-logged-in-home-page/checklists/manual-checks.md`; PERF-1 (2 s) and PERF-4 (200 ms) are pass or fail (all stories; TC-701, TC-702, TC-801) **Maps**: FR-005, FR-008, FR-044, FR-046, FR-066, FR-067, FR-068, FR-069, FR-070, FR-072 · **Accept**: a person runs M-1 to M-14 on Android and iOS and records owner, result and date in manual-checks.md; PERF-1 and PERF-4 are pass or fail.
- [X] T072 Re-run the spec checklist in `specs/002-non-logged-in-home-page/checklists/requirements.md`, list every spec "Open Clarifications" item still open in the release notes, and raise the BRD change request for the owner overrides (no WebView, Pay Now header and back only, no popup on version 401, no `X-BHFL-Auth`) (plan Constitution Check IX) **Maps**: FR-014, FR-034, FR-055 · **Accept**: the spec checklist is re-run, open clarifications are listed in the release notes and the BRD change request for the owner overrides is raised.
- [X] T073 Build the requirement-to-test traceability table in `specs/002-non-logged-in-home-page/checklists/traceability.md` mapping every FR, BR, TV and P-/N-/E- scenario to its task and test file (constitution I and G4) **Maps**: FR-001, FR-010, FR-020, FR-025, FR-035, FR-043, FR-048, FR-058, FR-062, FR-066 · **Accept**: traceability.md maps every FR, BR, TV and scenario to its task and test file.

## Phase 11: Retrofit Tests

**Purpose**: new unit tests for QA cases that no existing test proved. Each carries `// Covers: <QA-ID> - <note>` above it and passed in the coverage run (see `coverage-report.md`). No production code was changed.

- [X] T074 [HOME_LAYOUT_TC_001] in `NonLoggedInHomeScreen.test.tsx`: the page paints `#035795` (token) and the tiles sit three per row **Maps**: FR-001, FR-010, FR-020 · **Accept**: the new test passes and asserts the page colour and two rows of three tiles at default text size.
- [X] T075 [HOME_LAYOUT_TC_003] in `NonLoggedInHomeScreen.test.tsx`: Home draws and Login works while the token and version calls are both pending **Maps**: FR-007, FR-049 · **Accept**: the new test passes with no loader, no dialog and Login navigating while both calls are pending.
- [X] T076 [HOME_STATE_TC_002] in `NonLoggedInHomeScreen.test.tsx`: every quick action stays available after the token request succeeds **Maps**: FR-025, FR-015 · **Accept**: the new test passes with seven buttons, none disabled, and Offers navigating.
- [X] T077 [HOME_STATE_TC_003] in `NonLoggedInHomeScreen.test.tsx`: a failed token request shows no error and Home stays usable **Maps**: FR-030, FR-032 · **Accept**: the new test passes with no error text, no Okay button, no loader and seven buttons.
- [X] T078 [HOME_TOKEN_TC_005] in `NonLoggedInHomeScreen.test.tsx`: FAQ error dialog after a failed token request **Maps**: FR-037, FR-040 · **Accept**: the new test passes with fetchFaq called once and the exact error dialog shown.
- [X] T079 [HOME_CONTACT_TC_006] in `NonLoggedInHomeScreen.test.tsx`: rapid Contact Us taps open one popup **Maps**: FR-043, FR-017 · **Accept**: the new test passes with exactly one popup after three taps.
- [X] T080 [HOME_FAQ_TC_006] in `NonLoggedInHomeScreen.test.tsx`: Okay on the FAQ error dialog keeps the user on Home **Maps**: FR-040 · **Accept**: the new test passes with the dialog closed and no navigation.
- [X] T081 [HOME_NET_TC_001] in `NonLoggedInHomeScreen.test.tsx`: Home renders fully with no network **Maps**: FR-007 · **Accept**: the new test passes with seven buttons, no error and Offers still navigating while token and version reject.
- [X] T082 [HOME_NET_TC_002] in `NonLoggedInHomeScreen.test.tsx`: FAQs with no network shows the error dialog and clears the spinner **Maps**: FR-040 · **Accept**: the new test passes with the exact dialog and no overlay.
- [X] T083 [HOME_NET_TC_004] in `NonLoggedInHomeScreen.test.tsx`: network lost mid FAQ fetch **Maps**: FR-040 · **Accept**: the new test passes with the spinner shown first, then cleared, the dialog shown and no navigation.
- [X] T084 [HOME_NET_TC_007] in `NonLoggedInHomeScreen.test.tsx`: Login inside the scrolling content at 320 x 568 **Maps**: FR-005, FR-008 · **Accept**: the new test passes with Login inside the scroll view and no fixed content height.
- [X] T085 [HOME_CONTACT_TC_003] in `NonLoggedInHomeScreen.test.tsx`: accessibility focus returns to the Contact Us tile node **Maps**: FR-046 · **Accept**: the new test passes with setAccessibilityFocus called with the node whose label is "Contact Us".
- [X] T086 [HOME_CONTACT_TC_004] in `CustomerCarePopup.test.tsx`: exact height cap and unclipped text at 2x font scale **Maps**: FR-047 · **Accept**: the new test passes with maxHeight 576 at window height 640 and no fixed text heights.
- [X] T087 [HOME_BACK_TC_005] in `useFaqFlow.test.tsx`: the FAQ back flag is set on the fetch path **Maps**: FR-035 · **Accept**: the new test passes with faqsFromNonLogin false before and true after a fetched list.
- [X] T088 [HOME_TOKEN_TC_006] in `generatetokenContract.test.ts`: no credential or token reaches the console **Maps**: FR-026 · **Accept**: the new test passes with no console call containing a credential or the token on success or failure.

## Phase 12: Retrofit Gaps

**Purpose**: work that no unit test can prove today. Nothing here is implemented by the retrofit.

- [ ] T089 Retrofit gap HOME_BACK_TC_005: when the FAQ screen module exists, add a test that FAQ back returns to Home when `faqsFromNonLogin` is true; blocked, FAQ screen module is not in this repo **Maps**: FR-035, FR-065 · **Accept**: the FAQ module test passes and shows its back action lands on Home when the flag is set.
- [ ] T090 Retrofit gap HOME_RESET_TC_003: when the Register Now module exists, add a test that its CIF field is not pre-filled or locked after Home reset the return flag; blocked, Register Now module is not in this repo **Maps**: FR-064 · **Accept**: the Register Now module test passes and shows the CIF field is unlocked when the return flag is null.
- [ ] T091 Open item FR-008: tablet and wide-screen layout; not built, awaiting O-13 (also the out-of-scope case HOME_NET_TC_008) **Maps**: FR-008 · **Accept**: Design supplies the tablet rules, a layout test exists for them and HOME_NET_TC_008 is mapped to it.
- [ ] T092 Open item FR-009: screen_view analytics event for Home; not built, awaiting O-08 **Maps**: FR-009 · **Accept**: Analytics decides whether Home records screen_view; if yes an analytics test and the event exist, if no the requirement is closed.
- [ ] T093 Open item FR-031: per-environment base URLs for the token, FAQ and version services; not built as a decision, awaiting O-09 **Maps**: FR-031 · **Accept**: Backend and DevOps confirm the base URLs per environment and the build configuration and service tests use them.

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

Counts: 71 QA cases = 56 covered + 7 partial + 2 manual + 0 gap + 5 divergent + 0 qa-suspect + 1 out-of-scope (the parts add up to the total).

| TC (id + short description) | Task(s) | Test approach |
|---|---|---|
| HOME_LAYOUT_TC_001 - Verify Home screen shows illustration, headline, six tiles and Login button. | T074, T025, T034 | unit-testable - screen paints the page with #035795 (token), shows the exact 3-line headline, six tiles in rows of three and Login, and has no Register Now, chatbot or accessibility icon |
| HOME_LAYOUT_TC_002 - Verify tile labels and order. | T025, T007, T031 | unit-testable - tile labels and order asserted as exactly Pay Now, Our Products, Track Application, FAQs, Offers, Contact Us, then Login |
| HOME_LAYOUT_TC_003 - Verify Home screen loads without waiting for background calls. | T075, T025, T033, T041 | unit-testable - with the token and the version call both pending, Home shows no loader and no dialog and Login still navigates; token requested once on mount |
| HOME_ACTION_TC_001 - Verify Pay Now action opens the payment portal. | T051, T053, T055 | unit-testable - divergent: case expects a WebView opening the payment portal; plan-stage owner decision 2026-11-06 (O-05, FR-014) opens a Pay Now screen with header "Pay Now" and a back button only, no WebView |
| HOME_ACTION_TC_002 - Verify Our Products action routes to Products. | T024, T032 | unit-testable - Our Products tile navigates to Products |
| HOME_ACTION_TC_003 - Verify Track Application action routes to its destination. | T024, T032 | unit-testable - Track Application tile navigates to TrackApplication (O-03 resolved in the spec: separate flow, Home owns only the hand-off) |
| HOME_ACTION_TC_004 - Verify FAQs action opens FAQ screen. | T044, T025, T046, T047 | unit-testable - FAQs tap opens the Faq route and stores the fetched list |
| HOME_ACTION_TC_005 - Verify Offers action routes to non-logged Offers. | T024, T032 | unit-testable - Offers tile navigates to Offers |
| HOME_ACTION_TC_006 - Verify Contact Us action opens the Customer Care popup. | T025, T048, T049, T050 | unit-testable - Contact Us tap shows "We are here to help!" over Home with no route change |
| HOME_ACTION_TC_007 - Verify Login button routes to Login screen. | T024, T025, T032 | unit-testable - Login press records cta_clicked then navigates to LoginScreen |
| HOME_ACTION_TC_008 - Verify FAQ action fetches content when cache is not available. | T044, T046 | unit-testable - no cache: spinner shows, fetchFaq called once, list stored and Faq opens |
| HOME_ACTION_TC_009 - Verify FAQ action uses cached content when available. | T044, T046 | unit-testable - cached list opens Faq at once with no request and no spinner |
| HOME_ACTION_TC_010 - Verify user returns to Home after closing the Pay Now WebView. | T051, T053 | unit-testable - divergent: case expects a return from the Pay Now WebView; the built Pay Now screen has no WebView, only a back button that returns to Home (FR-014) |
| HOME_NEG_TC_001 - Verify FAQ API failure with no cache shows error. | T044, T025, T046, T047 | unit-testable - FAQ failure clears the spinner, shows the exact error dialog and keeps the user on Home |
| HOME_NEG_TC_002 - Verify Pay Now URL unavailable is handled. | T051, T053 | unit-testable - divergent: case expects a WebView error or fallback for an unavailable portal URL; the spec decision shows no web content, loader or error state on Pay Now (FR-014) |
| HOME_STATE_TC_001 - Verify stale session flags are reset on Home entry. | T052, T054, T056 | unit-testable - on focus the offers form, selected offer and register return flag are reset (FR-062 to FR-064 define the reset set) |
| HOME_STATE_TC_002 - Verify Home works when non-logged token generation succeeds. | T076, T033, T034 | unit-testable - after a successful token request all six tiles and Login are present, not disabled and a tile still navigates |
| HOME_STATE_TC_003 - Verify token generation failure is handled silently. | T077, T013, T033 | unit-testable - token failure is swallowed: no dialog, no Okay button, no loader, seven buttons remain; service resolves quietly for every failure |
| HOME_VER_TC_001 - Verify no dialog when app version is up to date. | T038, T014, T037, T041 | unit-testable - an up-to-date version classifies as none and the dialog renders nothing for none |
| HOME_VER_TC_002 - Verify maintenance dialog is shown. | T037, T038, T040, T041, T042 | unit-testable - maintenance shows the server message with only Exit on Android, is not dismissed by back, and is classified with the server message |
| HOME_VER_TC_003 - Verify mandatory update dialog. | T037, T038, T040 | unit-testable - mandatory shows the exact update text with Update and Exit, cannot be dismissed |
| HOME_VER_TC_004 - Verify Update button opens the store link. | T037, T038, T040 | unit-testable - Update hands target_url to Linking.openURL (the store app itself is the OS) |
| HOME_VER_TC_005 - Verify optional update dialog can be dismissed. | T037, T038, T040 | unit-testable - optional shows Update and Skip; Skip and back dismiss it and the outcome returns to none |
| HOME_VER_TC_006 - Verify update is not enforced when status is not Active. | T014, T041 | unit-testable - an update is enforced only when status is Active; Inactive and lowercase active give none |
| HOME_VER_TC_007 - Verify version 1.8.10 is treated newer than 1.8.9. | T014, T041 | unit-testable - 1.8.10 compares newer than 1.8.9 numerically and classifies as mandatory |
| HOME_VER_TC_008 - Verify 401 from version service shows message and logs out. | T038, T041 | unit-testable - divergent: case expects the server message with "Okay" and a logout on Okay for a 401; spec FR-055 decision shows no popup and clears the logged-in token silently |
| HOME_VER_TC_009 - Verify version call failure or empty body fails open. | T014, T038, T041 | unit-testable - a thrown version call and null, empty or malformed bodies resolve to none (fail open) |
| HOME_VER_TC_010 - Verify version request sends capitalised platform value. | T014, T041 | unit-testable - version request posts the installed version with user_agent exactly Android or iOS |
| HOME_VER_TC_011 - Verify iOS has no Exit button on blocking dialogs. | T037, T040 | unit-testable - on iOS the mandatory dialog shows only Update and the maintenance dialog shows no button; neither is dismissed by back |
| HOME_VER_TC_012 - Verify blocking dialog cannot be dismissed by Android back. | T037, T058, T040, T060 | unit-testable - Android back on a blocking dialog calls no handler and the back event is consumed so the app does not exit |
| HOME_BACK_TC_001 - Verify exit confirmation shows on Android back. | T058, T057, T060, T061 | unit-testable - Android back with nothing open shows "Are you sure you want to exit!" with CANCEL and Okay |
| HOME_BACK_TC_002 - Verify Okay on exit dialog closes the app. | T058, T057, T060 | unit-testable - Okay on the exit dialog calls BackHandler.exitApp once |
| HOME_BACK_TC_003 - Verify CANCEL on exit dialog keeps user on Home. | T058, T057, T060 | unit-testable - CANCEL closes the dialog without exiting and Home stays |
| HOME_BACK_TC_004 - Verify back closes Contact Us popup before exit dialog. | T058, T061, T060 | unit-testable - first back closes the popup only; the next back shows the exit dialog |
| HOME_BACK_TC_005 - Verify FAQ back returns to Home. | T087, T044, T046, T089 | unit-testable - partial: the FAQ back flag faqsFromNonLogin is true on the cache path and the fetch path and the reset runs when Home regains focus; blocked: FAQ screen module (not in this repo) that reads the flag and navigates back |
| HOME_RESET_TC_001 - Verify offers form data is cleared on return to Home. | T052, T017, T054 | unit-testable - focus resets the offers form to empty fullName, mobileNo and tncAccepted false |
| HOME_RESET_TC_002 - Verify selected pre-approved offer is cleared on return to Home. | T052, T017, T054 | unit-testable - focus clears the selected pre-approved offer |
| HOME_RESET_TC_003 - Verify register return flag is cleared on return to Home. | T052, T017, T054, T090 | unit-testable - partial: registerNowReturnScreen is null after focus; blocked: Register Now module (not in this repo) whose CIF field must not be locked by a stale origin |
| HOME_RESET_TC_004 - Verify Offers fail screen Ok returns to Home with reset state. | T052, T054, T056 | unit-testable - the reset runs on every later focus (Offers back, Offers fail Ok, FAQ back) and leaves the offers state empty each time |
| HOME_RESET_TC_005 - Verify focus reset does not clear FAQ cache or token. | T052, T017, T054 | unit-testable - the focus reset leaves the FAQ cache and the non-logged token in the store |
| HOME_CONTACT_TC_001 - Verify popup heading and three rows. | T048, T049 | unit-testable - popup shows the heading and the three rows with their exact details |
| HOME_CONTACT_TC_002 - Verify popup closes with its close control. | T048, T025, T049, T050 | unit-testable - the close control, outside tap and Android back all call onClose; on Home the popup text disappears |
| HOME_CONTACT_TC_003 - Verify focus returns to Contact Us tile after closing popup. | T085, T048, T049 | unit-testable - partial: closing the popup calls setAccessibilityFocus with the node held by the Contact Us tile ref; manual remainder: a person confirms with TalkBack and VoiceOver that focus lands on the tile |
| HOME_CONTACT_TC_004 - Verify popup scrolls at large text sizes. | T086, T048, T049 | unit-testable - partial: card maxHeight is exactly window height minus insets minus 64 (576 at 640) at 2x font scale, content sits in a ScrollView and no Text has a fixed height; manual remainder: a person confirms nothing is clipped on a real device at large text |
| HOME_CONTACT_TC_005 - Verify Call, Email and Find Us tap behaviour. | T048, T049 | unit-testable - Call Us opens tel:02245297300, Email Us opens mailto:bhflwecare@bajajhousing.co.in, Find Us navigates to BranchLocator; popup closes each time |
| HOME_CONTACT_TC_006 - Verify popup opens only once on rapid taps. | T079, T049, T050 | unit-testable - three rapid Contact Us taps leave exactly one popup |
| HOME_TOKEN_TC_001 - Verify Bearer token is sent on FAQ request. | T015, T012, T011 | unit-testable - FAQ request carries Authorization Bearer token plus app-version, platform and device-details headers |
| HOME_TOKEN_TC_002 - Verify token request times out after 10 seconds. | T013, T033 | unit-testable - token request is sent with a 10000 ms timeout and a timeout error resolves quietly; Home stays usable |
| HOME_TOKEN_TC_003 - Verify early FAQ tap waits for in-flight token. | T013, T011 | unit-testable - a call made while the token request is in flight waits and then carries the late Bearer token |
| HOME_TOKEN_TC_004 - Verify relaunch after 15 minutes uses a fresh non-logged token. | T013, T009 | unit-testable - a logged-in token is never returned as the non-logged token and a fresh one is requested |
| HOME_TOKEN_TC_005 - Verify FAQ shows error after token failure. | T078, T044, T046 | unit-testable - token request rejected, FAQ call still made once and its failure shows the error dialog |
| HOME_TOKEN_TC_006 - Verify token request body fields are encrypted. | T088, T013 | unit-testable - username and password are sent only as encrypted values, and no console method receives a credential or the token |
| HOME_TOKEN_TC_007 - Verify token is stored after success. | T013 | unit-testable - token is held in the store and under storage key auth_token_Nonlogged |
| HOME_FAQ_TC_001 - Verify empty FAQ list keeps user on Home with no dialog. | T044, T046 | unit-testable - an empty list stays on Home with no dialog and the spinner cleared |
| HOME_FAQ_TC_002 - Verify non-array FAQ response does not crash. | T015, T044 | unit-testable - every non-array FAQ body resolves to an empty list, so Home stays with no crash |
| HOME_FAQ_TC_003 - Verify double tap on FAQs sends one request. | T044, T046 | unit-testable - three FAQs taps while loading send one request |
| HOME_FAQ_TC_004 - Verify spinner blocks other touches while FAQ loads. | T043, T044, T045 | unit-testable - partial: the loading overlay is a modal, announced layer, swallows Android back and further FAQs taps send no second request; manual remainder: a person confirms on a device that taps outside the spinner are blocked |
| HOME_FAQ_TC_005 - Verify retry after FAQ failure succeeds. | T044, T046 | unit-testable - after a failure and Okay a second tap fetches again and opens Faq |
| HOME_FAQ_TC_006 - Verify Okay on FAQ error dialog keeps user on Home. | T080, T044, T046, T047 | unit-testable - Okay closes the FAQ error dialog, no navigation happens and Login is still shown |
| HOME_FAQ_TC_007 - Verify spinner always clears on FAQ failure or timeout. | T044, T046, T025 | unit-testable - spinner state is false and the overlay is gone after a failed fetch, with the dialog shown |
| HOME_NET_TC_001 - Verify Home renders with no network. | T081, T034 | unit-testable - with token and version rejecting offline, Home renders all seven buttons and the illustration, shows no error and Offers still navigates |
| HOME_NET_TC_002 - Verify FAQs with no network shows error. | T082, T044, T046 | unit-testable - a Network Error on the FAQ call shows the exact error dialog and clears the spinner |
| HOME_NET_TC_003 - Verify Pay Now with no network shows WebView error. | T051, T053 | unit-testable - divergent: case expects a WebView error state with no network; spec decision: no WebView, Pay Now still opens with no network content (FR-014, N-10) |
| HOME_NET_TC_004 - Verify network lost mid FAQ fetch. | T083, T046 | unit-testable - a request that fails after the spinner shows clears the spinner, shows the dialog and does not navigate |
| HOME_NET_TC_005 - Verify rapid taps on different tiles open one destination. | T023, T024, T025, T027 | unit-testable - rapid taps on Offers, Our Products and Login produce a single navigate call |
| HOME_NET_TC_006 - Verify rapid taps on the same tile do not duplicate screens. | T023, T027 | unit-testable - two presses of the same tile navigate once (one stack entry) until focus returns |
| HOME_NET_TC_007 - Verify layout on small screen 320 x 568. | T084, T034 | unit-testable - partial: at 320 x 568 Login is inside the ScrollView content, the indicator is hidden and the content container has no fixed height; manual remainder: a person confirms nothing is clipped and Login is reachable on a real small device |
| HOME_NET_TC_008 - Verify layout on tablet or wide screen. | T091, T071 | out-of-scope - tablet / wide-screen layout rules are an open BRD item (O-13, FR-008); nothing to test until Design decides |
| HOME_NET_TC_009 - Verify cold start time to interactive. | T071 | manual - cold-start time to interactive (PERF-1, 2 s, owner-set) is device timing on a mid-range device; no unit test can measure it |
| HOME_NET_TC_010 - Verify no memory growth when opening and closing tiles repeatedly. | T069, T071 | unit-testable - partial: after 50 mount and unmount cycles every back and navigation listener added is removed; manual remainder: a person profiles memory over repeated open and close on a device |
| HOME_NET_TC_011 - Verify Android and iOS parity. | T071 | manual - Android and iOS layout and flow parity needs both platforms on real devices; unit tests only fake Platform.OS |
